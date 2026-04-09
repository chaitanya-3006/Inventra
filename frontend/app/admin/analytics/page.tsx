'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getInventoryStats, getHistoryStats } from '@/lib/api';
import StatCard from '@/components/StatCard';

interface AnalyticsData {
  totalInventory: number;
  availableItems: number;
  reservedItems: number;
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  expiredReservations: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalInventory: 0,
    availableItems: 0,
    reservedItems: 0,
    totalReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    expiredReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/inventory');
      return;
    }
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [inventoryStats, historyStats] = await Promise.all([
        getInventoryStats(),
        getHistoryStats(),
      ]);

      const invData = inventoryStats.data;
      const histData = historyStats.data;

      setAnalytics({
        totalInventory: parseInt(invData?.totalItems || '0'),
        availableItems: parseInt(invData?.availableItems || '0'),
        reservedItems: parseInt(invData?.totalItems || '0') - parseInt(invData?.availableItems || '0'),
        totalReservations: histData?.confirmed + histData?.expired + histData?.cancelled || 0,
        confirmedReservations: histData?.confirmed || 0,
        cancelledReservations: histData?.cancelled || 0,
        expiredReservations: histData?.expired || 0,
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-gray-400 text-sm mt-1">System overview and statistics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-gray-400">
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading analytics...
              </div>
            </div>
          ) : (
            <>
              {/* Inventory Overview */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Inventory Overview</h2>
                <div className="grid grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Items" 
                    value={analytics.totalInventory.toLocaleString()} 
                    icon="box" 
                    bgColor="bg-blue-50" 
                    textColor="text-blue-800"
                  />
                  <StatCard 
                    title="Available" 
                    value={analytics.availableItems.toLocaleString()} 
                    icon="package" 
                    bgColor="bg-green-50" 
                    textColor="text-green-800"
                  />
                  <StatCard 
                    title="Reserved" 
                    value={analytics.reservedItems.toLocaleString()} 
                    icon="clock" 
                    bgColor="bg-yellow-50" 
                    textColor="text-yellow-800"
                  />
                  <StatCard 
                    title="Utilization" 
                    value={analytics.totalInventory > 0 ? `${Math.round((analytics.reservedItems / analytics.totalInventory) * 100)}%` : '0%'} 
                    icon="check" 
                    bgColor="bg-purple-50" 
                    textColor="text-purple-800"
                  />
                </div>
              </div>

              {/* Reservations Overview */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Reservations Overview</h2>
                <div className="grid grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Reservations" 
                    value={analytics.totalReservations.toLocaleString()} 
                    icon="box" 
                    bgColor="bg-indigo-50" 
                    textColor="text-indigo-800"
                  />
                  <StatCard 
                    title="Confirmed" 
                    value={analytics.confirmedReservations.toLocaleString()} 
                    icon="check" 
                    bgColor="bg-green-50" 
                    textColor="text-green-800"
                  />
                  <StatCard 
                    title="Cancelled" 
                    value={analytics.cancelledReservations.toLocaleString()} 
                    icon="lock" 
                    bgColor="bg-red-50" 
                    textColor="text-red-800"
                  />
                  <StatCard 
                    title="Expired" 
                    value={analytics.expiredReservations.toLocaleString()} 
                    icon="clock" 
                    bgColor="bg-yellow-50" 
                    textColor="text-yellow-800"
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Reservation Success Rate</h3>
                    <p className="text-3xl font-bold text-green-500">
                      {analytics.totalReservations > 0 
                        ? `${Math.round((analytics.confirmedReservations / analytics.totalReservations) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Stock Utilization</h3>
                    <p className="text-3xl font-bold text-blue-500">
                      {analytics.totalInventory > 0 
                        ? `${Math.round((analytics.reservedItems / analytics.totalInventory) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
    </div>
  );
}
