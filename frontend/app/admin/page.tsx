'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'admin') {
      router.replace('/inventory');
    } else {
      router.replace('/admin/analytics');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400">Loading admin dashboard...</div>
    </div>
  );
}
