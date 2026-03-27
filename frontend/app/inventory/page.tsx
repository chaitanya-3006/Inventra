'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '../../lib/auth';
import { getInventory } from '../../lib/api';
import InventoryTable from '../../components/InventoryTable';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
    fetchInventory();

  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getInventory();
      setItems(res.data);
    } catch {
      setError('Failed to load inventory. Please try again.');
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
            <button onClick={() => router.push('/reservations')} className="text-gray-300 hover:text-white text-sm font-medium transition">Reservations</button>
            {user?.role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="text-gray-300 hover:text-white text-sm font-medium transition">Admin</button>
            )}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <span className="text-gray-400 text-sm">{user?.username}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
                {user?.role}
              </span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm transition">Logout</button>
            </div>
          </div>
        </div>
      </nav>


      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time stock levels across all SKUs</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchInventory}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => router.push('/reservations')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-brand-600/20"
            >
              Make Reservation
            </button>
          </div>
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
              Loading inventory...
            </div>
          </div>
        ) : (
          <InventoryTable items={items} />
        )}
      </main>
    </div>
  );
}
