'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PackageSearch, 
  CalendarDays, 
  History, 
  ShieldCheck, 
  LockKeyhole, 
  LogOut, 
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';

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
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Inventory', href: '/inventory', icon: PackageSearch },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays },
    { name: 'History', href: '/history', icon: History },
    { name: 'Audit Log', href: '/admin/audit-log', icon: ShieldCheck },
    { name: 'Safe-Lock', href: '/admin/safe-lock', icon: LockKeyhole },
  ];

  const operatorMenu = [
    { name: 'Inventory', href: '/inventory', icon: PackageSearch },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays },
    { name: 'History', href: '/history', icon: History },
  ];

  const menuItems = user.role === 'admin' ? adminMenu : operatorMenu;

  return (
    <motion.aside 
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-gray-800/60 w-[260px] flex flex-col relative z-20 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center px-6 py-8">
        <motion.div 
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-extrabold text-xl tracking-tight">
          Inventra
        </span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.name} passHref legacyBehavior>
              <a className="block relative">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-4 py-3.5 rounded-2xl cursor-pointer transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gray-800/50 rounded-2xl border border-gray-700/50 shadow-inner"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} />
                  <span className={`ml-3 text-sm relative z-10 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.name}
                  </span>
                </motion.div>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mb-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <h3 className="text-gray-300 text-sm font-semibold mb-1 relative z-10">System Access</h3>
          <p className="text-gray-500 text-xs mb-4 relative z-10">Logged in as <span className="text-indigo-400 font-mono">{user.role}</span></p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-colors relative z-10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </motion.div>
      </div>
    </motion.aside>
  );
}