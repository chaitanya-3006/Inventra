'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getInventoryStats, getHistoryStats, getSafeLockStats } from '@/lib/api';
import StatCard from '@/components/StatCard';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';
import { useSocketEvents } from '@/lib/useSocketEvents';

interface AnalyticsData {
  totalInventory: number;
  availableItems: number;
  reservedItems: number;
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  expiredReservations: number;
  totalLocked: number;
  expiringLocksSoon: number;
  safeLockedItemsCount: number;
}

const RESERVATION_COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green, Red, Yellow
const INVENTORY_COLORS = ['#3b82f6', '#f59e0b']; // Blue, Yellow
const SAFELOCK_COLORS = ['#8b5cf6', '#ec4899']; // Purple, Pink

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
    totalLocked: 0,
    expiringLocksSoon: 0,
    safeLockedItemsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/inventory');
      return;
    }
    fetchAnalytics();
  }, [user]);

  useSocketEvents({
    analyticsUpdate: () => fetchAnalytics(),
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [inventoryStats, historyStats, safeLockStats] = await Promise.all([
        getInventoryStats(),
        getHistoryStats(),
        getSafeLockStats(),
      ]);

      const invData = inventoryStats.data;
      const histData = historyStats.data;
      const safeData = safeLockStats.data;

      setAnalytics({
        totalInventory: parseInt(invData?.totalItems || '0'),
        availableItems: parseInt(invData?.availableItems || '0'),
        reservedItems: parseInt(invData?.totalItems || '0') - parseInt(invData?.availableItems || '0'),
        totalReservations: (histData?.confirmed || 0) + (histData?.expired || 0) + (histData?.cancelled || 0),
        confirmedReservations: histData?.confirmed || 0,
        cancelledReservations: histData?.cancelled || 0,
        expiredReservations: histData?.expired || 0,
        totalLocked: safeData?.totalLocked || 0,
        expiringLocksSoon: safeData?.expiringSoon || 0,
        safeLockedItemsCount: safeData?.safeLockedItems || 0,
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const pieData = [
    { name: 'Confirmed', value: analytics.confirmedReservations },
    { name: 'Cancelled', value: analytics.cancelledReservations },
    { name: 'Expired', value: analytics.expiredReservations },
  ];

  const barData = [
    { name: 'Available', value: analytics.availableItems },
    { name: 'Reserved', value: analytics.reservedItems },
  ];

  // Chart 3: Safe Locks Expiration
  const safeLockData = [
    { name: 'Expiring Soon', value: analytics.expiringLocksSoon },
    { name: 'Secure / Permanent', value: Math.max(0, analytics.safeLockedItemsCount - analytics.expiringLocksSoon) },
  ];

  // Chart 4: System Profile Radar
  const radarData = [
    { subject: 'Utilization', value: Math.min(100, analytics.totalInventory > 0 ? (analytics.reservedItems / analytics.totalInventory) * 100 : 0), fullMark: 100 },
    { subject: 'Success Rate', value: Math.min(100, analytics.totalReservations > 0 ? (analytics.confirmedReservations / analytics.totalReservations) * 100 : 0), fullMark: 100 },
    { subject: 'Lock Ratio', value: Math.min(100, analytics.totalInventory > 0 ? (analytics.totalLocked / analytics.totalInventory) * 100 : 0), fullMark: 100 },
    { subject: 'Risk (Expiry)', value: Math.min(100, analytics.safeLockedItemsCount > 0 ? (analytics.expiringLocksSoon / analytics.safeLockedItemsCount) * 100 : 0), fullMark: 100 },
  ];

  // Chart 5: System Volumes
  const volumeData = [
    { name: 'Gross Inventory', value: analytics.totalInventory },
    { name: 'Total Reservations', value: analytics.totalReservations },
    { name: 'Total Locked Items', value: analytics.totalLocked },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-gray-400 text-sm mt-1">System overview and detailed analysis</p>
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
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-5 gap-4 mb-8">
                <StatCard 
                  title="Total Items" 
                  value={analytics.totalInventory.toLocaleString()} 
                  icon="box" 
                  bgColor="bg-blue-50" 
                  textColor="text-blue-800"
                />
                <StatCard 
                  title="Total Reservations" 
                  value={analytics.totalReservations.toLocaleString()} 
                  icon="box" 
                  bgColor="bg-indigo-50" 
                  textColor="text-indigo-800"
                />
                <StatCard 
                  title="Success Rate" 
                  value={analytics.totalReservations > 0 ? `${Math.round((analytics.confirmedReservations / analytics.totalReservations) * 100)}%` : '0%'} 
                  icon="check" 
                  bgColor="bg-purple-50" 
                  textColor="text-purple-800"
                />
                <StatCard 
                  title="Utilization" 
                  value={analytics.totalInventory > 0 ? `${Math.round((analytics.reservedItems / analytics.totalInventory) * 100)}%` : '0%'} 
                  icon="package" 
                  bgColor="bg-green-50" 
                  textColor="text-green-800"
                />
                <StatCard 
                  title="Safe-Lock Priority" 
                  value={analytics.expiringLocksSoon.toLocaleString()} 
                  icon="clock" 
                  bgColor="bg-red-50" 
                  textColor="text-red-800"
                />
              </div>

              {/* Charts Top Row: 1 and 2 */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* 1. Inventory Status Bar Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-96">
                  <h2 className="text-xl font-bold text-white mb-6">Inventory Status</h2>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: '#374151', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={INVENTORY_COLORS[index % INVENTORY_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Reservation Breakdown Pie Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-96">
                  <h2 className="text-xl font-bold text-white mb-6">Reservation Breakdown</h2>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={RESERVATION_COLORS[index % RESERVATION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#9ca3af' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Bottom Row: 3, 4, and 5 */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* 3. Safe Lock Expiration Status */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-96">
                  <h2 className="text-xl font-bold text-white mb-6">Safe Lock Status</h2>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeLockData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {safeLockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SAFELOCK_COLORS[index % SAFELOCK_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#9ca3af' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. System Process Radar */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-96">
                  <h2 className="text-xl font-bold text-white mb-6">Performance Profile</h2>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="System Score %" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                          formatter={(value: any) => [`${Math.round(Number(value) || 0)}%`, 'Score']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Overall System Volumes */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col h-96">
                  <h2 className="text-xl font-bold text-white mb-6">System Volumes</h2>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                        <XAxis type="number" stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#9ca3af" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          cursor={{ fill: '#374151', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </>
          )}
    </div>
  );
}


