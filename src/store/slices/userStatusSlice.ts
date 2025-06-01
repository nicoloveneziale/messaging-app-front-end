import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserStatusState {
  onlineUserIds: number[];
}

const initialState: UserStatusState = {
  onlineUserIds: [],
};

const userStatusSlice = createSlice({
  name: 'userStatus',
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<number[]>) => {
      state.onlineUserIds = action.payload;
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: number; status: 'online' | 'offline' }>) => {
      const { userId, status } = action.payload;
      if (status === 'online') {
        if (!state.onlineUserIds.includes(userId)) {
          state.onlineUserIds.push(userId); 
        }
      } else {
        state.onlineUserIds = state.onlineUserIds.filter(id => id !== userId); 
      }
    },
  },
});

export const { setOnlineUsers, updateUserStatus } = userStatusSlice.actions;

export default userStatusSlice.reducer;