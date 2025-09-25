import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import stockSlice from './slices/stockSlice';
import ipoSlice from './slices/ipoSlice';
import balanceSlice from './slices/balanceSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    stocks: stockSlice,
    ipos: ipoSlice,
    balance: balanceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;