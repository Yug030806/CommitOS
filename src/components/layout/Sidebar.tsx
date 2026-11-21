'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Building,
  Check,
  Users,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Organization, DecisionConflict, ExecutionRisk, TeamMember } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/rbac';

export default function Sidebar() {
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [pendingConflicts, setPendingConflicts] = useState<DecisionConflict[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());

  const orgDropdownRef = useRef<HTMLDivElement>(null);

  const refreshState = () => {
    setOrg(CommitOSStore.getOrganization());
    setAllOrgs(CommitOSStore.getAllOrganizations());
    const conflicts = CommitOSStore.getConflicts().filter((c) => c.status === 'pending');
    setPendingConflicts(conflicts);
    setRisks(CommitOSStore.getRisks());
    setCurrentUser(CommitOSStore.getCurrentUser());
    const settings = CommitOSStore.getSettings();
    setIsLiveAI(Boolean(settings.geminiApiKey));
  };

  useEffect(() => {
    refreshState();
    window.addEventListener('commitos_storage_updated', refreshState);
    return () => window.removeEventListener('commitos_storage_updated', refreshState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOrg = (orgId: string) => {
    CommitOSStore.setActiveOrganization(orgId);
    setIsOrgDropdownOpen(false);
  };

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
      name: 'Settings & Team',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const roleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.team_member;

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
                  RBAC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal">AI Decision & Execution</p>
            </div>
          </Link>
        </div>

        {/* Organization Switcher Dropdown (Multi-Tenant Isolation) */}
        <div className="p-3 border-b border-[#1a1a22] relative" ref={orgDropdownRef}>
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-[#14141a] hover:bg-[#1a1a24] border border-[#23232e] text-xs transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700 shrink-0">
                {org?.name ? org.name[0] : 'O'}
              </div>
              <div className="truncate min-w-0">
                <p className="font-semibold text-zinc-200 truncate text-xs">{org?.name || 'Select Organization'}</p>
                <p className="text-[10px] text-zinc-500">{org?.members?.length || 0} Members • Isolated</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute left-3 right-3 top-14 bg-[#14141d] border border-[#2c2c3b] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Select Organization
              </div>
              <div className="space-y-1 mt-1">
                {allOrgs.map((o) => {
                  const isSelected = o.id === org?.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => handleSelectOrg(o.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                        isSelected
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-300 hover:bg-[#1c1c28]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-xs">{o.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{o.members.length} members</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-[#252533] px-1">
                <Link
                  href="/settings?tab=team"
                  onClick={() => setIsOrgDropdownOpen(false)}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1.5 py-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Team Management</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Signature Conflict Notification Banner if any */}
        {pendingConflicts.length > 0 && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2">
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

      {/* Footer Area: AI Mode Status & Current User Identity */}
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

        {/* User Identity Card with Role Badge */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#14141a] border border-[#22222d]">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center text-xs font-bold text-white">
            {currentUser.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name[0]
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-semibold text-zinc-100 truncate">{currentUser.name}</p>
              <span className={`text-[9px] px-1 py-0.2 rounded font-mono border shrink-0 ${roleDef.badgeClass}`}>
                {roleDef.badgeLabel}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">{currentUser.title}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
