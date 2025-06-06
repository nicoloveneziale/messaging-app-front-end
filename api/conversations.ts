const API_BASE_URL = "http://localhost:8080"

export const fetchAllConversations = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch conversations.');
  }

  const data = await response.json();
  return data; 
};

// Function to search for a user by username
export const searchUserByUsername = async (username: string) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error('No authentication token found.');
  }

  const response = await fetch(`${API_BASE_URL}/users/${username}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 404) {
        throw new Error('User not found.');
    }
    throw new Error(errorData.message || 'Failed to search user.');
  }

  const data = await response.json();
  return data; 
};

// Function to start a new conversation 
export const startNewConversation = async (participantIds: number[], isGroupChat: boolean, name: string | null) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error('No authentication token found.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ participantIds, isGroupChat, name }), 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to start new conversation.');
  }

  const data = await response.json();
  return data; 
};

// Function to mark a conversation as read
export const markConversationAsRead = async (conversationId: number) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error('No authentication token found.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
    method: 'PUT', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to mark conversation ${conversationId} as read.`);
  }

  const data = await response.json();
  return data;
};
