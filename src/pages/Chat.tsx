import React from 'react';
import ConversationList from '../components/ConversationList'; 
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const Chat: React.FC = () => {
  const currentConversationId = useSelector((state: RootState) => state.conversations.currentConversationId);
  const conversationsSelect = useSelector((state: RootState) => state.conversations.conversations);
  const conversations = Array.isArray(conversationsSelect)
    ? conversationsSelect
    : [];
  console.log('Chat.tsx: Value of conversations:', conversations);
  console.log('Chat.tsx: Type of conversations:', typeof conversations);
  console.log('Chat.tsx: Is conversations an Array?', Array.isArray(conversations));
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  return (
    <div className="flex h-full">
      <ConversationList /> 
      <div className="flex-grow flex flex-col p-4 bg-gray-900 text-gray-100">
        {currentConversation ? (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Chat with: {currentConversation.name || currentConversation.participants.map(p => p.username).join(', ')}
            </h2>
            <div className="flex-grow bg-gray-800 rounded-lg p-4 overflow-y-auto">
              <p>Messages for Conversation ID: {currentConversationId}</p>
              <p>Implement your MessageList component here!</p>
              {[...Array(20)].map((_, i) => (
                <div key={i} className="mb-2 p-2 bg-gray-700 rounded">
                  This is message {i + 1} in conversation {currentConversation.name || currentConversation.id}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full p-3 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200">
                Send
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
