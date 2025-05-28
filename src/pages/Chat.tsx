import React, { useState } from 'react';
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList'; 
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { addNewMessage } from '../store/slices/conversationSlice'; 
import { createMessage } from '../../api/messages'; 

const Chat: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const currentConversationId = useSelector((state: RootState) => state.conversations.currentConversationId);
  const conversationsSelect = useSelector((state: RootState) => state.conversations.conversations);

  const conversations = Array.isArray(conversationsSelect)
    ? conversationsSelect
    : [];
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !currentConversationId || isSending) {
      return; 
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem("authToken")
      const newMessage = await createMessage(currentConversationId, messageContent, token);
      dispatch(addNewMessage(newMessage.message)); 
      setMessageContent(''); 
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
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
    <div className="flex h-full">
      <ConversationList />
      <div className="flex-grow flex flex-col p-4 bg-gray-900 text-gray-100">
        {currentConversation ? (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Chat with: {currentConversation.name || currentConversation.participants.map(p => p.user.username).join(', ')}
            </h2>
            <MessageList />
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="flex-grow p-3 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !messageContent.trim()}
                className={`py-2 px-6 rounded transition duration-200 font-semibold ${
                  isSending || !messageContent.trim()
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center text-xl mt-10">
            Select a conversation or start a new one!
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;