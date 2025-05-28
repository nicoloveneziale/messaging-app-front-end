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
   <div className="flex h-full bg-dark-gray-bg text-light-gray-text">

  <div className="w-1/4 bg-medium-gray p-4 border-r border-gray-700 overflow-y-auto custom-scrollbar rounded-lg m-2">
    <ConversationList />
  </div>

  <div className="flex-grow flex flex-col p-4 bg-medium-gray text-light-gray-text m-2 rounded-lg shadow-lg">
    {currentConversation ? (
      <>
        <MessageList />

        <div className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-grow p-3 rounded-lg bg-gray-700 text-light-gray-text border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50 placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageContent.trim()}
            className={`py-2 px-6 rounded-lg transition duration-200 font-semibold ${
              isSending || !messageContent.trim()
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