'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getInventoryStats, getInventory, createInventory } from '../../lib/api';
import StatCard from '@/components/StatCard';
import InventoryTable from '@/components/InventoryTable';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

interface InventoryStats {
  totalItems: number;
  availableItems: number;
  partiallyReserved: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    availableItems: 0,
    partiallyReserved: 0
  });
  const [loading, setLoading] = useState(true);
  const [totalListings, setTotalListings] = useState(0);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newItem, setNewItem] = useState({ sku: '', name: '', totalQuantity: 1 });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, itemsRes] = await Promise.all([
        getInventoryStats(),
        getInventory({
          page,
          limit: rowsPerPage,
          search: searchTerm
        })
      ]);
      setStats(statsRes.data);
      setItems(itemsRes.data?.data || []);
      setTotalListings(itemsRes.data?.total || 0);
    } catch (err) {
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await createInventory(newItem);
      setIsCreateOpen(false);
      setNewItem({ sku: '', name: '', totalQuantity: 1 });
      fetchData();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.response?.data?.error || 'Failed to create item');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time stock levels across all SKUs</p>
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
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-green-600/20"
                >
                  Create Item
                </button>
              )}
              {user?.role !== 'admin' && (
                <button
                  onClick={() => router.push('/reservations')}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-brand-600/20"
                >
                  Make Reservation
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards Section */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard 
                title="Total Items" 
                value={stats.totalItems.toLocaleString()} 
                icon="box" 
                bgColor="bg-gray-100" 
                textColor="text-gray-800"
              />
              <StatCard 
                title="Available Items" 
                value={stats.availableItems.toLocaleString()} 
                icon="package" 
                bgColor="bg-green-50" 
                textColor="text-green-800"
              />
              <StatCard 
                title="Partially Reserved" 
                value={stats.partiallyReserved.toLocaleString()} 
                icon="clock" 
                bgColor="bg-yellow-50" 
                textColor="text-yellow-800"
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 flex justify-end">
            <div className="flex items-center gap-3">
              <select 
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="office">Office Supplies</option>
                <option value="hardware">Hardware</option>
              </select>
              <button
                onClick={fetchData}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Inventory Table Section */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Inventory List</h2>
                <div className="flex items-center gap-2">
                  <SearchBar 
                    placeholder="Search SKU / Item" 
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
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
              <>
                <InventoryTable 
                  items={items} 
                  onReserve={() => router.push('/reservations')}
                  isAdmin={user?.role === 'admin'}
                />
                
                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between px-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <select 
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value));
                        setPage(1);
                      }}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-gray-300"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span> rows per page</span>
                  </div>
                  <Pagination 
                    currentPage={page} 
                    onPageChange={setPage} 
                    totalItems={totalListings} 
                    rowsPerPage={rowsPerPage}
                  />
                </div>
              </>
            )}
          </div>

      {/* Create Modal overlay */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Inventory Item</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={newItem.sku}
                  onChange={e => setNewItem({...newItem, sku: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g. SKU-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g. Widget C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newItem.totalQuantity}
                  onChange={e => setNewItem({...newItem, totalQuantity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              {createError && (
                <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded border border-red-900/50">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white rounded-lg transition"
                >
                  {createLoading ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}