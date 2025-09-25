import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';
import { logout } from './authSlice';

interface BalanceState {
  totalBalance: number;
  availableBalance: number;
  reservedAmount: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: BalanceState = {
  totalBalance: 0,
  availableBalance: 0,
  reservedAmount: 0,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for fetching balance
export const fetchBalance = createAsyncThunk(
  'balance/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getBalance();
      return {
        ...response.data,
        lastUpdated: Date.now(),
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Bakiye bilgisi alınamadı');
    }
  }
);

// Async thunk for updating balance after transactions
export const updateBalanceAfterTransaction = createAsyncThunk(
  'balance/updateAfterTransaction',
  async (_, { dispatch }) => {
    // Fetch fresh balance data after a transaction
    return dispatch(fetchBalance());
  }
);

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    clearBalance: (state) => {
      state.totalBalance = 0;
      state.availableBalance = 0;
      state.reservedAmount = 0;
      state.lastUpdated = null;
      state.error = null;
    },
    setBalanceError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearBalanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.totalBalance = action.payload.totalBalance || 0;
        state.availableBalance = action.payload.availableBalance || 0;
        state.reservedAmount = action.payload.reservedAmount || 0;
        state.lastUpdated = action.payload.lastUpdated;
        state.error = null;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout, (state) => {
        // Clear balance when user logs out
        state.totalBalance = 0;
        state.availableBalance = 0;
        state.reservedAmount = 0;
        state.lastUpdated = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { clearBalance, setBalanceError, clearBalanceError } = balanceSlice.actions;
export default balanceSlice.reducer;

// Selectors
export const selectBalance = (state: { balance: BalanceState }) => state.balance;
export const selectTotalBalance = (state: { balance: BalanceState }) => state.balance.totalBalance;
export const selectAvailableBalance = (state: { balance: BalanceState }) => state.balance.availableBalance;
export const selectReservedAmount = (state: { balance: BalanceState }) => state.balance.reservedAmount;
export const selectBalanceLoading = (state: { balance: BalanceState }) => state.balance.loading;
export const selectBalanceError = (state: { balance: BalanceState }) => state.balance.error;
export const selectLastUpdated = (state: { balance: BalanceState }) => state.balance.lastUpdated;