import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  updateConversationLastReadAt,
} from '../store/slices/conversationSlice';
import {
  fetchAllConversations,
  markConversationAsRead,
} from '../../api/conversations';
import { getConversationMessages } from "../../api/messages";
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList';
import ProfileComponent from '../components/ProfileComponent';
import { setOnlineUsers, updateUserStatus } from '../store/slices/userStatusSlice';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  conversationId: number;
  sender: { id: number; username: string, profileId: number };
  content: string;
  createdAt: string;
}

const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

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
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const [isLocalUserTyping, setIsLocalUserTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [profileUser, setProfileUser] = useState(null)
  const [lastRead, setLastRead] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getConversations = async () => {
      if (!currentUser?.id) {
        return;
      }
      if (!conversationsLoading && conversations.length === 0) {
        dispatch(fetchConversationsRequest());
        try {
          const token = localStorage.getItem('authToken');
          if (!token) navigate("/login");
          const data = await fetchAllConversations(token);
          dispatch(setConversations(data.conversations));
        } catch (err: any) {
          dispatch(fetchConversationsFailure(err.message || 'Failed to load conversations.'));
        }
      }
    };
    getConversations();
  }, [dispatch, currentUser?.id, conversationsLoading, conversations.length]);

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
      conversations.forEach(c => newSocket.emit('join_conversation', c.id));
    });

    newSocket.on('connect_error', () => {
      setSocketConnected(false);
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
      setTypingUsers(new Map());
    });

    newSocket.on('initial_online_users', (data: { userIds: number[] }) => {
      dispatch(setOnlineUsers(data))
    })

    newSocket.on('user:status', (data: { userId: number, status: string }) => {
      dispatch(updateUserStatus(data));
    })

    newSocket.on('typing:start', (data: { conversationId: number; userId: number; username: string }) => {
      if (data.conversationId === currentConversationId && data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.username);
          return newMap;
        });
      }
    });

    newSocket.on('typing:stop', (data: { conversationId: number; userId: number }) => {
      if (data.conversationId === currentConversationId) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    });

    newSocket.on('message:new', (newMessage: Message, newConversation: any) => {
      console.log(newMessage);
      dispatch(addNewMessage(newMessage));
      if (newMessage.conversationId === currentConversationId) {
        const now = new Date().toISOString();
        dispatch(updateConversationLastReadAt({
          conversationId: newMessage.conversationId,
          userId: currentUser.id,
          lastReadAt: now,
        }));
      }
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(newMessage.sender.id);
        return newMap;
      });
    }
    );

    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.off('disconnect');
        newSocket.off('typing:start');
        newSocket.off('typing:stop');
        newSocket.off('message:new');
        newSocket.disconnect();
        socketRef.current = null;
        setIsLocalUserTyping(false);
      }
    };
  }, [dispatch, currentUser?.id, conversations]);

  useEffect(() => {
    const otherParticipant = currentConversation?.participants.find(
      (participant: any) => participant.userId !== currentUser.id
    );

    if (otherParticipant) {
      setLastRead(otherParticipant.lastReadAt)
    }

    const now = new Date().toISOString();
    dispatch(updateConversationLastReadAt({
      conversationId: currentConversationId,
      userId: currentUser.id,
      lastReadAt: now,
    }));

    const socket = socketRef.current;
    if (socket && socketConnected && currentConversationId !== null) {

      setTypingUsers(new Map());
      setIsLocalUserTyping(false);
      setProfileUser(null);

      const getMessages = async () => {
        if (!currentUser?.id || currentConversationId === null) {
          return;
        }

        dispatch(fetchMessagesRequest());
        try {
          const token = localStorage.getItem('authToken');
          if (!token) navigate("/login");
          const data = await getConversationMessages(currentConversationId, token);
          dispatch(setMessages(data.messages));
        } catch (err: any) {
          dispatch(fetchMessagesFailure(err.message || 'Failed to load messages for this conversation.'));
        }
      };
      markConversationAsRead(currentConversationId)
      getMessages();
    }
    if (currentConversationId === null || !socketConnected) {
      setTypingUsers(new Map());
      setIsLocalUserTyping(false);
    }
  }, [currentConversationId, socketConnected, currentUser?.id, dispatch]);

  const emitTypingStart = useCallback(debounce(() => {
    const socket = socketRef.current;
    if (socket && socketConnected && currentConversationId !== null) {
      socket.emit('typing:start', currentConversationId);
      setIsLocalUserTyping(true);
    }
  }, 500), [socketRef.current, socketConnected, currentConversationId]);

  const emitTypingStop = useCallback(debounce(() => {
    const socket = socketRef.current;
    if (socket && socketConnected && currentConversationId !== null) {
      socket.emit('typing:stop', currentConversationId);
      setIsLocalUserTyping(false);
    }
  }, 1000), [socketRef.current, socketConnected, currentConversationId]);


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
      socket.emit('message:send', messageData, (status: 'success' | 'error', message?: string, newMessage?: Message, newConversation?: any) => {
        if (status === 'success') {
          setMessageContent('');
        } else {
          console.error("[Frontend - handleSendMessage Callback] Failed to send message:", message);
        }
        setIsSending(false);
      });
      setIsSending(false);
      setMessageContent('');
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

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);

    if (e.target.value.length > 0 && !isLocalUserTyping) {
      emitTypingStart();
    }
    else if (e.target.value.length === 0 && isLocalUserTyping) {
      emitTypingStop();
    }
  };

  const handleInputBlur = () => {
    if (isLocalUserTyping) {
      emitTypingStop();
    }
  }

  const getTypingIndicatorText = () => {
    const othersTyping = Array.from(typingUsers.values()).filter(name => name !== currentUser?.username);

    if (othersTyping.length === 0) return null;

    if (othersTyping.length === 1) return `${othersTyping[0]} is typing...`;
    if (othersTyping.length === 2) return `${othersTyping[0]} and ${othersTyping[1]} are typing...`;
    return `${othersTyping.slice(0, 2).join(', ')} and ${othersTyping.length - 2} others are typing...`;
  };

  const handleProfileView = (user: any) => {
    if (profileUser == user) {
      setProfileUser(null);
    } else {
      setProfileUser(user)
    }
  }

  const handleCloseProfile = useCallback(() => {
    setProfileUser(null);
  }, []);

  return (
    <div className="flex h-full p-6 gap-6 bg-gray-50 font-sans antialiased"> {/* Matches Root's main content area background */}
      {/* Conversation List Panel */}
      <div className="w-1/4 bg-white rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden border-2 border-black relative"> {/* Strong border and offset shadow */}
        {/* Removed textures as they are not in the Root component's aesthetic */}
        <ConversationList />
      </div>

      {/* Main Chat Panel */}
      <div className="flex-grow flex flex-col bg-white rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden border-2 border-black relative"> {/* Strong border and offset shadow */}
        {/* Removed textures as they are not in the Root component's aesthetic */}

        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 rounded-none border-b-2 border-black shadow-md shadow-gray-200 flex justify-between items-center z-10"> {/* White header, strong border, subtle shadow */}
              <h1 className="text-xl font-extrabold text-black tracking-tight uppercase">
                {currentConversation.isGroupChat
                  ? currentConversation.name
                  : currentConversation.participants
                    .filter(p => p.user.id !== currentUser?.id)
                    .map(p => (
                      <button key={p.user.id} onClick={() => handleProfileView(p.user)} className="text-gray-800 hover:text-black font-extrabold transition-colors duration-200 hover:underline"> {/* Darker text for participant name */}
                        {p.user.username}
                      </button>
                    ))}
              </h1>
            </div>

            {/* Message List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-0">
              {messagesLoading && <p className="text-center text-gray-800 font-mono text-2xl animate-pulse">Loading notes...</p>}
              {messagesError && <p className="text-center text-red-600 font-mono text-2xl">Error: {messagesError}</p>}
              {!messagesLoading && !messagesError && messages.length === 0 && (
                <p className="text-center text-gray-700 font-mono text-xl italic mt-8"> {/* Adjusted text color */}
                  Start writing your first note!
                </p>
              )}
              {!messagesLoading && !messagesError && messages.length > 0 && (
                <MessageList messages={messages} currentUser={currentUser} lastRead={lastRead} />
              )}
            </div>

            {/* Typing Indicator */}
            {getTypingIndicatorText() && (
              <div className="text-gray-700 text-base font-mono italic mb-4 px-6 font-semibold"> {/* Adjusted text color and weight */}
                {getTypingIndicatorText()}
              </div>
            )}

            {/* Message Input Area */}
            <div className="mt-auto flex gap-4 p-6 bg-gray-100 rounded-none border-t-2 border-black shadow-md shadow-gray-200 z-10"> {/* Light gray input area, strong border, subtle shadow */}
              <input
                type="text"
                placeholder={socketConnected ? "Scribble your message here..." : "Connecting..."}
                value={messageContent}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                disabled={isSending || !socketConnected || messagesLoading}
                className="flex-grow p-3 rounded-none bg-white text-gray-900 font-mono text-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-opacity-80 disabled:opacity-60 disabled:bg-gray-100 placeholder-gray-500 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-150 ease-in-out" 
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !messageContent.trim() || !socketConnected || messagesLoading}
                className={`py-2.5 px-7 border-2 border-black
                ${isSending || !messageContent.trim() || !socketConnected || messagesLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-amber-300 text-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-200 hover:translate-x-1 hover:translate-y-1 active:bg-amber-400'
                  }`}>
                {isSending ? 'Sending...' : 'Pin It'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-black text-center font-mono text-2xl p-10 mt-10 mx-auto bg-white rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] max-w-md border-2 border-black"> 
            Select a note or start a new conversation to begin!
          </p>
        )}
      </div>

      <div className={`fixed inset-y-0 right-0 w-80 lg:w-96 xl:w-1/4 bg-white shadow-xl shadow-black/50 z-50 transform transition-transform duration-300 ease-in-out ${profileUser ? 'translate-x-0' : 'translate-x-full'} rounded-none border-l-2 border-black p-6`}> 
        {profileUser && <ProfileComponent user={profileUser} onClose={handleCloseProfile} />}
      </div>
    </div>
  );
};

export default Chat;