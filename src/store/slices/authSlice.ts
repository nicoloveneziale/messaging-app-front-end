import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

//Initial state
interface AuthState {
  user: {
    id: number | null;
    username: string | null;
    email: string | null;
    token: string | null;
  };
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: {
    id: null,
    username: null,
    email: null,
    token: null,
  },
  isAuthenticated: false,
  loading: false,
  error: null,
}

//Auth Slice
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{id: number, username: string, email: string, token: string}>) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('authToken', action.payload.token);
             localStorage.setItem('authUserId', String(action.payload.id)); 
             localStorage.setItem('authUsername', action.payload.username);
             localStorage.setItem('authUserEmail', action.payload.email);
        },
        logout: (state) => {
            state.user = { ...initialState.user };
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUserId');
            localStorage.removeItem('authUsername');
            localStorage.removeItem('authUserEmail');            
        },
        authRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        authFailure (state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
            state.user = { ...initialState.user };
        },
        setUserFromPersistedStorage: (state, action: PayloadAction<{ id: number; username: string; email: string; token: string }>) => {
        state.user = action.payload;
        state.loading = false; 
        state.isAuthenticated = true;
        state.error = null;
        }
    }
})

export const {
    loginSuccess,
    logout,
    authRequest,
    authFailure,
    setUserFromPersistedStorage
} = authSlice.actions;

//Export the reducer to the store
export default authSlice.reducer;