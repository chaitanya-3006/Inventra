'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getInventory, getMyReservations, getReservations } from '../../lib/api';
import ReservationForm from '../../components/ReservationForm';
import ReservationList from '../../components/ReservationList';
import toast from 'react-hot-toast';
import { useSocketEvents } from '@/lib/useSocketEvents';

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

  useSocketEvents({
    reservationUpdate: () => {
      if (user) fetchAll();
      toast('Reservation processing updated.', { icon: '🔄' });
    },
    inventoryUpdate: () => {
      // Opt to silently update inventory in background
      if (user) fetchAll();
    }
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [invRes, resRes] = await Promise.all([
        getInventory(), 
        user?.role === 'admin' ? getReservations() : getMyReservations()
      ]);
      setInventory(invRes.data?.data || []);
      setReservations(user?.role === 'admin' ? resRes.data?.data || [] : resRes.data || []);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reservations</h1>
        <p className="text-gray-400 text-sm mt-1">Reservations are auto-confirmed instantly when stock is available</p>
      </div>

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
    </div>
  );
}
