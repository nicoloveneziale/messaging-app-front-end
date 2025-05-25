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
  searchUserByUsername,
  startNewConversation,
} from '../../api/conversations'; 

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

  const currentUser = useSelector((state: RootState) => state.auth.user); // Assuming user object in auth state

  const [searchUsername, setSearchUsername] = useState('');

  useEffect(() => {
    const getConversations = async () => {
      if (!currentUser.id) {
        return;
      }

      dispatch(fetchConversationsRequest());
      try {
        const token = localStorage.getItem("authToken")
        const data = await fetchAllConversations(token);
        dispatch(setConversations(data));
      } catch (err: any) {
        dispatch(fetchConversationsFailure(err.message || 'Failed to load conversations.'));
      }
    };

    getConversations();
  }, [dispatch, currentUser.id]);

  const handleSelectConversation = (conversationId: number) => {
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

      const newConversation = await startNewConversation([currentUser.id!, targetUser.id], false, null);
      dispatch(addNewConversation(newConversation)); 
      setSearchUsername(''); 

    } catch (err: any) {
      if (err.message === 'User not found.') {
        dispatch(searchUserNotFound(err.message));
      } else {
        dispatch(startNewConversationFailure(err.message || 'Failed to start new conversation.'));
      }
    }
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

  return (
    <div className="bg-gray-700 w-64 p-4 flex flex-col h-full border-r border-gray-600">
      <h2 className="text-xl font-semibold mb-4 text-white">Conversations</h2>
      <div className="mb-6 pb-4 border-b border-gray-600">
        <h3 className="text-lg font-medium mb-2 text-white">Start New Chat</h3>
        <input
          type="text"
          placeholder="Enter username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <button
          onClick={handleStartNewConversation}
          disabled={newConversationLoading} 
          className={`w-full py-2 px-4 rounded transition duration-200 ${
            newConversationLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold`}
        >
          {newConversationLoading ? 'Searching...' : 'Search & Start Chat'}
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
            className={`p-3 rounded-lg mb-2 cursor-pointer transition duration-200 ${
              conv.id === currentConversationId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 hover:bg-gray-600 text-gray-100'
            }`}
            onClick={() => handleSelectConversation(conv.id)}
          >
            <h4 className="font-semibold text-lg">{getConversationDisplayName(conv)}</h4>
            {conv.lastMessage && (
              <p className="text-sm text-gray-300 truncate">
                {conv.lastMessage.sender.username === currentUser.username ? 'You: ' : `${conv.lastMessage.sender.username}: `}
                {conv.lastMessage.content}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;