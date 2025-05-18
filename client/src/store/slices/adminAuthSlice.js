import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  admin: null,
  error: null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    adminLoginStart: (state) => {
      state.error = null;
    },
    adminLoginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.admin = action.payload;
      state.error = null;
    },
    adminLoginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.admin = null;
      state.error = action.payload;
    },
    adminLogout: (state) => {
      state.isAuthenticated = false;
      state.admin = null;
      state.error = null;
    },
  },
});

export const {
  adminLoginStart,
  adminLoginSuccess,
  adminLoginFailure,
  adminLogout,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer; 