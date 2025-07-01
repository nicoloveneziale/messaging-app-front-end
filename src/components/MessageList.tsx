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

  const userMessageBgColor = 'bg-amber-100';
  const otherMessageBgColor = 'bg-blue-100';

  const userMessageBorderColor = 'border-amber-300';
  const otherMessageBorderColor = 'border-blue-300';

  const userMessageShadowColor = 'shadow-amber-200/50';
  const otherMessageShadowColor = 'shadow-blue-200/50';

  const userMessageTextColor = 'text-amber-900';
  const otherMessageTextColor = 'text-blue-900';


  return (
    <div className="flex-grow h-full p-4 overflow-y-scroll custom-scrollbar font-sans antialiased">
      {messages.length === 0 ? (
        <p className="text-gray-600 text-center font-mono text-xl italic mt-4">
          No notes on this board yet. Send the first one!
        </p>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.sender.id === currentUser.id;

          const bgColor = isCurrentUser ? userMessageBgColor : otherMessageBgColor;
          const borderColor = isCurrentUser ? userMessageBorderColor : otherMessageBorderColor;
          const shadowColor = isCurrentUser ? userMessageShadowColor : otherMessageShadowColor;
          const textColor = isCurrentUser ? userMessageTextColor : otherMessageTextColor;

          const rotation = (message.id % 5) - 2;

          return (
            <div
              key={message.id}
              className={`flex flex-col mb-4 relative
                ${isCurrentUser ? 'items-end' : 'items-start'}
              `}
            >
              <div
                className={`
                  max-w-[75%] py-2.5 px-4 rounded-lg
                  shadow-[4px_4px_0px_rgba(0,0,0,0.8)]
                  ${bgColor} ${textColor}
                  border-2 border-black
                  transform rotate-[${rotation}deg]
                  transition-all duration-150 ease-out
                  relative
                `}
              >
                <p className={`font-extrabold text-sm mb-1 ${isCurrentUser ? 'text-amber-800' : 'text-blue-800'}`}>
                  {isCurrentUser ? 'You' : message.sender.username}
                </p>
                <p className="font-mono text-lg break-words">{message.content}</p>
                <span className="block text-right text-xs mt-1 font-mono opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {isCurrentUser && message.id === lastReadMessageIdByOtherUser && (
                <div className="text-right text-xs text-gray-500 font-mono italic mt-1 pr-1">
                  <span className="bg-white rounded px-2 py-0.5 shadow-sm border border-gray-300">
                    Read
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;