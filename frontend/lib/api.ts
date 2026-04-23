import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

export const login = (username: string, password: string) =>
  API.post('/auth/login', { username, password });

export const register = (username: string, password: string) =>
  API.post('/auth/register', { username, password });


// Inventory API
export const getInventoryStats = () => API.get('/inventory/stats');
export const getInventory = (params?: { page?: number; limit?: number; search?: string }) =>
  API.get('/inventory', { params });
export const createInventory = (data: { sku: string; name: string; totalQuantity: number }) =>
  API.post('/inventory', data);
export const updateInventory = (id: string, data: { name?: string; totalQuantity?: number }) =>
  API.put(`/inventory/${id}`, data);
export const deleteInventory = (id: string) => API.delete(`/inventory/${id}`);

// Reservation API
export const createReservation = (inventoryId: string, quantity: number) =>
  API.post('/reservation', { inventoryId, quantity });
export const confirmReservation = (reservationId: string) =>
  API.post('/reservation/confirm', { reservationId });
export const cancelReservation = (reservationId: string) =>
  API.post('/reservation/cancel', { reservationId });
export const extendReservation = (reservationId: string, durationMinutes: number) =>
  API.post('/reservation/extend', { reservationId, durationMinutes });
export const getMyReservations = () => API.get('/reservation/user');
export const getReservations = (params?: { page?: number; limit?: number; status?: string }) =>
  API.get('/reservations', { params }); // For admin view

// History API
export const getHistory = (params?: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  operator?: string; 
  startDate?: string; 
  endDate?: string; 
  search?: string 
}) => API.get('/history', { params });
export const getHistoryStats = () => API.get('/history/stats');

// Audit Log API
export const getAuditLogs = (params?: { 
  page?: number; 
  limit?: number; 
  action?: string; 
  userId?: string; 
  startDate?: string; 
  endDate?: string;
  search?: string;
}) => API.get('/audit-logs', { params });

// Safe-Lock API
export const getSafeLockStats = () => API.get('/safe-lock/stats');
export const getSafeLockedItems = (params?: { 
  page?: number; 
  limit?: number; 
  expiry?: string; 
  search?: string 
}) => API.get('/safe-lock', { params });
export const lockInventory = (data: { 
  inventoryId: string; 
  quantity: number; 
  expiresAt?: string; // ISO string, undefined for permanent
  permanent?: boolean 
}) => API.post('/safe-lock/lock', data);
export const releaseSafeLock = (lockId: string) => API.post(`/safe-lock/unlock/${lockId}`);

// Additional API for modals and selectors
export const getInventoryForSelection = () => API.get('/inventory/for-selection'); // For reservation modal
