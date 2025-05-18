const API_BASE_URL = "http://localhost:8080";

export const getProfile = async (profileId: number, token: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }});

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get profile');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get profile API Error:', error);
        throw error;
    }
}

export const updateProfile = async (profileId: number, bio: string, avatarUrl: string, token: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        body: JSON.stringify({bio, avatarUrl})
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Update profile API Error:', error);
        throw error;
    }
}