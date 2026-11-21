'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Building,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  Lock,
  History,
  Check,
  X,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { TeamMember, AppRole, AuditLog } from '@/lib/types';
import { RBAC, ROLE_DEFINITIONS } from '@/lib/rbac';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'audit' ? 'audit' : 'team';
  const [activeTab, setActiveTab] = useState<'team' | 'audit'>(initialTab);

  // RBAC & Team state
  const [members, setMembers] = useState<TeamMember[]>(() => CommitOSStore.getMembers());
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());
  const [isLeaderAuthorized, setIsLeaderAuthorized] = useState<boolean>(() =>
    CommitOSStore.isLeaderApprovalAuthorized()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => CommitOSStore.getAuditLogs());

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('team_member');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Edit role modal state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<AppRole>('team_member');
  const [editTitle, setEditTitle] = useState('');
  const [editError, setEditError] = useState('');

  const loadData = () => {
    setMembers(CommitOSStore.getMembers());
    setCurrentUser(CommitOSStore.getCurrentUser());
    setIsLeaderAuthorized(CommitOSStore.isLeaderApprovalAuthorized());
    setAuditLogs(CommitOSStore.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, []);

  const isAdmin = RBAC.canManageMembers(currentUser.role);
  const canManageOrg = RBAC.canManageOrganization(currentUser.role);

  // Toggle Leader Conflict Authorization
  const handleToggleLeaderAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const checked = e.target.checked;
    CommitOSStore.setLeaderApprovalAuthorized(checked);
    setIsLeaderAuthorized(checked);
  };

  // Handle Member Invitation (Server-Verified)
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Name and email are required.');
      return;
    }

    try {
      // 1. Server-side permission check
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            organizationId: CommitOSStore.getActiveOrgId(),
          },
          memberData: {
            name: inviteName,
            email: inviteEmail,
            role: inviteRole,
            title: inviteTitle || ROLE_DEFINITIONS[inviteRole].label,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Failed to invite member.');
      }

      // 2. Persist in local store
      CommitOSStore.inviteMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        title: inviteTitle || ROLE_DEFINITIONS[inviteRole].label,
      });

      setInviteSuccess(`Invitation sent to ${inviteEmail} with role: ${ROLE_DEFINITIONS[inviteRole].label}`);
      setInviteName('');
      setInviteEmail('');
      setInviteTitle('');
      setTimeout(() => {
        setIsInviteOpen(false);
        setInviteSuccess('');
      }, 1500);
    } catch (err: any) {
      setInviteError(err.message || 'Invitation failed.');
    }
  };

  // Handle Role Modification (Server-Verified)
  const handleSaveRoleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditError('');

    try {
      // 1. Server-side permission check
      const res = await fetch('/api/team/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            organizationId: CommitOSStore.getActiveOrgId(),
          },
          targetMemberId: editingMember.id,
          newRole: editRole,
          newTitle: editTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Failed to modify role.');
      }

      // 2. Persist in local store
      CommitOSStore.updateMemberRole(editingMember.id, editRole, editTitle);
      setEditingMember(null);
    } catch (err: any) {
      setEditError(err.message || 'Role modification failed.');
    }
  };

  // Handle Member Removal (Server-Verified)
  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} (${member.email}) from the organization?`)) {
      return;
    }

    try {
      // 1. Server-side permission check
      const res = await fetch('/api/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            organizationId: CommitOSStore.getActiveOrgId(),
          },
          targetMemberId: member.id,
          isSelf: member.id === currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Failed to remove member.');
      }

      // 2. Persist in local store
      CommitOSStore.removeMember(member.id);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const activeOrg = CommitOSStore.getOrganization();

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Organization & Team Access</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              RBAC Protected
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage multi-organization membership, role privileges, and decision authorization
          </p>
        </div>

        {/* Current Active Persona Banner */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#14141d] border border-[#262635] text-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{currentUser.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${ROLE_DEFINITIONS[currentUser.role].badgeClass}`}>
                {ROLE_DEFINITIONS[currentUser.role].label}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{currentUser.title} • {activeOrg.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#20202c] pb-1">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'team'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#14141c]'
          }`}
        >
          <Users className="w-4 h-4 text-white" />
          <span>Team Roster & Roles</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-700 text-zinc-300 font-mono">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#14141c]'
          }`}
        >
          <History className="w-4 h-4 text-white" />
          <span>Audit Log Trail</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-700 text-zinc-300 font-mono">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: TEAM ROSTER & ROLES */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Role Permission Scope Callout */}
          <div className="p-4 rounded-xl bg-[#14141e] border border-[#232332] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white mt-0.5">
                <ShieldCheck className="w-5 h-5 text-zinc-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Role Permissions: {ROLE_DEFINITIONS[currentUser.role].label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${ROLE_DEFINITIONS[currentUser.role].badgeClass}`}>
                    Active Persona
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {currentUser.role === 'org_admin' && (
                    <>You have <strong>full administrative access</strong>. You can invite new members, change roles, remove members, ratify official decision conflicts, and configure settings.</>
                  )}
                  {currentUser.role === 'team_leader' && (
                    <>You can <strong>upload meetings</strong>, create and assign tasks, and review AI summaries. Decision conflict ratifications require Admin delegation.</>
                  )}
                  {currentUser.role === 'team_member' && (
                    <>You have <strong>team contributor access</strong>. You can view permitted meetings, update your assigned task status, and query organizational memory.</>
                  )}
                </p>
              </div>
            </div>

            {/* Invite Button (Only enabled for Admins) */}
            {isAdmin ? (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-md transition-all active:scale-95 shrink-0"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Invite Member</span>
              </button>
            ) : (
              <div
                title="Only Organization Admins can invite new members"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/50 text-zinc-500 border border-zinc-800 text-xs shrink-0 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                <span>Invite Member (Admin Only)</span>
              </div>
            )}
          </div>

          {/* Admin Delegation Control: Leader Conflict Approval Authority */}
          <div className="p-4 rounded-xl bg-[#121218] border border-[#232332] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Authorize Team Leaders to Ratify Decision Changes</span>
                {isAdmin && (
                  <span className="text-[10px] text-zinc-300 font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                    Admin Controlled
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                When enabled by the Organization Admin, Team Leaders may officially approve or reject decision conflicts without secondary admin review.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isLeaderAuthorized}
                onChange={handleToggleLeaderAuth}
                disabled={!isAdmin}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>

          {/* Member List Table */}
          <div className="rounded-2xl bg-[#121217] border border-[#23232f] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1f1f28] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Active Organizational Roster</h3>
                <p className="text-xs text-zinc-400">Strictly isolated to {activeOrg.name}</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">{members.length} Total Members</span>
            </div>

            <div className="divide-y divide-[#1f1f28]">
              {members.map((member) => {
                const roleDef = ROLE_DEFINITIONS[member.role] || ROLE_DEFINITIONS.team_member;
                const isCurrent = member.id === currentUser.id;

                return (
                  <div
                    key={member.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#16161f] transition-colors"
                  >
                    {/* Member Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{member.email}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{member.title}</p>
                    </div>

                    {/* Role Badge & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 ${roleDef.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${roleDef.dotColor}`} />
                        <span>{roleDef.label}</span>
                      </span>

                      {/* Admin Controls: Edit Role & Remove */}
                      {isAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setEditRole(member.role);
                              setEditTitle(member.title);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
                            title="Modify member role and title"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemoveMember(member)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              isCurrent
                                ? 'bg-zinc-800/40 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700'
                            }`}
                            title={isCurrent ? 'Cannot remove your own admin account' : 'Remove member from organization'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          title="Role modifications require Organization Admin privileges"
                          className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Organization Profile */}
          <div className="p-6 rounded-2xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f28]">
              <Building className="w-4 h-4 text-white" />
              <div>
                <h3 className="text-sm font-semibold text-white">Active Organization Profile</h3>
                <p className="text-xs text-zinc-400">Multi-tenant workspace details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Organization Name</label>
                <div className="px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-zinc-200">
                  {activeOrg.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Organization Slug</label>
                <div className="px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-zinc-400 font-mono">
                  {activeOrg.slug}
                </div>
              </div>
            </div>
            {activeOrg.description && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <div className="px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-zinc-400">
                  {activeOrg.description}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG TRAIL */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-[#121217] border border-[#23232f] overflow-hidden shadow-xl space-y-0">
          <div className="p-4 border-b border-[#1f1f28] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Immutable Security & Governance Audit Trail</h3>
              <p className="text-xs text-zinc-400">Chronological ledger of role assignments, invitations, and decision ratifications</p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">{auditLogs.length} Events</span>
          </div>

          <div className="divide-y divide-[#1f1f28] max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => {
              const actorRoleDef = ROLE_DEFINITIONS[log.actorRole] || ROLE_DEFINITIONS.team_member;
              return (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs hover:bg-[#15151e] transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {log.action}
                      </span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-white font-medium">
                      Action executed by <strong className="text-zinc-200">{log.actorName}</strong> ({actorRoleDef.label})
                    </p>

                    {log.metadata && (
                      <p className="text-zinc-400 text-[11px] font-mono truncate max-w-xl">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900 px-2 py-1 rounded border border-zinc-800 shrink-0">
                    {log.entityType}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: INVITE MEMBER */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-[#2c2c3d] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21212e]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">Invite Organization Member</h3>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvi Shah"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161e] border border-[#2a2a3b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="tanvi@svitpodcast.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161e] border border-[#2a2a3b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Audio Engineer"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161e] border border-[#2a2a3b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Assign Primary Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['team_member', 'team_leader', 'org_admin'] as AppRole[]).map((r) => {
                    const rDef = ROLE_DEFINITIONS[r];
                    const isSelected = inviteRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setInviteRole(r)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm'
                            : 'bg-[#15151e] border-[#262635] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <p className="text-xs font-bold leading-none">{rDef.badgeLabel}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 capitalize leading-tight">
                          {r.replace('_', ' ')}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  {ROLE_DEFINITIONS[inviteRole].description}
                </p>
              </div>

              {inviteError && (
                <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs">
                  {inviteError}
                </div>
              )}

              {inviteSuccess && (
                <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{inviteSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER ROLE */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-[#2c2c3d] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21212e]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">Modify Member Role & Title</h3>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleEdit} className="space-y-4">
              <div className="p-3 rounded-lg bg-[#161620] border border-[#242432]">
                <p className="text-xs font-semibold text-white">{editingMember.name}</p>
                <p className="text-[11px] text-zinc-400">{editingMember.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Title / Designation</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161e] border border-[#2a2a3b] text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Select Role</label>
                <div className="space-y-2">
                  {(['org_admin', 'team_leader', 'team_member'] as AppRole[]).map((r) => {
                    const rDef = ROLE_DEFINITIONS[r];
                    const isSelected = editRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditRole(r)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm'
                            : 'bg-[#15151e] border-[#262635] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{rDef.label}</p>
                          <p className="text-[10px] text-zinc-400">{rDef.description}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editError && (
                <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs">
                  {editError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-5xl mx-auto text-xs text-zinc-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading organization access and settings...</span>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
