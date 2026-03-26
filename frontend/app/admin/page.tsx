'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '../../lib/auth';
import AdminPanel from '../../components/AdminPanel';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    setUser(u);
    if (u && u.role !== 'admin') {
      router.replace('/inventory');
      return;
    }
    setChecked(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
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
            <button onClick={() => router.push('/admin')} className="text-brand-400 text-sm font-medium">Admin</button>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <span className="text-gray-400 text-sm">{user?.username}</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300">admin</span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm transition">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage inventory and view audit logs</p>
        </div>
        <AdminPanel />
      </main>
    </div>
  );
}
