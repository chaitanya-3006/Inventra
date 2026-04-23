'use client';

import { useState } from 'react';
import { cancelReservation, extendReservation } from '../lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
}

interface Reservation {
  id: string;
  inventory_id: string;
  user_id: string;
  quantity: number;
  status: string;
  expires_at: string;
  created_at: string;
}

interface Props {
  reservations: Reservation[];
  inventory: InventoryItem[];
  onAction: () => void;
  userRole?: string;
  currentUserId?: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/40',
  CONFIRMED: 'bg-green-900/40 text-green-300 border border-green-700/40',
  CANCELLED: 'bg-gray-800 text-gray-400 border border-gray-700',
  EXPIRED: 'bg-red-900/40 text-red-300 border border-red-700/40',
};

export default function ReservationList({ reservations, inventory, onAction, userRole, currentUserId }: Props) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const getInventoryName = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    return item ? `${item.sku} — ${item.name}` : id;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };


  const handleCancel = async (id: string) => {
    setError('');
    setActionLoading(id + '-cancel');
    try {
      await cancelReservation(id);
      onAction();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtend = async (id: string) => {
    const minutesStr = window.prompt('Enter custom duration to extend (in minutes):', '15');
    if (minutesStr === null) return; // User canceled
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) {
      setError('Please enter a valid positive number for minutes.');
      return;
    }

    setError('');
    setActionLoading(id + '-extend');
    try {
      await extendReservation(id, minutes);
      onAction(); // refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Extend failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">
          {userRole === 'admin' ? 'All Reservations' : 'My Reservations'}
        </h2>
        <span className="text-gray-500 text-sm">{reservations.length} total</span>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm">
          No reservations yet.{userRole !== 'admin' && ' Create one using the form.'}
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {reservations.map((res) => (
            <div key={res.id} className="px-6 py-4 hover:bg-gray-800/30 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[res.status]}`}>
                      {res.status}
                    </span>
                    <span className="text-white font-medium text-sm truncate">
                      {getInventoryName(res.inventory_id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>Qty: <span className="text-gray-300">{res.quantity}</span></span>
                    <span>Created: <span className="text-gray-300">{formatTime(res.created_at)}</span></span>
                  </div>
                </div>
                  <div className="flex gap-2 shrink-0">
                    {res.status === 'PENDING' && (
                      <button
                        onClick={() => handleExtend(res.id)}
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white hover:text-white text-xs font-medium rounded-lg transition"
                      >
                        {actionLoading === res.id + '-extend' ? '...' : 'Extend Time'}
                      </button>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-red-800 disabled:bg-gray-700 text-gray-300 hover:text-red-300 text-xs font-medium rounded-lg transition"
                      >
                        {actionLoading === res.id + '-cancel' ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
