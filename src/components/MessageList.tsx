import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchMessagesRequest, setMessages, fetchMessagesFailure } from '../store/slices/conversationSlice';
import {getConversationMessages } from "../../api/messages"

const MessageList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { messages, messagesLoading, messagesError, currentConversationId } = useSelector(
    (state: RootState) => state.conversations
  );
  const currentUser = useSelector((state: RootState) => state.auth.user); // Assuming currentUser from auth slice

  const messagesEndRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const getMessages = async () => {
      if (currentConversationId) {
        dispatch(fetchMessagesRequest());
        try {
          const token = localStorage.getItem("authToken")
          const data = await getConversationMessages(currentConversationId, token
          );
          dispatch(setMessages(data.messages));
        } catch (err: any) {
          dispatch(fetchMessagesFailure(err.message || 'Failed to load messages.'));
        }
      }
    };

    getMessages();
  }, [dispatch, currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentConversationId) {
    return (
      <p className="text-gray-400 text-center text-xl mt-10">
        Select a conversation to see messages.
      </p>
    );
  }

  if (messagesLoading) {
    return <p className="text-gray-300 text-center mt-4">Loading messages...</p>;
  }

  if (messagesError) {
    return <p className="text-red-400 text-center mt-4">Error: {messagesError}</p>;
  }

  return (
    <div className="flex-grow bg-gray-800 rounded-lg p-4 overflow-y-auto custom-scrollbar">
      {messages.length === 0 && (
        <p className="text-gray-400 text-center">No messages yet. Send the first one!</p>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-3 ${
            message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg shadow-md ${
              message.sender.id === currentUser.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            <p className="font-semibold text-sm mb-1">
              {message.sender.id === currentUser.id ? 'You' : message.sender.username}
            </p>
            <p>{message.content}</p>
            <span className="block text-right text-xs text-gray-400 mt-1">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} /> 
    </div>
  );
};

export default MessageList;