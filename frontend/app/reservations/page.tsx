'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getInventory, getMyReservations, getReservations } from '../../lib/api';
import ReservationForm from '../../components/ReservationForm';
import ReservationList from '../../components/ReservationList';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface Reservation {
  id: string;
  inventory_id: string;
  user_id: string;
  quantity: number;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export default function ReservationsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, resRes] = await Promise.all([
        getInventory(), 
        user?.role === 'admin' ? getReservations() : getMyReservations()
      ]);
      setInventory(invRes.data?.data || []);
      setReservations(user?.role === 'admin' ? resRes.data?.data || [] : resRes.data || []);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">

      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Inventra</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/inventory')} className="text-gray-300 hover:text-white text-sm font-medium transition">Inventory</button>
            <button onClick={() => router.push('/reservations')} className="text-brand-400 text-sm font-medium">Reservations</button>
            {user?.role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="text-gray-300 hover:text-white text-sm font-medium transition">Admin</button>
            )}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <span className="text-gray-400 text-sm">{user?.username}</span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm transition">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reservations</h1>
          <p className="text-gray-400 text-sm mt-1">Reserve inventory items and manage your reservations</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {user?.role !== 'admin' && (
              <div className="lg:col-span-1">
                <ReservationForm inventory={inventory} onSuccess={fetchAll} />
              </div>
            )}
            <div className={`lg:col-span-2 ${user?.role === 'admin' ? 'lg:col-span-3 lg:w-3/4 lg:mx-auto' : ''}`}>
              <ReservationList reservations={reservations} inventory={inventory} onAction={fetchAll} userRole={user?.role} currentUserId={user?.id} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
