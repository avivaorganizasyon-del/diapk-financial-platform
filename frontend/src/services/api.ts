import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store';
import { setToken, logout } from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/uiSlice';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    // Public IPO endpoint'leri için token zorunlu değil, ancak kullanıcıya özel endpoint'ler için gerekli
    const isPublicIPOEndpoint = config.url?.includes('/ipos') && 
      !config.url?.includes('/ipos/my/') && 
      !config.url?.includes('/subscribe') && 
      !config.url?.includes('/subscriptions');
    
    if (token && (!isPublicIPOEndpoint || config.url?.includes('/admin/'))) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid
      store.dispatch(logout());
      store.dispatch(showSnackbar({
        message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
        severity: 'error'
      }));
    } else if (response?.status === 403) {
      store.dispatch(showSnackbar({
        message: 'Bu işlem için yetkiniz bulunmamaktadır.',
        severity: 'error'
      }));
    } else if (response && response.status >= 500) {
      store.dispatch(showSnackbar({
        message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
        severity: 'error'
      }));
    } else if (!response) {
      store.dispatch(showSnackbar({
        message: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
        severity: 'error'
      }));
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { email?: string; phone?: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    inviteCode: string;
  }) => api.post('/auth/register', userData),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/auth/change-password', data),
  
  deleteAccount: () => api.delete('/auth/account'),
};

export const stockAPI = {
  getStocks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    exchange?: string;
    sector?: string;
  }) => api.get('/stocks', { params }),
  
  getStock: (symbol: string) => api.get(`/stocks/${symbol}`),
  
  getFavorites: () => api.get('/stocks/favorites'),
  
  addToFavorites: (symbol: string) => api.post('/stocks/favorites', { symbol }),
  
  removeFromFavorites: (symbol: string) => api.delete(`/stocks/favorites/${symbol}`),
};

export const ipoAPI = {
  getIPOs: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get('/ipos', { params }),
  
  getIPO: (id: string) => api.get(`/ipos/${id}`),
  
  getActiveIPOs: () => api.get('/ipos/active'),
  
  getUpcomingIPOs: () => api.get('/ipos/upcoming'),
  
  subscribeToIPO: (data: {
    ipoId: string;
    quantity: number;
    pricePerShare: number;
  }) => api.post(`/ipos/${data.ipoId}/subscribe`, {
    quantity: data.quantity,
    pricePerShare: data.pricePerShare
  }),
  
  getMySubscriptions: () => api.get('/ipos/my/subscriptions'),
  
  cancelSubscription: (subscriptionId: string) =>
    api.delete(`/ipos/subscriptions/${subscriptionId}`),
};

export const userAPI = {
  // Profile // User API
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),

  // Balance
  getBalance: () => api.get('/user/balance'),

  // KYC
  getKycStatus: () => api.get('/user/kyc'),
  
  submitKyc: (formData: FormData) =>
    api.post('/user/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Deposit Management
  getDeposits: () => api.get('/user/deposits'),
  createDeposit: (formData: FormData) =>
    api.post('/user/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Favorites
  getFavorites: () => api.get('/user/favorites'),
  addToFavorites: (symbol: string) => api.post('/user/favorites', { symbol }),
  removeFromFavorites: (symbol: string) => api.delete(`/user/favorites/${symbol}`),
};

export const kycAPI = {
  getKycStatus: () => api.get('/kyc/status'),
  
  uploadDocument: (formData: FormData) =>
    api.post('/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export const depositAPI = {
  // Get system bank accounts
  getBankAccounts: () => api.get('/deposits/bank-accounts'),

  // Submit deposit request
  submitDeposit: (data: {
    amount: number;
    bankAccountId: number;
    senderName: string;
    senderIban: string;
    transactionDate: string;
    description?: string;
    receipt: File;
  }) => {
    const formData = new FormData();
    formData.append('amount', data.amount.toString());
    formData.append('bankAccountId', data.bankAccountId.toString());
    formData.append('senderName', data.senderName);
    formData.append('senderIban', data.senderIban);
    formData.append('transactionDate', data.transactionDate);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('receipt', data.receipt);
    
    return api.post('/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user deposits
  getUserDeposits: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/user/deposits', { params }),

  // Get deposit by ID
  getDepositById: (id: number) => api.get(`/deposits/${id}`),

  // Cancel deposit
  cancelDeposit: (id: number) => api.delete(`/deposits/${id}`),

  // Get available payment methods for users
  getPaymentMethods: () => api.get('/user/payment-methods'),

  // Create deposit with payment method
  createDeposit: (formData: FormData) =>
    api.post('/user/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export const supportAPI = {
  // Get user tickets
  getTickets: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) => api.get('/support/tickets', { params }),
  
  // Get specific ticket
  getTicket: (ticketId: number) => api.get(`/support/tickets/${ticketId}`),
  
  // Create new ticket
  createTicket: (data: {
    subject: string;
    category: string;
    priority: string;
    message: string;
    attachments?: File[];
  }) => {
    // Backend expects JSON format, not FormData
    const ticketData = {
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      message: data.message
      // Note: File attachments not supported in current backend implementation
    };
    
    return api.post('/support/tickets', ticketData);
  },
  
  // Get ticket messages
  getTicketMessages: (ticketId: number) => api.get(`/support/tickets/${ticketId}/messages`),
  
  // Send message to ticket
  sendMessage: (ticketId: number, data: {
    message: string;
    attachments?: File[];
  }) => {
    // For now, just send the message as JSON since backend doesn't support attachments yet
    return api.post(`/support/tickets/${ticketId}/messages`, {
      message: data.message
    });
  },
  
  // Close ticket
  closeTicket: (ticketId: number) => api.patch(`/support/tickets/${ticketId}/close`),
  
  // Reopen ticket
  reopenTicket: (ticketId: number) => api.patch(`/support/tickets/${ticketId}/reopen`),
};

export const announcementAPI = {
  getAnnouncements: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/announcements', { params }),
  
  getAnnouncement: (id: string) => api.get(`/announcements/${id}`),
};

export default api;
