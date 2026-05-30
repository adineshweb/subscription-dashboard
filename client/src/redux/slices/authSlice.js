import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
const storedAccessToken = localStorage.getItem('accessToken');
const storedRefreshToken = localStorage.getItem('refreshToken');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedAccessToken || null,
  refreshToken: storedRefreshToken || null,
  isAuthenticated: !!storedAccessToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    refreshTokenSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    updateUserSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    }
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  refreshTokenSuccess,
  logoutSuccess,
  updateUserSuccess,
} = authSlice.actions;

export default authSlice.reducer;
