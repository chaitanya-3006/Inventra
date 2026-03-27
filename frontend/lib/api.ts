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


export const getInventory = () => API.get('/inventory');
export const createInventory = (data: { sku: string; name: string; totalQuantity: number }) =>
  API.post('/inventory', data);
export const updateInventory = (id: string, data: { name?: string; totalQuantity?: number }) =>
  API.put(`/inventory/${id}`, data);
export const deleteInventory = (id: string) => API.delete(`/inventory/${id}`);

export const createReservation = (inventoryId: string, quantity: number) =>
  API.post('/reservation', { inventoryId, quantity });
export const confirmReservation = (reservationId: string) =>
  API.post('/reservation/confirm', { reservationId });
export const cancelReservation = (reservationId: string) =>
  API.post('/reservation/cancel', { reservationId });
export const getMyReservations = () => API.get('/reservation/user');
