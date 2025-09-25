import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ipoAPI } from '../../services/api';

interface IPO {
  id: string;
  companyName: string;
  symbol: string;
  exchange: string;
  sector: string;
  totalShares: number;
  priceMin: string;
  priceMax: string;
  startDate: string;
  endDate: string;
  listingDate: string;
  status: 'upcoming' | 'ongoing' | 'closed' | 'listed';
  description: string;
  prospectusUrl?: string;
  logoUrl?: string;
  subscriptionCount: number;
  oversubscriptionRatio: number;
  createdAt: string;
  updatedAt: string;
}

interface IPOSubscription {
  id: string;
  ipoId: string;
  userId: string;
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  ipo: IPO;
}

interface IPOState {
  ipos: IPO[];
  activeIPOs: IPO[];
  upcomingIPOs: IPO[];
  activeIpos: IPO[];
  upcomingIpos: IPO[];
  selectedIpo: IPO | null;
  mySubscriptions: IPOSubscription[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    exchange: string;
    sector: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: IPOState = {
  ipos: [],
  activeIPOs: [],
  upcomingIPOs: [],
  activeIpos: [],
  upcomingIpos: [],
  selectedIpo: null,
  mySubscriptions: [],
  loading: false,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    exchange: '',
    sector: '',
    sortBy: 'startDate',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const fetchIPOs = createAsyncThunk(
  'ipos/fetchIPOs',
  async (params: {
    page?: number;
    limit?: number;
    status?: string;
    exchange?: string;
    sector?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await ipoAPI.getIPOs(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'IPO\'lar yüklenemedi');
    }
  }
);

export const fetchActiveIPOs = createAsyncThunk(
  'ipos/fetchActiveIPOs',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await ipoAPI.getActiveIPOs();
      return response.data.ipos;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Aktif IPO\'lar yüklenemedi');
    }
  }
);

export const fetchUpcomingIPOs = createAsyncThunk(
  'ipos/fetchUpcomingIPOs',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await ipoAPI.getUpcomingIPOs();
      return response.data.ipos;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Yaklaşan IPO\'lar yüklenemedi');
    }
  }
);

export const fetchIPODetail = createAsyncThunk(
  'ipos/fetchIPODetail',
  async (ipoId: string, { rejectWithValue }) => {
    try {
      const response = await ipoAPI.getIPO(ipoId);
      return response.data.ipo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'IPO detayı yüklenemedi');
    }
  }
);

export const subscribeToIPO = createAsyncThunk(
  'ipos/subscribeToIPO',
  async (subscriptionData: {
    ipoId: string;
    quantity: number;
    pricePerShare: number;
  }, { rejectWithValue }) => {
    try {
      const response = await ipoAPI.subscribeToIPO(subscriptionData);
      return response.data.subscription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'IPO aboneliği başarısız');
    }
  }
);

export const fetchMySubscriptions = createAsyncThunk(
  'ipos/fetchMySubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ipoAPI.getMySubscriptions();
      return response.data.subscriptions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Abonelikler yüklenemedi');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'ipos/cancelSubscription',
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      await ipoAPI.cancelSubscription(subscriptionId);
      return subscriptionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Abonelik iptal edilemedi');
    }
  }
);

const ipoSlice = createSlice({
  name: 'ipos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedIPO: (state) => {
      state.selectedIpo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch IPOs
      .addCase(fetchIPOs.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIPOs.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.ipos = action.payload.ipos;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchIPOs.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Active IPOs
      .addCase(fetchActiveIPOs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveIPOs.fulfilled, (state, action) => {
        state.loading = false;
        state.activeIPOs = action.payload;
        state.activeIpos = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveIPOs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Upcoming IPOs
      .addCase(fetchUpcomingIPOs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingIPOs.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingIPOs = action.payload;
        state.upcomingIpos = action.payload;
        state.error = null;
      })
      .addCase(fetchUpcomingIPOs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch IPO Detail
      .addCase(fetchIPODetail.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIPODetail.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.selectedIpo = action.payload;
        state.error = null;
      })
      .addCase(fetchIPODetail.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Subscribe to IPO
      .addCase(subscribeToIPO.fulfilled, (state, action) => {
        state.mySubscriptions.push(action.payload);
      })
      // Fetch My Subscriptions
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.mySubscriptions = action.payload;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.mySubscriptions = state.mySubscriptions.filter(
          sub => sub.id !== action.payload
        );
      });
  },
});

export const { setFilters, setPagination, clearSelectedIPO, clearError } = ipoSlice.actions;
export default ipoSlice.reducer;