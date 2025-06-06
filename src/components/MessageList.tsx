import React, { useEffect, useRef } from 'react';

interface Message {
  id: number;
  conversationId: number;
  sender: { id: number; username: string };
  content: string;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  currentUser: { id: number; username: string };
  lastRead: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, lastRead }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  const lastReadDate = lastRead ? new Date(lastRead) : null;

  let lastReadMessageIdByOtherUser: number | null = null;

  if (lastReadDate && messages.length > 0) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.sender.id === currentUser.id && new Date(message.createdAt) <= lastReadDate) {
        lastReadMessageIdByOtherUser = message.id;
        break;
      }
    }
  }

  return (
    <div className="flex-grow bg-gray-800 h-full rounded-lg p-4 overflow-y-scroll custom-scrollbar">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center">No messages yet. Send the first one!</p>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-3 ${
              message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] py-2 px-4 rounded-lg shadow-md ${
                message.sender.id === currentUser.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="font-semibold text-sm mb-1">
                {message.sender.id === currentUser.id ? 'You' : message.sender.username}
              </p>
              <p>{message.content}</p>
              <span className="block text-right text-xs mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {message.sender.id === currentUser.id && message.id === lastReadMessageIdByOtherUser && (
                <div className="text-right text-xs text-gray-300 mt-1 flex items-center justify-end">
                  <span>Read</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;