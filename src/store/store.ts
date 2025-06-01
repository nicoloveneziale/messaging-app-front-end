import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import conversationReducer from "./slices/conversationSlice";
import userStatusReducer from "./slices/userStatusSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        conversations: conversationReducer,
        userStatus: userStatusReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;