import api from './api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingKyc: number;
  totalIpos: number;
  activeIpos: number;
  totalDeposits: number;
  pendingDeposits: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KycApplication {
  id: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  documentType: string;
  documentNumber: string;
  frontImage: string;
  backImage: string;
  selfieImage: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Deposit {
  id: number;
  userId: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankName: string;
  accountNumber: string;
  transactionId: string;
  receipt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface IPO {
  id: number;
  symbol: string;
  companyName: string;
  exchange: string;
  priceMin: number;
  priceMax: number;
  lotSize: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'closed' | 'listed';
  description: string;
  prospectusUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: number;
  symbol: string;
  companyName: string;
  exchange: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  sector: string;
  status: 'active' | 'suspended' | 'delisted';
  createdAt: string;
  updatedAt: string;
}

export interface InviteCode {
  id: number;
  code: string;
  isUsed: boolean;
  usedBy?: number;
  expiresAt?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  publishDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminAPI = {
  // User Management
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) => api.get<{ users: User[]; total: number; page: number; totalPages: number }>('/admin/users', { params }),

  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'user' | 'admin';
    inviteCode: string;
  }) => api.post('/admin/users', data),

  updateUser: (userId: number, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: 'user' | 'admin';
  }) => api.put(`/admin/users/${userId}`, data),

  updateUserStatus: (userId: number, data: { isActive: boolean; reason?: string }) =>
    api.put(`/admin/users/${userId}/status`, data),

  // KYC Management
  getKycApplications: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get<{ kycs: KycApplication[]; total: number; page: number; totalPages: number }>('/admin/kyc', { params }),

  reviewKyc: (kycId: number, data: { status: 'approved' | 'rejected'; rejectionReason?: string }) =>
    api.put(`/admin/kyc/${kycId}/review`, data),

  // Deposit Management
  getDeposits: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get<{ deposits: Deposit[]; total: number; page: number; totalPages: number }>('/admin/deposits', { params }),

  reviewDeposit: (depositId: number, data: { status: 'approved' | 'rejected'; rejectionReason?: string }) =>
    api.put(`/admin/deposits/${depositId}/review`, data),

  createManualDeposit: (data: {
    userId: number;
    amount: number;
    method: string;
    description?: string;
    transactionId?: string;
  }) => api.post('/admin/deposits/manual', data),

  // Payment Methods Management
  getPaymentMethods: () => api.get('/admin/payment-methods'),

  createPaymentMethod: (data: {
    name: string;
    type: string;
    description?: string;
    details?: any;
    isActive?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
    minAmount?: number;
    maxAmount?: number;
    commission?: number;
    processingTime?: string;
    instructions?: string;
  }) => api.post('/admin/payment-methods', data),

  updatePaymentMethod: (id: number, data: {
    name: string;
    type: string;
    description?: string;
    details?: any;
    isActive?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
    minAmount?: number;
    maxAmount?: number;
    commission?: number;
    processingTime?: string;
    instructions?: string;
  }) => api.put(`/admin/payment-methods/${id}`, data),

  deletePaymentMethod: (id: number) => api.delete(`/admin/payment-methods/${id}`),

  togglePaymentMethodStatus: (id: number, field: 'isActive' | 'isVisible', value: boolean) =>
    api.patch(`/admin/payment-methods/${id}/toggle`, { field, value }),

  // IPO Management
  getIpos: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get<{ ipos: IPO[]; total: number; page: number; totalPages: number }>('/admin/ipos', { params }),

  createIpo: (data: {
    symbol: string;
    companyName: string;
    exchange?: string;
    priceMin: number;
    priceMax: number;
    lotSize: number;
    startDate: string;
    endDate: string;
    description: string;
  }) => api.post('/admin/ipos', data),

  updateIpo: (ipoId: number, data: Partial<IPO>) => api.put(`/admin/ipos/${ipoId}`, data),

  deleteIpo: (ipoId: number) => api.delete(`/admin/ipos/${ipoId}`),

  // Stock Management
  getStocks: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sector?: string;
    exchange?: string;
  }) => api.get<{ stocks: Stock[]; total: number; page: number; totalPages: number }>('/admin/stocks', { params }),

  createStock: (data: {
    symbol: string;
    companyName: string;
    exchange: string;
    currentPrice: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    previousClose: number;
    volume: number;
    marketCap: number;
    sector: string;
    status: 'active' | 'suspended' | 'delisted';
  }) => api.post('/admin/stocks', data),

  updateStock: (stockId: number, data: Partial<Stock>) => api.put(`/admin/stocks/${stockId}`, data),

  deleteStock: (stockId: number) => api.delete(`/admin/stocks/${stockId}`),

  // Invite Code Management
  getInviteCodes: (params?: {
    page?: number;
    limit?: number;
    isUsed?: boolean;
  }) => api.get<{ codes: InviteCode[]; total: number; page: number; totalPages: number }>('/admin/invite-codes', { params }),

  createInviteCode: (data?: {
    count?: number;
    expiresAt?: string;
    description?: string;
  }) => api.post('/admin/invite-codes', data),

  // Announcement Management
  getAnnouncements: (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    type?: string;
  }) => api.get<{ announcements: Announcement[]; total: number; page: number; totalPages: number }>('/admin/announcements', { params }),

  // Support Management
  getSupportTickets: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
  }) => api.get('/admin/support/tickets', { params }),

  getTicketById: (ticketId: number) => api.get(`/admin/support/tickets/${ticketId}`),

  updateTicketStatus: (ticketId: number, data: {
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    adminNote?: string;
  }) => api.put(`/admin/support/tickets/${ticketId}/status`, data),

  sendAdminMessage: (ticketId: number, data: {
    message: string;
  }) => api.post(`/admin/support/tickets/${ticketId}/messages`, data),

  createAnnouncement: (data: {
    title: string;
    content: string;
    publishDate?: string;
  }) => api.post('/admin/announcements', data),

  updateAnnouncement: (announcementId: number, data: Partial<Announcement>) =>
    api.put(`/admin/announcements/${announcementId}`, data),

  deleteAnnouncement: (announcementId: number) => api.delete(`/admin/announcements/${announcementId}`),

  // Reports
  getReports: (queryString?: string) => api.get(`/admin/reports${queryString ? `?${queryString}` : ''}`),

  exportReport: (queryString?: string) => api.get(`/admin/reports/export${queryString ? `?${queryString}` : ''}`, { responseType: 'blob' }),

  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export default adminAPI;