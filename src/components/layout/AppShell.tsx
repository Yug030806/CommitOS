'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { CommitOSStore } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname === '/signin' || pathname === '/signup';

  useEffect(() => {
    const authedState = CommitOSStore.isAuthenticated();
    if (!authedState && !isAuthRoute) {
      router.replace('/signin');
    }
  }, [pathname, isAuthRoute, router]);

  // Auth pages render without shell
  if (isAuthRoute) {
    return <main className="min-h-screen w-full relative">{children}</main>;
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
