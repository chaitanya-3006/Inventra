'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAuditLogs } from '@/lib/api';
import AuditLogTable from '@/components/AuditLogTable';
import Pagination from '@/components/Pagination';
import FilterBar from '@/components/FilterBar';
import toast from 'react-hot-toast';

interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  ipAddress: string;
  createdAt: string;
}

interface AuditLogFilters {
  status: string;
  operator: string;
  startDate: string;
  endDate: string;
  searchTerm: string;
}

export default function AuditLogPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({
    status: 'All Actions', // Will be used for action filter
    operator: 'All Users', // Will be used for user filter
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/inventory');
      return;
    }
    fetchData();
  }, [page, rowsPerPage, filters, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: rowsPerPage,
        action: filters.status === 'All Actions' ? undefined : filters.status,
        userId: filters.operator === 'All Users' ? undefined : filters.operator, // Note: In a real app, we'd need to map username to userId
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.searchTerm || undefined
      });
      setAuditLogs(res.data?.data || []);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      toast.error('Failed to load audit logs. Please try again.');
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

      {/* Sidebar is now in layout */}
      
      <main className="flex-1 flex flex-col">
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
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
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
              <h1 className="text-2xl font-bold text-white">Audit Log</h1>
              <p className="text-gray-400 text-sm mt-1">View system activity and changes</p>
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
            </div>
          </div>

          {/* Filters Section - customized for audit log */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Action</label>
                <select
                  value={filters.status} // Using status field for action
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, status: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  <option value="All Actions">All Actions</option>
                  <option value="Item Added">Item Added</option>
                  <option value="Item Deleted">Item Deleted</option>
                  <option value="Item Updated">Item Updated</option>
                  <option value="Reservation Created">Reservation Created</option>
                  <option value="Reservation Canceled">Reservation Canceled</option>
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User</label>
                <select
                  value={filters.operator} // Using operator field for user
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, operator: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  <option value="All Users">All Users</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, startDate: e.target.value }));
                      setPage(1);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, endDate: e.target.value }));
                      setPage(1); // Reset page when changing date
                    }}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
              </div>

              {/* Search */}
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search ID or details"
                    value={filters.searchTerm}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
                      setPage(1);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <div className="col-span-1 lg:col-span-4 flex justify-end mt-4 md:mt-0">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

            {/* Main Content */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">Activity Log</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-gray-400">
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading audit logs...
                </div>
              </div>
            ) : (
              <>
                <AuditLogTable items={auditLogs} />
                
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
                    totalItems={totalItems}
                    rowsPerPage={rowsPerPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}