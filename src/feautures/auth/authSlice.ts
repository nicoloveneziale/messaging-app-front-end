import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

//Initial state
interface AuthState {
  user: {
    id: number | null;
    username: string | null;
    email: string | null;
    token: string | null;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
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
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        authRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        authFailure (state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

//Export actions to use in compononents to interact with the states
export const {
    loginSuccess
} = authSlice.actions;

//Export the reducer to the store
export default authSlice.reducer;