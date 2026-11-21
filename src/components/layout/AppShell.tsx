'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { CommitOSStore } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname === '/signin' || pathname === '/signup';
  const [isClient, setIsClient] = useState(false);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const authedState = CommitOSStore.isAuthenticated();
    setAuthed(authedState);

    if (!authedState && !isAuthRoute) {
      window.location.replace('/signin');
    }
  }, [pathname, isAuthRoute]);

  // Auth pages render without shell
  if (isAuthRoute) {
    return <main className="min-h-screen w-full bg-[#09090b]">{children}</main>;
  }

  // If user explicitly logged out and on protected page
  if (isClient && !authed) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs text-zinc-400">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#121217] border border-zinc-800 shadow-xl">
          <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          <span>Redirecting to Role Authentication...</span>
          <a href="/signin" className="underline text-white font-medium ml-2">Click to Enter</a>
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
