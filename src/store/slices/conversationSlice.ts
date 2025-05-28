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
  searchUserError: string | null; 
  newConversationLoading: boolean; 
}

const initialState: ConverstaionsState = {
  conversations: [],
  loading: false,
  error: null,
  currentConversationId: null,
    messages: [],
    messagesLoading: false,
    messagesError: null,
    searchUserError: null,
    newConversationLoading: false,
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
            state.messages = [];
            state.messagesError = null;
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
            state.conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        },
        addNewConversation: (state, action: PayloadAction<Conversation>) => {
            state.conversations.push(action.payload);
            state.newConversationLoading = false;
        },
        startNewConversationRequest: (state) => {
            state.newConversationLoading = true;
            state.error = null; 
            state.searchUserError = null; 
        },
        startNewConversationFailure: (state, action: PayloadAction<string>) => {
            state.newConversationLoading = false;
            state.error = action.payload; 
        },
        searchUserNotFound: (state, action: PayloadAction<string>) => {
            state.newConversationLoading = false; 
            state.searchUserError = action.payload; 
        },
        clearSearchUserError: (state) => {
            state.searchUserError = null; 
        },
        conversationAlreadyExists: (state, action: PayloadAction<number>) => {
            state.newConversationLoading = false;
            state.currentConversationId = action.payload; 
            state.searchUserError = 'Conversation with this user already exists. Selected existing chat.'; 
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
  addNewConversation, 
  startNewConversationRequest,
  startNewConversationFailure,
  searchUserNotFound,
  clearSearchUserError,
  conversationAlreadyExists 
} = conversationSlice.actions;

export default conversationSlice.reducer;