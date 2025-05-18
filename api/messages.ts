const API_BASE_URL = "http://localhost:8080"; 

export const getConversationMessages = async (conversationId: number, token: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/:${conversationId}/messages`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch messages');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get Messages API Error:', error);
        throw error;
    }
}   

export const createMessage = async (conversationId:number, content: string, token: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/:${conversationId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(content)
        })

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Semd message API Error:', error);
        throw error;
    }
}   

export const deleteMessage = async (conversationId: number, messageId: number, token: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/:${conversationId}/messages/:${messageId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete message');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Delete message API Error:', error);
        throw error;
    }
}   