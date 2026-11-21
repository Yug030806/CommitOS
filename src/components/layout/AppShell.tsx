'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { CommitOSStore } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isAuthRoute = pathname === '/signin' || pathname === '/signup';

  useEffect(() => {
    const authedState = CommitOSStore.isAuthenticated();
    if (!authedState && !isAuthRoute) {
      router.replace('/signin');
    }
  }, [pathname, isAuthRoute, router]);

  // Close mobile navigation drawer whenever route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Auth pages render without shell
  if (isAuthRoute) {
    return <main className="min-h-screen w-full relative">{children}</main>;
  }

  return (
    <div className="flex flex-row min-h-screen w-full">
      {/* Mobile-Responsive Drawer Sidebar */}
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen bg-[#09090b] w-full min-w-0 overflow-x-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          isMobileNavOpen={isMobileNavOpen}
        />
        <main className="flex-1 pb-16 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
