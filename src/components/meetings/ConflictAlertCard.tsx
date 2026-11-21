'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  History,
  AlertTriangle,
  Lock,
  UserCheck,
} from 'lucide-react';
import { DecisionConflict, ConflictStatus } from '@/lib/types';
import { CommitOSStore } from '@/lib/store';
import { RBAC, ROLE_DEFINITIONS } from '@/lib/rbac';

interface ConflictAlertCardProps {
  conflict: DecisionConflict;
  onResolved?: (status: ConflictStatus) => void;
}

export default function ConflictAlertCard({ conflict, onResolved }: ConflictAlertCardProps) {
  const [status, setStatus] = useState<ConflictStatus>(conflict.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverVerified, setServerVerified] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => CommitOSStore.getCurrentUser());
  const [isLeaderAuthorized, setIsLeaderAuthorized] = useState(() => CommitOSStore.isLeaderApprovalAuthorized());

  const syncUser = () => {
    setCurrentUser(CommitOSStore.getCurrentUser());
    setIsLeaderAuthorized(CommitOSStore.isLeaderApprovalAuthorized());
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('commitos_storage_updated', syncUser);
    return () => window.removeEventListener('commitos_storage_updated', syncUser);
  }, []);

  const canApproveResult = RBAC.canApproveDecisionConflict(currentUser.role, isLeaderAuthorized);
  const canReject = RBAC.canRejectDecisionConflict(currentUser.role);
  const canDiscuss = RBAC.canRequestDiscussion(currentUser.role);

  const handleTriageAction = async (action: ConflictStatus) => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // MANDATORY SERVER-SIDE PERMISSION VERIFICATION
      const res = await fetch('/api/triage-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflictId: conflict.id,
          action,
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            organizationId: CommitOSStore.getActiveOrgId(),
          },
          isLeaderAuthorized,
          resolutionNotes:
            action === 'approved'
              ? `Ratified date revision to "${conflict.proposedValue}" by ${currentUser.name} (${ROLE_DEFINITIONS[currentUser.role].label})`
              : action === 'rejected'
              ? `Rejected revision to maintain "${conflict.previousValue}" by ${currentUser.name}`
              : `Flagged for leadership discussion by ${currentUser.name}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Server rejected decision change.');
      }

      // Persist in local store with server-verified actor metadata
      const storeRes = CommitOSStore.resolveConflict(
        conflict.id,
        action,
        action === 'approved'
          ? `Ratified date revision in conflict triage by ${currentUser.name}`
          : action === 'rejected'
          ? `Rejected date revision by ${currentUser.name}`
          : `Flagged for discussion by ${currentUser.name}`,
        currentUser
      );

      if (!storeRes.success) {
        throw new Error(storeRes.message);
      }

      setStatus(action);
      setServerVerified(true);
      if (onResolved) onResolved(action);
    } catch (err: any) {
      setErrorMessage(err.message || 'Permission denied.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Error notification if server rejects action */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Human-in-the-Loop Confirmation Triage Workflow with Role-Aware Interface */}
        {status === 'pending' ? (
          <div className="pt-2 border-t border-[#22222e] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span>Active Persona:</span>
                <strong className="text-white">{currentUser.name}</strong>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${ROLE_DEFINITIONS[currentUser.role].badgeClass}`}>
                  {ROLE_DEFINITIONS[currentUser.role].label}
                </span>
                {currentUser.role === 'team_leader' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLeaderAuthorized ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                    {isLeaderAuthorized ? 'Admin Delegated' : 'Unratified Leader'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 1. Reject Change */}
                {canReject ? (
                  <button
                    onClick={() => handleTriageAction('rejected')}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reject Change</span>
                  </button>
                ) : (
                  <button
                    disabled
                    title="Rejecting official changes requires Organization Admin or Team Leader privileges"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-600 border border-zinc-800 text-xs font-medium cursor-not-allowed"
                  >
                    <Lock className="w-3 h-3 text-zinc-600" />
                    <span>Reject</span>
                  </button>
                )}

                {/* 2. Request Discussion - available to all roles */}
                <button
                  onClick={() => handleTriageAction('discussed')}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Request Discussion</span>
                </button>

                {/* 3. Approve Change - Enforce Org Admin or Authorized Leader */}
                {canApproveResult.allowed ? (
                  <button
                    onClick={() => handleTriageAction('approved')}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition-colors shadow active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve Change</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setErrorMessage(canApproveResult.reason || 'Approval requires Organization Admin authority.')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 border border-zinc-700/60 text-xs font-medium transition-colors cursor-pointer"
                    title={canApproveResult.reason}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                    <span>Approve (Admin Required)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Explanatory permission banner for Team Members */}
            {currentUser.role === 'team_member' && (
              <p className="text-[11px] text-zinc-500 bg-[#101015] p-2 rounded-lg border border-zinc-800/80 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>
                  <strong>Team Member View:</strong> You have read-only visibility into this decision conflict. You may request a discussion, but official ratifications require an Organization Admin.
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="pt-2 border-t border-[#22222e] text-xs text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resolution ratified and verified on server</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Status: {status.toUpperCase()} • RLS Audit Logged
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
