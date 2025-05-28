import React, { useEffect, useState, useRef } from 'react'; 
import { useSelector, useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client'; 
import type { RootState, AppDispatch } from '../store/store';
import {
  addNewMessage, 
  setMessages, 
  fetchMessagesRequest, 
  fetchMessagesFailure, 
  fetchConversationsRequest,
  setConversations,
  fetchConversationsFailure,
} from '../store/slices/conversationSlice';
import {
  fetchAllConversations, 
} from '../../api/conversations'; 
import {getConversationMessages} from "../../api/messages";
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList';

interface Message {
  id: number;
  conversationId: number;
  sender: { id: number; username: string };
  content: string;
  createdAt: string; 
}

const Chat: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    conversations: conversationsFromState, 
    currentConversationId,
    messages, 
    messagesLoading, 
    messagesError, 
    loading: conversationsLoading, 
    error: conversationsError, 
  } = useSelector((state: RootState) => state.conversations);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const conversations = Array.isArray(conversationsFromState)
    ? conversationsFromState
    : [];
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false); 

  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  //Setts emitters and initializes socket
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const socketUrl = 'http://localhost:8080';
    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
    });

    socketRef.current = newSocket; 

    newSocket.on('connect', () => {
      setSocketConnected(true);
    });

    newSocket.on('connect_error', () => {
      setSocketConnected(false);
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
    });

    newSocket.on('message:new', (newMessage: Message) => {
      if (newMessage.conversationId === currentConversationId) {
        dispatch(addNewMessage(newMessage));
      }
    });

    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.off('disconnect');
        newSocket.off('message:new');
        newSocket.disconnect(); 
        socketRef.current = null;
      }
    };
  }, [dispatch, currentUser?.id, currentConversationId]); 


  useEffect(() => {
    const getConversations = async () => {
      if (!currentUser?.id) {
        return;
      }
      if (!conversationsLoading && conversations.length === 0) {
        dispatch(fetchConversationsRequest());
        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('Authentication token not found.');
          const data = await fetchAllConversations(token);
          dispatch(setConversations(data.conversations));
        } catch (err: any) {
          dispatch(fetchConversationsFailure(err.message || 'Failed to load conversations.'));
        }
      }
    };
    getConversations();
  }, [dispatch, currentUser?.id, conversationsLoading, conversations.length]);

  //Joining a new conversation
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socketConnected && currentConversationId !== null) {
      socket.emit('join_conversation', currentConversationId);

      const getMessages = async () => {
        if (!currentUser?.id || currentConversationId === null) {
          return;
        }

        dispatch(fetchMessagesRequest());
        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('Authentication token not found.');
          const data = await getConversationMessages(currentConversationId, token);
          dispatch(setMessages(data.messages)); 
        } catch (err: any) {
          dispatch(fetchMessagesFailure(err.message || 'Failed to load messages for this conversation.'));
        }
      };
      getMessages();
    }
  }, [currentConversationId, socketConnected, currentUser?.id, dispatch]); 

  const handleSendMessage = async () => {
    const socket = socketRef.current;
    if (!messageContent.trim() || !currentConversationId || isSending || !socket || !socketConnected) {
      return;
    }
    setIsSending(true);
    try {
      const messageData = {
        conversationId: currentConversationId,
        content: messageContent,
      };

      socket.emit('message:send', messageData, (status: 'success' | 'error', message?: string, newMessage?: Message) => {
        if (status === 'success') {
          setMessageContent(''); 
        } 
        setIsSending(false); 
      });
    } catch (error) {
      console.error('Unexpected error while preparing to send message:', error);
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-dark-gray-bg text-light-gray-text">
      <div className="w-1/4 bg-medium-gray p-4 border-r border-gray-700 overflow-y-auto custom-scrollbar rounded-lg m-2">
        <ConversationList />
      </div>
      <div className="flex-grow flex flex-col p-4 bg-medium-gray text-light-gray-text m-2 rounded-lg shadow-lg">
        {currentConversation ? (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {messagesLoading && <p className="text-center text-gray-400">Loading messages...</p>}
              {messagesError && <p className="text-center text-red-400">Error: {messagesError}</p>}
              {!messagesLoading && !messagesError && messages.length === 0 && (
                <p className="text-center text-gray-400">No messages yet. Say hello!</p>
              )}
              {!messagesLoading && !messagesError && messages.length > 0 && (
                <MessageList messages={messages} currentUser={currentUser} />
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder={socketConnected ? "Type your message..." : "Connecting to chat..."}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending || !socketConnected || messagesLoading} 
                className="flex-grow p-3 rounded-lg bg-gray-800 text-light-gray-text border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50 placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !messageContent.trim() || !socketConnected || messagesLoading} 
                className={`py-2 px-6 rounded-lg transition duration-200 font-semibold ${
                  isSending || !messageContent.trim() || !socketConnected || messagesLoading
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-accent-blue hover:bg-blue-600 text-white' 
                } shadow-md`}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center text-xl mt-10 p-4 rounded-lg bg-gray-800">
            Select a conversation or start a new one!
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;