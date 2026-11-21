'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  History,
  AlertTriangle,
} from 'lucide-react';
import { DecisionConflict, ConflictStatus } from '@/lib/types';
import { CommitOSStore } from '@/lib/store';

interface ConflictAlertCardProps {
  conflict: DecisionConflict;
  onResolved?: (status: ConflictStatus) => void;
}

export default function ConflictAlertCard({ conflict, onResolved }: ConflictAlertCardProps) {
  const [status, setStatus] = useState<ConflictStatus>(conflict.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');

  const handleTriageAction = (action: ConflictStatus) => {
    setIsSubmitting(true);
    setTimeout(() => {
      CommitOSStore.resolveConflict(
        conflict.id,
        action,
        action === 'approved'
          ? 'Ratified date revision in conflict triage'
          : action === 'rejected'
          ? 'Rejected date revision to maintain original schedule'
          : 'Flagged for leadership discussion',
        'Yug (Production Head)'
      );
      setStatus(action);
      setIsSubmitting(false);
      if (onResolved) onResolved(action);
    }, 400);
  };

  return (
    <div className="rounded-xl bg-[#14141a] border border-amber-500/30 overflow-hidden shadow-xl">
      {/* Top Banner */}
      <div className="px-5 py-3 bg-amber-500/15 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300 tracking-wide uppercase">
              Signature AI: Decision Conflict Detected
            </h4>
            <p className="text-[11px] text-amber-200/70">
              Contradiction identified between current discussion and historical organizational memory
            </p>
          </div>
        </div>

        {status !== 'pending' && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
              status === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : status === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Previous Approved Decision */}
          <div className="p-3.5 rounded-lg bg-[#0d0d12] border border-[#23232f] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Previously Approved
              </span>
              <span className="text-[11px] text-zinc-500">{conflict.previousMeetingDate}</span>
            </div>
            <p className="text-sm font-semibold text-white">{conflict.previousValue}</p>
            <p className="text-[11px] text-zinc-400">
              Source: <span className="text-zinc-200">{conflict.previousMeetingTitle}</span>
            </p>
          </div>

          {/* New Proposal */}
          <div className="p-3.5 rounded-lg bg-[#0d0d12] border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                New Proposal
              </span>
              <span className="text-[11px] text-zinc-500">Proposed in this meeting</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">{conflict.proposedValue}</p>
            <p className="text-[11px] text-zinc-400">
              Source: <span className="text-zinc-200">{conflict.newMeetingTitle}</span>
            </p>
          </div>
        </div>

        {/* Reason & Blast Radius */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-[#181822] border border-[#2b2b3a] space-y-1">
            <p className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Conflict Rationale</span>
            </p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">{conflict.conflictReason}</p>
          </div>

          <div className="p-3 rounded-lg bg-[#181822] border border-[#2b2b3a] space-y-1">
            <p className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Execution Blast Radius</span>
            </p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">{conflict.impact}</p>
          </div>
        </div>

        {/* Human-in-the-Loop Confirmation Triage Workflow */}
        {status === 'pending' ? (
          <div className="pt-2 border-t border-[#22222e] flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400">
              Authorized Action Required: <strong className="text-white">Yug (Production Head)</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTriageAction('rejected')}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Reject Change</span>
              </button>

              <button
                onClick={() => handleTriageAction('discussed')}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                <span>Request Discussion</span>
              </button>

              <button
                onClick={() => handleTriageAction('approved')}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition-colors shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Approve Change</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-[#22222e] text-xs text-zinc-400 flex items-center justify-between">
            <span>
              Resolution ratified by <strong>Yug (Production Head)</strong>
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Status: {status.toUpperCase()} • History Logged
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
