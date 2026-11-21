'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { DecisionConflict, ExecutionRisk } from '@/lib/types';
import UploadMeetingModal from '../meetings/UploadMeetingModal';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [conflicts, setConflicts] = useState<DecisionConflict[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [showResetToast, setShowResetToast] = useState(false);

  const loadData = () => {
    setConflicts(CommitOSStore.getConflicts().filter((c) => c.status === 'pending'));
    setRisks(CommitOSStore.getRisks());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, []);

  const handleResetDemo = () => {
    CommitOSStore.resetToDemo();
    setShowResetToast(true);
    setTimeout(() => setShowResetToast(false), 3000);
  };

  const totalAlerts = conflicts.length + (risks.some((r) => r.level === 'HIGH') ? 1 : 0);

  return (
    <>
      <header className="h-16 border-b border-[#1f1f27] bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">{title || 'Dashboard'}</h1>
          {subtitle && <p className="text-xs text-zinc-400 font-normal">{subtitle}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search trigger */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings, decisions, tasks..."
              className="w-64 pl-8 pr-3 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
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
            title="Reset data to initial SVIT Podcast Club demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#14141a] border border-[#23232e] text-zinc-400 hover:text-white transition-colors"
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
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#121217] border border-[#272733] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#21212b]">
                  <p className="text-xs font-semibold text-white">Execution Alerts</p>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {conflicts.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Decision Conflict Pending</span>
                      </div>
                      <p className="text-zinc-300 mt-1 text-[11px]">
                        Proposal to shift event date to {c.proposedValue} conflicts with approved {c.previousValue}.
                      </p>
                      <Link
                        href={`/meetings/${c.newMeetingId}`}
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-amber-400 hover:underline mt-1.5 inline-block font-medium"
                      >
                        Review Conflict Triage →
                      </Link>
                    </div>
                  ))}

                  {risks.filter((r) => r.level === 'HIGH').map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs"
                    >
                      <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{r.title}</span>
                      </div>
                      <p className="text-zinc-300 mt-1 text-[11px] line-clamp-2">{r.reason}</p>
                      <Link
                        href="/analytics"
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-rose-400 hover:underline mt-1.5 inline-block font-medium"
                      >
                        Inspect Risk Analysis →
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

          {/* Primary CTA: Upload Meeting Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Meeting</span>
          </button>
        </div>
      </header>

      {/* Demo Reset Feedback Toast */}
      {showResetToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#16161d] border border-zinc-700 px-4 py-2.5 rounded-xl text-xs text-white shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Reset complete! SVIT Podcast Club records restored.</span>
        </div>
      )}

      {/* Upload Meeting Modal */}
      <UploadMeetingModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  );
}
