'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Upload,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown,
  Shield,
  ShieldCheck,
  User,
  Users,
  Settings,
  Lock,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { DecisionConflict, ExecutionRisk, TeamMember } from '@/lib/types';
import { RBAC, ROLE_DEFINITIONS } from '@/lib/rbac';
import UploadMeetingModal from '../meetings/UploadMeetingModal';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [conflicts, setConflicts] = useState<DecisionConflict[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [showResetToast, setShowResetToast] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());
  const [members, setMembers] = useState<TeamMember[]>(() => CommitOSStore.getMembers());

  const personaMenuRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setConflicts(CommitOSStore.getConflicts().filter((c) => c.status === 'pending'));
    setRisks(CommitOSStore.getRisks());
    setCurrentUser(CommitOSStore.getCurrentUser());
    setMembers(CommitOSStore.getMembers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(e.target as Node)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetDemo = () => {
    CommitOSStore.resetToDemo();
    setShowResetToast(true);
    setTimeout(() => setShowResetToast(false), 3000);
  };

  const handleSwitchUser = (member: TeamMember) => {
    CommitOSStore.setCurrentUser(member);
    setShowPersonaMenu(false);
  };

  const totalAlerts = conflicts.length + (risks.some((r) => r.level === 'HIGH') ? 1 : 0);
  const canUpload = RBAC.canUploadMeetings(currentUser.role);
  const roleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.team_member;

  return (
    <>
      <header className="h-16 border-b border-[#1f1f27] bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">{title || 'Dashboard'}</h1>
          {subtitle && <p className="text-xs text-zinc-400 font-normal">{subtitle}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search trigger */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings, decisions, tasks..."
              className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              onClick={() => {
                const el = document.getElementById('ask-commitos-input');
                if (el) el.focus();
              }}
            />
          </div>

          {/* Reset Demo button for Hackathon presentation */}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-zinc-400 hover:text-white hover:bg-[#1f1f27] transition-all"
            title="Reset data to initial clean demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Reset Demo</span>
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#14141a] border border-[#23232e] text-zinc-400 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#121217] border border-[#282836] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#20202b]">
                  <span className="text-xs font-semibold text-white">System Alerts & Notifications</span>
                  <span className="text-[11px] text-zinc-400 font-mono">{totalAlerts} Active</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {conflicts.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Decision Conflict Detected</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">{c.conflictReason}</p>
                      <Link
                        href={`/meetings/${c.newMeetingId}`}
                        onClick={() => setShowNotifications(false)}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 pt-1"
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
                        className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Predictive Execution Risk: HIGH</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">{r.title}</p>
                        <Link
                          href="/analytics"
                          onClick={() => setShowNotifications(false)}
                          className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 pt-1"
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

          {/* Primary CTA: Upload Meeting Button (Permission Aware) */}
          {canUpload ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Upload Meeting</span>
            </button>
          ) : (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-xs transition-colors"
              title="Upload requires Organization Admin or Team Leader privileges. Click to view permission requirements."
            >
              <Lock className="w-3 h-3 text-zinc-500" />
              <span className="hidden sm:inline">Upload Meeting</span>
            </button>
          )}

          {/* RBAC Persona Switcher (Superpower for Hackathon Demos) */}
          <div className="relative" ref={personaMenuRef}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-[#14141a] hover:bg-[#1a1a24] border border-[#23232e] transition-all text-left"
              title="Switch user role & persona to test RBAC permissions"
            >
              <div className="w-6 h-6 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                {currentUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name[0]
                )}
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white leading-none truncate max-w-[80px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono border ${roleDef.badgeClass}`}>
                    {roleDef.badgeLabel}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            {/* Persona Switcher Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#121217] border border-[#282836] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="pb-2 mb-2 border-b border-[#20202b] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>RBAC Persona Switcher</span>
                    </p>
                    <p className="text-[10px] text-zinc-400">Switch role to test live permission barriers</p>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {members.map((m) => {
                    const isSelected = m.id === currentUser.id;
                    const mRoleDef = ROLE_DEFINITIONS[m.role] || ROLE_DEFINITIONS.team_member;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSwitchUser(m)}
                        className={`w-full p-2 rounded-lg flex items-center justify-between text-left transition-colors text-xs ${
                          isSelected
                            ? 'bg-zinc-800/90 border border-zinc-600/70 text-white'
                            : 'hover:bg-[#181822] text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                            {m.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name[0]
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs">{m.name}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{m.title}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border shrink-0 ${mRoleDef.badgeClass}`}>
                          {mRoleDef.badgeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-2 border-t border-[#20202b] flex items-center justify-between text-[11px]">
                  <Link
                    href="/settings?tab=team"
                    onClick={() => setShowPersonaMenu(false)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    <span>Manage Team Roster</span>
                  </Link>
                  <span className="text-[10px] text-zinc-500 font-mono">RBAC MVP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Demo Reset Feedback Toast */}
      {showResetToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#16161d] border border-zinc-700 px-4 py-2.5 rounded-xl text-xs text-white shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Demo restored to initial clean state.</span>
        </div>
      )}

      {/* Upload Meeting Modal */}
      <UploadMeetingModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  );
}
