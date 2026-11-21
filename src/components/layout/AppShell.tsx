'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { CommitOSStore } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = () => {
    const authed = CommitOSStore.isAuthenticated();
    setIsAuthenticated(authed);
    if (!authed && pathname !== '/signin' && pathname !== '/signup') {
      router.replace('/signin');
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('commitos_storage_updated', checkAuth);
    return () => window.removeEventListener('commitos_storage_updated', checkAuth);
  }, [pathname]);

  const isAuthRoute = pathname === '/signin' || pathname === '/signup';

  // Auth pages render without shell
  if (isAuthRoute) {
    return <main className="min-h-screen w-full bg-[#09090b]">{children}</main>;
  }

  // Loading state while checking authentication
  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Role Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen w-full">
      {/* Main Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-[#09090b]">
        <Header />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
