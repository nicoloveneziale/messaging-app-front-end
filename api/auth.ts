const API_BASE_URL = "http://localhost:8080"; 

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({username,password}),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Login API Error:', error);
    throw error; 
  }
};

export const registerUser = async (username: string, password: string, email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password, email}),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (error) {
        const textError = await response.text();
        console.error('Registration Error:', error);
        errorMessage = textError || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration API Error:', error);
    throw error;
  }
};

export const verifyAuthToken = async (token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            let errorMessage = 'Token verification failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (error) {
                const textError = await response.text();
                errorMessage = textError || errorMessage;
                console.log(error)
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.user;
    } catch (error: any) {
        console.error('Token verification API Error:', error);
        throw error;
    }
};