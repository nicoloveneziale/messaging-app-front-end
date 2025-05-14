import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

//Initial state
interface Message {
    id: number;
    content: string;
    sender: {id: number, username: string};
    createdAt: string;
    conversationId: number;
}

interface Conversation {
    id: number;
    name: string | null;
    participants: {
        user: {id: number, username: string}
    }[];
    lastMessage: {content: string; sender: {username:string}} | null;
    updatedAt: string;
}

interface ConverstaionsState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  currentConversationId: number | null; 
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
}

const initialState: ConverstaionsState = {
  conversations: [],
  loading: false,
  error: null,
  currentConversationId: null,
    messages: [],
    messagesLoading: false,
    messagesError: null
}

//Conversation slice
export const conversationSlice = createSlice({
    name: "conversations",
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<Conversation[]>) => {
            state.loading = false;
            state.conversations = action.payload;
            state.error = null;
        },
        fetchConversationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchConversationsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setCurrentConversationId: (state, action: PayloadAction<number | null>) => {
            state.currentConversationId = action.payload;
        },
        setMessages: (state, action: PayloadAction<Message[]>) => { 
            state.messagesLoading = false;
            state.messages = action.payload;
            state.messagesError = null;
        },
        fetchMessagesRequest: (state) => {
            state.messagesLoading = true;
            state.messagesError = null;
        },
        fetchMessagesFailure: (state, action: PayloadAction<string>) => {
            state.messagesLoading = false;
            state.messagesError = action.payload;
        },
        addNewMessage: (state, action: PayloadAction<Message>) => { 
            if (state.currentConversationId === action.payload.conversationId) {
                state.messages.push(action.payload);
            }
      
            state.conversations = state.conversations.map(conv =>
                conv.id === action.payload.conversationId ? { ...conv, lastMessage: action.payload } : conv
            );
        },
        addNewConversation: (state, action: PayloadAction<Conversation>) => {
            state.conversations.push(action.payload);
        }
    }
})

export const {
  setConversations,
  fetchConversationsRequest,
  fetchConversationsFailure,
  setCurrentConversationId,
  setMessages,
  fetchMessagesRequest,
  fetchMessagesFailure,
  addNewMessage,
} = conversationSlice.actions;

export default conversationSlice.reducer;