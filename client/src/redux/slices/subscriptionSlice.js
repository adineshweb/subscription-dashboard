import { createSlice } from '@reduxjs/toolkit';

const storedSubscription = localStorage.getItem('subscription');

const initialState = {
  currentPlan: storedSubscription ? JSON.parse(storedSubscription) : null,
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
      if (action.payload) {
        localStorage.setItem('subscription', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('subscription');
      }
    },
    fetchSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSubscription: (state, action) => {
      state.currentPlan = action.payload;
      if (action.payload) {
        localStorage.setItem('subscription', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('subscription');
      }
    },
    clearSubscription: (state) => {
      state.currentPlan = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('subscription');
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
