import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPlan: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    fetchSubscriptionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubscriptionSuccess: (state, action) => {
      state.loading = false;
      state.currentPlan = action.payload;
      state.error = null;
    },
    fetchSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSubscription: (state, action) => {
      state.currentPlan = action.payload;
    },
    clearSubscription: (state) => {
      state.currentPlan = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchSubscriptionStart,
  fetchSubscriptionSuccess,
  fetchSubscriptionFailure,
  setSubscription,
  clearSubscription,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
