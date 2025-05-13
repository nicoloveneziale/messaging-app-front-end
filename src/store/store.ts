import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../feautures/auth/authSlice";
import conversationReducer from "../feautures/auth/conversationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        conversations: conversationReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;