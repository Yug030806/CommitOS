'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  CheckSquare,
  BrainCircuit,
  BarChart3,
  Settings,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Organization, DecisionConflict, ExecutionRisk } from '@/lib/types';

export default function Sidebar() {
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<DecisionConflict[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [isLiveAI, setIsLiveAI] = useState(false);

  const refreshState = () => {
    setOrg(CommitOSStore.getOrganization());
    const conflicts = CommitOSStore.getConflicts().filter((c) => c.status === 'pending');
    setPendingConflicts(conflicts);
    setRisks(CommitOSStore.getRisks());
    const settings = CommitOSStore.getSettings();
    setIsLiveAI(Boolean(settings.geminiApiKey));
  };

  useEffect(() => {
    refreshState();
    window.addEventListener('commitos_storage_updated', refreshState);
    return () => window.removeEventListener('commitos_storage_updated', refreshState);
  }, []);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: Video,
      badge: pendingConflicts.length > 0 ? `${pendingConflicts.length} alert` : null,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      badge: null,
    },
    {
      name: 'Memory',
      href: '/memory',
      icon: BrainCircuit,
      badge: 'RAG',
      badgeColor: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const highRisk = risks.find((r) => r.level === 'HIGH');

  return (
    <aside className="w-64 h-screen bg-[#0d0d11] border-r border-[#1f1f27] flex flex-col justify-between select-none fixed left-0 top-0 z-40">
      {/* Brand & Organization Header */}
      <div>
        <div className="p-4 border-b border-[#1f1f27]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center text-black font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">CommitOS</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Agentic
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal">AI Decision & Execution</p>
            </div>
          </Link>
        </div>

        {/* Organization Switcher Dropdown */}
        <div className="p-3 border-b border-[#1a1a22]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#14141a] border border-[#23232e] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700">
                S
              </div>
              <div className="truncate">
                <p className="font-semibold text-zinc-200 truncate">{org?.name || 'SVIT Podcast Club'}</p>
                <p className="text-[10px] text-zinc-500">4 Active Members</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </div>
        </div>

        {/* Signature Conflict Notification Banner if any */}
        {pendingConflicts.length > 0 && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2 animate-pulse-subtle">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-amber-300 text-[11px]">Conflict Detected</p>
              <p className="text-[10px] text-amber-200/70 truncate">Dec 15 vs Dec 20 date drift</p>
              <Link
                href="/meetings/meet-003"
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium inline-block mt-0.5"
              >
                Triage Now →
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#16161d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: AI Mode Status & User Profile */}
      <div className="p-3 border-t border-[#1f1f27] space-y-2 bg-[#0a0a0e]">
        {/* Live Engine Indicator */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#121217] border border-[#21212a] text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLiveAI ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
            <span className="text-zinc-400">{isLiveAI ? 'Gemini 1.5 Live' : 'Demo Memory Mode'}</span>
          </div>
          <Link href="/settings" className="text-zinc-500 hover:text-zinc-300">
            <Radio className="w-3 h-3" />
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#14141a] border border-[#22222d]">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face"
              alt="Yug"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-100 truncate">Yug Patel</p>
            <p className="text-[10px] text-zinc-400 truncate">Production Head • Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
