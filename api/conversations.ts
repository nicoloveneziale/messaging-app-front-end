const API_BASE_URL = "http://localhost:8080"; 

export const createConversation = async (recipientId: string, token: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ recipientId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create conversation');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create Conversation API Error:', error);
    throw error;
  }
};

export const getConversations = async (token: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch conversations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get Conversations API Error:', error);
    throw error;
  }
};

