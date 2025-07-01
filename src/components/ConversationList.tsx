import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  fetchConversationsRequest,
  setConversations,
  fetchConversationsFailure,
  setCurrentConversationId,
  addNewConversation,
  startNewConversationRequest,
  startNewConversationFailure,
  searchUserNotFound,
  clearSearchUserError,
  conversationAlreadyExists,
} from '../store/slices/conversationSlice';

import {
  fetchAllConversations,
  markConversationAsRead,
  searchUserByUsername,
  startNewConversation,
} from '../../api/conversations';
import { getProfile } from '../../api/profile';

const ConversationList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const conversationsState = useSelector((state: RootState) => state.conversations);
  const conversations = Array.isArray(conversationsState.conversations)
    ? conversationsState.conversations
    : [];

  const {
    currentConversationId,
    loading,
    error,
    searchUserError,
    newConversationLoading,
  } = conversationsState;

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const onlineUserIds = useSelector((state: RootState) => state.userStatus.onlineUserIds);

  const [searchUsername, setSearchUsername] = useState('');
  const [avatarUrls, setAvatarUrls] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const getConversations = async () => {
      if (!currentUser.id) {
        return;
      }

      dispatch(fetchConversationsRequest());
      try {
        const token = localStorage.getItem("authToken")
        const data = await fetchAllConversations(token);
        dispatch(setConversations(data.conversations));
      } catch (err: any) {
        dispatch(fetchConversationsFailure(err.message || 'Failed to load conversations.'));
      }
    };

    getConversations();
  }, [dispatch, currentUser.id]);

  const handleSelectConversation = (conversationId: number) => {
    if (conversationId === currentConversationId) {
      dispatch(setCurrentConversationId(null));
      return;
    }
    dispatch(setCurrentConversationId(conversationId));
  };

  const handleStartNewConversation = async () => {
    if (!searchUsername.trim()) {
      alert('Please enter a username to start a conversation.');
      return;
    }

    dispatch(startNewConversationRequest());
    dispatch(clearSearchUserError());

    try {
      const targetUser = await searchUserByUsername(searchUsername);

      if (targetUser.id === currentUser.id) {
        dispatch(searchUserNotFound('Cannot start a conversation with yourself.'));
        return;
      }

      const existingConversation = conversations.find(conv =>
        conv.participants.some(p => p.user.id === targetUser.id) &&
        conv.participants.some(p => p.user.id === currentUser.id) &&
        conv.participants.length === 2
      );

      if (existingConversation) {
        dispatch(conversationAlreadyExists(existingConversation.id));
        setSearchUsername('');
        return;
      }

      const newConversation = await startNewConversation([currentUser.id, targetUser.id], false, null);
      dispatch(addNewConversation(newConversation.conversation));
      setSearchUsername('');

    } catch (err: any) {
      if (err.message === 'User not found.') {
        dispatch(searchUserNotFound(err.message));
      } else {
        dispatch(startNewConversationFailure(err.message || 'Failed to start new conversation.'));
      }
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatarUrls: { [key: number]: string } = {};
      const token = localStorage.getItem("authToken");

      for (const conv of conversations) {
        if (!conv.isGroupChat) {
          const otherParticipant = conv.participants.find((p) => p.user.id !== currentUser.id);
          if (otherParticipant) {
            try {
              const profile = await getProfile(otherParticipant.user.id, token);
              if (profile && profile.avatarUrl) {
                newAvatarUrls[conv.id] = profile.avatarUrl;
              } else {
                newAvatarUrls[conv.id] = `https://placehold.co/100x100/A0A0A0/FFFFFF?text=${getConversationDisplayName(conv).charAt(0).toUpperCase()}`;
              }
            } catch (err) {
              console.error(`Error fetching profile for user ${otherParticipant.user.id}:`, err);
              newAvatarUrls[conv.id] = `https://placehold.co/100x100/A0A0A0/FFFFFF?text=${getConversationDisplayName(conv).charAt(0).toUpperCase()}`;
            }
          }
        }
      }
      setAvatarUrls(newAvatarUrls);
    };

    if (conversations.length > 0) {
      fetchAvatars();
    }
  }, [conversations, currentUser.id]);

  const isConversationOnline = (conv: any) => {
    for (const p of conv.participants) {
      if (p.userId !== currentUser.id && onlineUserIds.includes(p.userId)) return true;
    }
    return false;
  };

  const hasUnreadMessage = (conv: any) => {
    if (!conv.lastMessage) return false;
    for (const p of conv.participants) {
      if (p.userId === currentUser.id && p.lastReadAt && p.lastReadAt < conv.lastMessage.createdAt) return true;
    }
    return false;
  };

  const getConversationDisplayName = (conversation: any) => {
    if (conversation.name && conversation.name.trim() !== '') {
      return conversation.name;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.user.id !== currentUser.id
    );
    return otherParticipant ? otherParticipant.user.username : 'Group Chat';
  };

  const defaultNoteColor = 'bg-white';
  const activeNoteColor = 'bg-blue-50';
  const unreadNoteColor = 'bg-yellow-50';

  const defaultTextColor = 'text-stone-800';
  const activeTextColor = 'text-blue-800';
  const unreadTextColor = 'text-yellow-800';

  const defaultBorderColor = 'border-stone-200';
  const activeBorderColor = 'border-blue-300';
  const unreadBorderColor = 'border-yellow-300';

  const defaultShadowColor = 'shadow-stone-200/50';
  const activeShadowColor = 'shadow-blue-300/50';
  const unreadShadowColor = 'shadow-yellow-300/50';


  return (
    <div className="flex flex-col h-full p-4 overflow-hidden relative z-10 font-sans antialiased">
      <div className="mb-6 p-4 rounded-xl bg-neutral-50 shadow-xl shadow-stone-300/50 border-2 border-dashed border-stone-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-20 pointer-events-none"></div>
        <h3 className="text-xl font-extrabold tracking-tight text-stone-700 uppercase mb-3">Start New Note</h3>
        <input
          type="text"
          placeholder="Recipient username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className="flex-grow p-2.5 rounded-md bg-white text-gray-800 font-mono text-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-opacity-80 placeholder-gray-500 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-150 ease-in-out w-full"
        />
        <button
          onClick={handleStartNewConversation}
          disabled={newConversationLoading}
          className={`w-full mt-3 px-5 py-2 border-2 border-black
            ${newConversationLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-amber-300 text-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-200 hover:translate-x-1 hover:translate-y-1 active:bg-amber-400'
            }`}
        >
          {newConversationLoading ? 'Searching...' : 'Create Note'}
        </button>
        {searchUserError && <p className="text-red-500 text-sm mt-2 font-mono">{searchUserError}</p>}
        {error && !searchUserError && <p className="text-red-500 text-sm mt-2 font-mono">{error}</p>}
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 relative z-0">
        {loading && <p className="text-center text-gray-600 font-mono text-2xl mt-4 animate-pulse">Gathering notes...</p>}
        {error && !searchUserError && <p className="text-center text-red-500 font-mono text-2xl mt-4">Error: {error}</p>}

        {!loading && conversations.length === 0 && !error && (
          <p className="text-center text-gray-500 font-mono text-xl italic mt-8">
            No notes yet. Start a new one above!
          </p>
        )}

        <ul className="grid grid-cols-1 gap-4">
          {conversations.map((conv) => {
            const isSelected = conv.id === currentConversationId;
            const isUnread = hasUnreadMessage(conv);

            const bgColor = isSelected ? activeNoteColor : (isUnread ? unreadNoteColor : defaultNoteColor);
            const textColor = isSelected ? activeTextColor : (isUnread ? unreadTextColor : defaultTextColor);
            const borderColor = isSelected ? activeBorderColor : (isUnread ? unreadBorderColor : defaultBorderColor);
            const shadowColor = isSelected ? activeShadowColor : (isUnread ? unreadShadowColor : defaultShadowColor);

            return (
              <li
                key={conv.id}
                className={`
                  p-4 rounded-xl mb-1 cursor-pointer
                  transition-all duration-200 ease-in-out
                  flex items-center space-x-3
                  shadow-lg hover:shadow-xl
                  transform hover:-translate-y-0.5
                  relative overflow-hidden
                  border-2 border-black
                  group
                  ${bgColor} ${textColor}
                  ${isSelected ? 'shadow-[6px_6px_0px_rgba(0,0,0,1)]' : 'shadow-[4px_4px_0px_rgba(0,0,0,0.8)]'}
                  ${isSelected ? 'z-20 scale-100' : 'z-10'}
                `}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className={`
                  absolute top-2 left-2 w-3 h-3 rounded-full
                  bg-gray-400
                  flex items-center justify-center
                  shadow-sm
                `}>
                  <span className="w-1 h-1 rounded-full bg-white opacity-70"></span>
                </div>

                <div className="relative ml-4">
                  <img
                    src={avatarUrls[conv.id] || `https://placehold.co/100x100/A0A0A0/FFFFFF?text=${getConversationDisplayName(conv).charAt(0).toUpperCase()}`}
                    alt={`${getConversationDisplayName(conv)}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover object-center border-2 border-black"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white
                      ${isConversationOnline(conv) ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></div>
                </div>

                <div className="flex-grow">
                  <h4 className={`font-extrabold text-xl truncate ${textColor}`}>{getConversationDisplayName(conv)}</h4>
                  {isUnread ? (
                    <p className={`text-base font-mono font-medium animate-pulse-light ${textColor}`}>New Post!</p>
                  ) : (
                    conv.lastMessage && (
                      <p className={`text-sm font-mono ${textColor} opacity-80 truncate`}>
                        {conv.lastMessage.sender.username === currentUser.username ? 'You: ' : `${conv.lastMessage.sender.username}: `}
                        {conv.lastMessage.content}
                      </p>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ConversationList;