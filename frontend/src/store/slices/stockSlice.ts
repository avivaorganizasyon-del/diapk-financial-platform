import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface StockQuote {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  updatedAt: string;
}

interface Favorite {
  id: number;
  userId: number;
  symbol: string;
  type: 'stock' | 'crypto' | 'forex';
  createdAt: string;
  updatedAt: string;
}

interface StockState {
  stocks: StockQuote[];
  quotes: StockQuote[];
  favorites: Favorite[];
  selectedStock: StockQuote | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  filters: {
    exchange: string;
    sector: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: StockState = {
  stocks: [],
  quotes: [],
  favorites: [],
  selectedStock: null,
  loading: false,
  isLoading: false,
  error: null,
  filters: {
    exchange: '',
    sector: '',
    sortBy: 'symbol',
    sortOrder: 'asc',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const fetchStocks = createAsyncThunk(
  'stocks/fetchStocks',
  async (params: {
    page?: number;
    limit?: number;
    exchange?: string;
    sector?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/stocks', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Hisse senetleri yüklenemedi');
    }
  }
);

export const fetchStockDetail = createAsyncThunk(
  'stocks/fetchStockDetail',
  async (symbol: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/stocks/${symbol}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Hisse detayı yüklenemedi');
    }
  }
);

export const fetchFavoriteStocks = createAsyncThunk(
  'stocks/fetchFavoriteStocks',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.favorites;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Favoriler yüklenemedi');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'stocks/addToFavorites',
  async (stockData: { symbol: string; type: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/user/favorites', stockData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.favorite;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Favorilere eklenemedi');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'stocks/removeFromFavorites',
  async (favoriteId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/user/favorites/${favoriteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return favoriteId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Favorilerden kaldırılamadı');
    }
  }
);

const stockSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedStock: (state) => {
      state.selectedStock = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.stocks = action.payload.stocks;
        state.quotes = action.payload.stocks;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Stock Detail
      .addCase(fetchStockDetail.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.selectedStock = action.payload.stock;
        state.error = null;
      })
      .addCase(fetchStockDetail.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Favorite Stocks
      .addCase(fetchFavoriteStocks.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      // Add to Favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites.push(action.payload);
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(fav => fav.id !== action.payload);
      });
  },
});

export const { setFilters, setPagination, clearSelectedStock, clearError } = stockSlice.actions;
export default stockSlice.reducer;