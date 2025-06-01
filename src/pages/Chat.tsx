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
} from '../store/slices/conversationSlice';
import {
  fetchAllConversations, 
} from '../../api/conversations'; 
import {getConversationMessages} from "../../api/messages";
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList';
import ProfileComponent from '../components/ProfileComponent';
import { setOnlineUsers, updateUserStatus } from '../store/slices/userStatusSlice';

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
      setTypingUsers(new Map());
    });

    newSocket.on('initial_online_users', (data: {userIds: number[]}) => {
      dispatch(setOnlineUsers(data))
    })

    newSocket.on('user:status', (data: {userId: number, status: string}) => {
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

    newSocket.on('message:new', (newMessage: Message) => {
      if (newMessage.conversationId === currentConversationId) {
        dispatch(addNewMessage(newMessage));
      }
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(newMessage.sender.id);
        return newMap;
      });
    });

    newSocket.on('user:status', (userId: number, status: string) => {

    })

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
  }, [dispatch, currentUser?.id, currentConversationId]); 

  //Get conversations
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
          if (!token) throw new Error('Authentication token not found.');
          const data = await getConversationMessages(currentConversationId, token);
          dispatch(setMessages(data.messages)); 
        } catch (err: any) {
          dispatch(fetchMessagesFailure(err.message || 'Failed to load messages for this conversation.'));
        }
      };
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


  //send message and emmits it over socket
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

  const handleProfileView = (user) => {
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
    <div className="flex h-full bg-dark-gray-bg text-light-gray-text">
      <div className="w-1/4 bg-medium-gray p-4 border-r border-gray-700 overflow-y-auto custom-scrollbar rounded-lg m-2">
        <ConversationList />
      </div>
      <div className="w-3/4 flex flex-col p-4 bg-medium-gray text-light-gray-text m-2 rounded-lg shadow-lg">
        {currentConversation ? (
          <>
          <div className='bg-gray-600 rounded m-3 px-4 py-2'>
            <h1 className='text-2xl font-bold'>{currentConversation.isGroupChat ?
                  currentConversation.name : 
                  currentConversation.participants
                    .filter(p => p.user.id !== currentUser?.id) 
                    .map(p => (<button key={p.user.id} onClick={() => handleProfileView(p.user)}>{p.user.username}</button>))                                          
                }</h1>
          </div>
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

            {getTypingIndicatorText() && (
              <div className="text-gray-400 text-sm italic mt-2 ml-3">
                {getTypingIndicatorText()}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder={socketConnected ? "Type your message..." : "Connecting to chat..."}
                value={messageContent}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur} 
                disabled={isSending || !socketConnected || messagesLoading}
                className="flex-grow p-3 rounded-lg bg-gray-800 text-light-gray-text border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50 placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !messageContent.trim() || !socketConnected || messagesLoading}
                className={`py-2 px-6 rounded-lg transition duration-200 font-semibold ${
                  isSending || !messageContent.trim() || !socketConnected || messagesLoading
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-accent-blue hover:bg-amber-600 text-white'
                } shadow-md`}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <div className={`
                fixed inset-y-0 right-0 w-80 lg:w-96 xl:w-1/4 bg-gray-800 shadow-2xl z-50
                transform transition-transform duration-300 ease-in-out
                ${profileUser ? 'translate-x-0' : 'translate-x-full'}
                rounded-l-lg
              `}>
                {profileUser && <ProfileComponent user={profileUser} onClose={handleCloseProfile}/>}
              </div>
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