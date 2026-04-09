'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  const adminMenu = [
    { name: 'Analytics', href: '/admin/analytics', icon: <AnalyticsIcon /> },
    { name: 'Inventory', href: '/inventory', icon: <InventoryIcon /> },
    { name: 'Reservations', href: '/reservations', icon: <CalendarIcon /> },
    { name: 'History', href: '/history', icon: <HistoryIcon /> },
    { name: 'Audit Log', href: '/admin/audit-log', icon: <ShieldIcon /> },
    { name: 'Safe-Lock', href: '/admin/safe-lock', icon: <LockIcon /> },
  ];

  const operatorMenu = [
    { name: 'Inventory', href: '/inventory', icon: <InventoryIcon /> },
    { name: 'Reservations', href: '/reservations', icon: <CalendarIcon /> },
    { name: 'History', href: '/history', icon: <HistoryIcon /> },
  ];

  const menuItems = user.role === 'admin' ? adminMenu : operatorMenu;

  return (
    <aside className="bg-gray-900 border-r border-gray-800 w-64">
      <div className="flex items-center px-4 py-6">
        <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <span className="ml-3 text-white font-bold text-lg">Inventra</span>
      </div>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center px-4 py-3 text-sm font-medium">
            <a
              href={item.href}
              className={`flex w-full items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                pathname === item.href ? 'bg-gray-800 text-white' : ''
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </a>
          </div>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Need Help?</h3>
          <p className="text-gray-500 text-xs mb-3">Contact your administrator for system support</p>
          <button
            onClick={handleLogout}
            className="w-full mt-1 px-3 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

// Icon components (using simple SVG for now, replace with Heroicons if available)
function AnalyticsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 12c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm9-11v2h-1V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4v2h16v-2z" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h2a2 2 0 000-4H9z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2zm0 12c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V5a4 4 0 00-4-4H6a4 4 0 00-4 4v6" />
    </svg>
  );
}