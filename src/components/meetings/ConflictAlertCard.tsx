'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  History,
  Lock,
  UserCheck,
} from 'lucide-react';
import { DecisionConflict, TeamMember } from '@/lib/types';
import { CommitOSStore } from '@/lib/store';
import { RBAC, ROLE_DEFINITIONS } from '@/lib/rbac';

interface ConflictAlertCardProps {
  conflict: DecisionConflict;
  onResolved?: () => void;
}

export default function ConflictAlertCard({ conflict, onResolved }: ConflictAlertCardProps) {
  const [status, setStatus] = useState<DecisionConflict['status']>(conflict.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUser: TeamMember = CommitOSStore.getCurrentUser();
  const isLeaderAuthorized = CommitOSStore.isLeaderApprovalAuthorized();

  const canApproveResult = RBAC.canApproveDecisionConflict(currentUser.role, isLeaderAuthorized);
  const canReject = currentUser.role === 'org_admin' || currentUser.role === 'team_leader';

  const handleTriageAction = async (newStatus: 'approved' | 'rejected' | 'discussed') => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Server-side permission barrier check
      const res = await fetch('/api/triage-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflictId: conflict.id,
          action: newStatus,
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            organizationId: CommitOSStore.getActiveOrgId(),
          },
          isLeaderAuthorized,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Server rejected action due to insufficient permissions.');
      }

      // 2. Client-side state persistence
      if (newStatus === 'approved') {
        CommitOSStore.resolveConflict(conflict.id, 'approved');
        setStatus('approved');
      } else if (newStatus === 'rejected') {
        CommitOSStore.resolveConflict(conflict.id, 'rejected');
        setStatus('rejected');
      } else {
        setStatus('discussed');
      }

      if (onResolved) onResolved();
    } catch (err: any) {
      setErrorMessage(err.message || 'Permission denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#14141a] border border-zinc-700 overflow-hidden shadow-xl">
      {/* Top Banner */}
      <div className="px-5 py-3 bg-[#181822] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase">
              Decision Conflict Detected
            </h4>
            <p className="text-[11px] text-zinc-400">
              Contradiction identified between current discussion and historical organizational memory
            </p>
          </div>
        </div>

        {status !== 'pending' && (
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
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
          <div className="p-3.5 rounded-lg bg-[#0d0d12] border border-zinc-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-600">
                New Proposal
              </span>
              <span className="text-[11px] text-zinc-500">Proposed in this meeting</span>
            </div>
            <p className="text-sm font-semibold text-white">{conflict.proposedValue}</p>
            <p className="text-[11px] text-zinc-400">
              Source: <span className="text-zinc-200">{conflict.newMeetingTitle}</span>
            </p>
          </div>
        </div>

        {/* Reason & Blast Radius */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-[#181822] border border-[#2b2b3a] space-y-1">
            <p className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Conflict Rationale</span>
            </p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">{conflict.conflictReason}</p>
          </div>

          <div className="p-3 rounded-lg bg-[#181822] border border-[#2b2b3a] space-y-1">
            <p className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Execution Blast Radius</span>
            </p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">{conflict.impact}</p>
          </div>
        </div>

        {/* Error notification if server rejects action */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-zinc-400" />
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
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${isLeaderAuthorized ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Request Discussion</span>
                </button>

                {/* 3. Approve Change - Enforce Org Admin or Authorized Leader */}
                {canApproveResult.allowed ? (
                  <button
                    onClick={() => handleTriageAction('approved')}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors shadow active:scale-95"
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
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
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
              <UserCheck className="w-3.5 h-3.5 text-white" />
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
