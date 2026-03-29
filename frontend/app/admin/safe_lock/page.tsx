'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getSafeLockStats, getSafeLockedItems, lockInventory, releaseSafeLock, getInventoryForSelection } from '@/lib/api';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';

interface SafeLockItem {
  id: string;
  sku: string;
  inventoryName: string;
  lockedQuantity: number;
  user: { name: string };
  expiry: string;
  isPermanent: boolean;
}

interface SafeLockStats {
  totalLocked: number;
  expiringSoon: number;
  safeLockedItems: number;
}

export default function SafeLockPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [safeLocks, setSafeLocks] = useState<SafeLockItem[]>([]);
  const [stats, setStats] = useState<SafeLockStats>({
    totalLocked: 0,
    expiringSoon: 0,
    safeLockedItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [lockQuantity, setLockQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/inventory');
      return;
    }
    fetchData();
  }, [user, expiryFilter, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, locksRes] = await Promise.all([
        getSafeLockStats(),
        getSafeLockedItems({
          expiry: expiryFilter !== 'All' ? expiryFilter : undefined,
          search: searchTerm || undefined,
        }),
      ]);
      setStats(statsRes.data);
      setSafeLocks(locksRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load safe-lock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await getInventoryForSelection();
      setInventoryItems(res.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchInventoryItems();
  };

  const handleLock = async () => {
    if (!selectedItem || lockQuantity < 1) return;
    try {
      await lockInventory({
        inventoryId: selectedItem,
        quantity: lockQuantity,
        expiresAt: permanent ? undefined : expiryDate,
        permanent,
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to lock inventory:', err);
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await releaseSafeLock(id);
      fetchData();
    } catch (err) {
      console.error('Failed to release lock:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Inventra</span>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">{user?.username}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300">
                  {user?.role}
                </span>
              </div>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm transition">Logout</button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Safe-Lock</h1>
              <p className="text-gray-400 text-sm mt-1">Manage locked inventory items</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V5a4 4 0 00-4-4H6a4 4 0 00-4 4v6" />
                </svg>
                Safe-Lock Item
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard 
                title="Total Locked" 
                value={stats.totalLocked.toLocaleString()} 
                icon="lock" 
                bgColor="bg-yellow-50" 
                textColor="text-yellow-800"
              />
              <StatCard 
                title="Expiring Soon" 
                value={stats.expiringSoon.toLocaleString()} 
                icon="clock" 
                bgColor="bg-purple-50" 
                textColor="text-purple-800"
              />
              <StatCard 
                title="Safe-Locked Items" 
                value={stats.safeLockedItems.toLocaleString()} 
                icon="check" 
                bgColor="bg-green-50" 
                textColor="text-green-800"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex justify-between">
            <div className="flex items-center gap-3">
              <select 
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
              >
                <option value="All">All Expiry</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="No Expiry">No Expiry</option>
              </select>
            </div>
            <SearchBar placeholder="Search SKU / Item" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* Safe-Lock Table */}
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
          ) : safeLocks.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V5a4 4 0 00-4-4H6a4 4 0 00-4 4v6" />
                </svg>
              </div>
              <p className="text-gray-400">No locked items</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">SKU</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">Item Name</th>
                    <th className="text-right px-6 py-3 text-gray-400 font-medium text-xs">Locked Qty</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">User</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">Expiry</th>
                    <th className="text-center px-6 py-3 text-gray-400 font-medium text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {safeLocks.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-6 py-3 text-left font-mono text-brand-400 text-xs bg-brand-900/20 px-2 py-1 rounded">
                        {item.sku}
                      </td>
                      <td className="px-6 py-3 text-left text-white">{item.inventoryName}</td>
                      <td className="px-6 py-3 text-right text-gray-300">{item.lockedQuantity} units</td>
                      <td className="px-6 py-3 text-left text-gray-300">{item.user.name}</td>
                      <td className="px-6 py-3 text-left text-gray-300">
                        {item.isPermanent ? 'No Expiry' : item.expiry}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleRelease(item.id)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition"
                        >
                          Release
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Safe-Lock Item</h2>
            <p className="text-gray-400 text-sm mb-6">Lock stock inventory safely</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Item</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  <option value="">Select an item</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - {item.availableQuantity} units available
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Lock Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLockQuantity(Math.max(1, lockQuantity - 1))}
                    className="px-3 py-2 bg-gray-800 rounded text-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={lockQuantity}
                    onChange={(e) => setLockQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300 text-center"
                    min={1}
                  />
                  <button
                    onClick={() => setLockQuantity(lockQuantity + 1)}
                    className="px-3 py-2 bg-gray-800 rounded text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Time</label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  disabled={permanent}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permanent"
                  checked={permanent}
                  onChange={(e) => setPermanent(e.target.checked)}
                  className="h-4 w-4 text-brand-600"
                />
                <label htmlFor="permanent" className="text-gray-300 text-sm">No Expiry (Permanent)</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLock}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition"
              >
                Confirm Safe-Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
