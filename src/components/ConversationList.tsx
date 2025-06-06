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
        console.log(data.conversations[0])
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
        console.log('Conversation with this user already exists. Selecting it:', existingConversation.id);
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

  //Gets the user avatars
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
                newAvatarUrls[conv.id] = `https://placehold.co/100x100/333333/FFFFFF?text=${getConversationDisplayName(conv).charAt(0).toUpperCase()}`;
              }
            } catch (err) {
              console.error(`Error fetching profile for user ${otherParticipant.user.id}:`, err);
              newAvatarUrls[conv.id] = `https://placehold.co/100x100/333333/FFFFFF?text=${getConversationDisplayName(conv).charAt(0).toUpperCase()}`;
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

  const isConversationOnline = (conv) => {
    for (const p of conv.participants) {
      if (p.userId !== currentUser.id && onlineUserIds.includes(p.userId)) return true;
      return false;
    }
  }

  const getConversationDisplayName = (conversation: any) => {
    if (conversation.name && conversation.name.trim() !== '') {
      return conversation.name;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.user.id !== currentUser.id
    );
    return otherParticipant ? otherParticipant.user.username : 'Group Chat';
  };

  return (
    <div className="bg-gray-600 w-full p-4 flex flex-col h-full rounded border-r border-gray-600">
      <div className="mb-6 p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium m-2 text-white">New Conversation</h3>
        <input
          type="text"
          placeholder="Enter username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className="w-full mr-2 p-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <br />
        <button
          onClick={handleStartNewConversation}
          disabled={newConversationLoading} 
          className={`w-full p-2 rounded transition duration-200 ${
            newConversationLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
          } text-white font-semibold`}
        >
          Search
        </button>
        {searchUserError && <p className="text-red-400 text-sm mt-2">{searchUserError}</p>}
        {error && !searchUserError && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {loading && <p className="text-gray-300">Loading conversations...</p>}
      {error && !searchUserError && <p className="text-red-400">Error: {error}</p>}

      {!loading && conversations.length === 0 && !error && (
        <p className="text-gray-400">No conversations yet. Start a new one!</p>
      )}

      <ul className="flex-grow overflow-y-auto">
        {conversations.map((conv) => (
          <li
            key={conv.id}
            className={`p-3 rounded-lg mb-2 cursor-pointer transition duration-200 flex items-center ${ 
              conv.id === currentConversationId
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 hover:bg-amber-700 text-gray-100'
            }`}
            onClick={() => handleSelectConversation(conv.id)}
          >
            <img
              src={avatarUrls[conv.id] || `https://placehold.co/100x100/333333/FFFFFF?text=${getConversationDisplayName(conv).charAt(0).toUpperCase()}`}
              alt={`${getConversationDisplayName(conv)}'s avatar`}
              className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover object-center mr-3" 
            />
            <div
              className={`w-3 h-3 rounded-full mr-2 ${ 
                isConversationOnline(conv) ? 'bg-green-400' : 'bg-yellow-400'
              }`}
            ></div> 
            <div className="flex-grow"> 
              <h4 className="font-semibold text-lg">{getConversationDisplayName(conv)}</h4>
              {conv.lastMessage && (
                <p className="text-sm text-gray-300 truncate">
                  {conv.lastMessage.sender.username === currentUser.username ? 'You: ' : `${conv.lastMessage.sender.username}: `}
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;