'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getHistory, getHistoryStats } from '@/lib/api';
import StatCard from '@/components/StatCard';
import HistoryTable from '@/components/HistoryTable';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';
import { useSocketEvents } from '@/lib/useSocketEvents';

interface HistoryItem {
  id: string;
  sku: string;
  operator: { id: string; name: string; avatar: string };
  items: Array<{ name: string; quantity: number }>;
  requestedAt: string;
  status: 'Confirmed' | 'Expired' | 'Cancelled';
}

interface HistoryFilters {
  status: string;
  operator: string;
  startDate: string;
  endDate: string;
  searchTerm: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<{ confirmed: number; expired: number; cancelled: number }>({
    confirmed: 0,
    expired: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<HistoryFilters>({
    status: 'All Status',
    operator: 'All Operators',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters, refreshKey, user]);

  useSocketEvents({
    reservationUpdate: () => fetchData(),
    inventoryUpdate: () => fetchData(),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        getHistoryStats(),
        getHistory({
          page,
          limit: rowsPerPage,
          status: filters.status === 'All Status' ? undefined : filters.status,
          operator: filters.operator === 'All Operators' ? undefined : filters.operator,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          search: filters.searchTerm || undefined,
        })
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data?.data || []);
      setTotalItems(historyRes.data?.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchData();
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'All Status',
      operator: 'All Operators',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    setPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">History</h1>
              <p className="text-gray-400 text-sm mt-1">
                {isAdmin ? 'View all reservation activity' : 'View your reservation history'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard 
                title="Confirmed" 
                value={stats.confirmed.toLocaleString()} 
                icon="check" 
                bgColor="bg-green-50" 
                textColor="text-green-800"
              />
              <StatCard 
                title="Expired" 
                value={stats.expired.toLocaleString()} 
                icon="clock" 
                bgColor="bg-yellow-50" 
                textColor="text-yellow-800"
              />
              <StatCard 
                title="Cancelled" 
                value={stats.cancelled.toLocaleString()} 
                icon="lock" 
                bgColor="bg-red-50" 
                textColor="text-red-800"
              />
            </div>
          </div>

          {/* Filters */}
          <FilterBar 
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />

          {/* Apply Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition"
            >
              Apply Filters
            </button>
          </div>

          {/* History Table Section */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-gray-400">
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading history...
                </div>
              </div>
            ) : (
              <HistoryTable items={history} />
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between px-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
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
              totalItems={totalItems} 
              rowsPerPage={rowsPerPage}
            />
          </div>
    </div>
  );
}
