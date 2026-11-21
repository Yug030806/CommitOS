'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Menu,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { DecisionConflict, ExecutionRisk, TeamMember } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
  isMobileNavOpen?: boolean;
}

export default function Header({ title, subtitle, onToggleMobileMenu, isMobileNavOpen }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [conflicts, setConflicts] = useState<DecisionConflict[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());

  const loadData = () => {
    setConflicts(CommitOSStore.getConflicts().filter((c) => c.status === 'pending'));
    setRisks(CommitOSStore.getRisks());
    setCurrentUser(CommitOSStore.getCurrentUser());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, []);

  const handleSignOut = () => {
    CommitOSStore.logout();
    window.location.href = '/signin';
  };

  const totalAlerts = conflicts.length + (risks.some((r) => r.level === 'HIGH') ? 1 : 0);
  const roleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.team_member;

  return (
    <header className="h-16 border-b border-[#1f1f27] bg-[#09090b]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 -ml-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
              {title || 'Dashboard'}
            </h1>
            {subtitle && <p className="text-xs text-zinc-400 font-normal truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#14141a] border border-[#23232e] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[10px] text-black font-bold flex items-center justify-center">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-[#121217] border border-[#282836] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#20202b]">
                  <span className="text-xs font-semibold text-white">System Alerts & Notifications</span>
                  <span className="text-[11px] text-zinc-400 font-mono">{totalAlerts} Active</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {conflicts.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-[#181822] border border-[#282838] text-xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Decision Conflict Detected</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{c.conflictReason}</p>
                      <Link
                        href={`/meetings/${c.newMeetingId}`}
                        onClick={() => setShowNotifications(false)}
                        className="text-[10px] text-zinc-300 hover:text-white hover:underline flex items-center gap-1 pt-1"
                      >
                        <span>Review in {c.newMeetingTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  ))}

                  {risks
                    .filter((r) => r.level === 'HIGH')
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-lg bg-[#181822] border border-[#282838] text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Predictive Execution Risk: HIGH</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{r.title}</p>
                        <Link
                          href="/analytics"
                          onClick={() => setShowNotifications(false)}
                          className="text-[10px] text-zinc-300 hover:text-white hover:underline flex items-center gap-1 pt-1"
                        >
                          <span>Inspect Root Cause</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    ))}

                  {totalAlerts === 0 && (
                    <div className="text-center py-4 text-xs text-zinc-500">
                      <CheckCircle2 className="w-6 h-6 text-zinc-600 mx-auto mb-1.5" />
                      All organizational commitments are on track.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Name & Role Display */}
          <div className="hidden xs:flex sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e]">
            <span className="text-xs font-semibold text-white truncate max-w-[80px] sm:max-w-[120px]">
              {currentUser.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${roleDef.badgeClass}`}>
              {roleDef.badgeLabel}
            </span>
          </div>

          {/* Sign Out Action Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all"
            title="Sign out of current account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-xs">Sign Out</span>
          </button>
        </div>
      </header>
    );
}
