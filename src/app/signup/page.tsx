'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Users,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { AppRole, TeamMember } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/rbac';

export default function SignUpPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>('team_member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [orgName, setOrgName] = useState('SVIT Podcast Club');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allOrgs = CommitOSStore.getAllOrganizations();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required credentials.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const activeOrg = CommitOSStore.getOrganization();
        const newMember: TeamMember = {
          id: `usr-${Date.now()}`,
          userId: `uid-${Date.now()}`,
          organizationId: activeOrg.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: selectedRole,
          title: title.trim() || ROLE_DEFINITIONS[selectedRole].label,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        // Add to active organization roster
        const orgs = CommitOSStore.getAllOrganizations();
        const currentOrgIdx = orgs.findIndex((o) => o.id === activeOrg.id);
        if (currentOrgIdx !== -1) {
          orgs[currentOrgIdx].members.push(newMember);
          localStorage.setItem('commitos_organizations', JSON.stringify(orgs));
        }

        // Log audit event
        CommitOSStore.addAuditLog({
          organizationId: activeOrg.id,
          actorId: newMember.id,
          actorName: newMember.name,
          actorRole: newMember.role,
          action: 'MEMBER_REGISTERED',
          entityType: 'member',
          entityId: newMember.id,
          metadata: { role: newMember.role, email: newMember.email, title: newMember.title },
        });

        // Authenticate into CommitOS
        CommitOSStore.login(newMember);
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
        setIsLoading(false);
      }
    }, 400);
  };

  const activeDef = ROLE_DEFINITIONS[selectedRole];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-xl space-y-8 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center text-black font-black text-lg shadow-md">
              C
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">CommitOS</h1>
          </div>
          <h2 className="text-sm font-semibold text-zinc-300">Create Your Role-Based Member Account</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Choose your organization role to register permissions and join the workspace.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-[#121217] border border-[#23232f] shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Step 1: Choose Primary Role */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Step 1: Choose Your Primary Role</span>
              <span className="text-[11px] text-zinc-500 font-mono">Permissions Enforced</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {(['org_admin', 'team_leader', 'team_member'] as AppRole[]).map((r) => {
                const def = ROLE_DEFINITIONS[r];
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[95px] ${
                      isSelected
                        ? 'bg-zinc-800/90 border-zinc-400 text-white shadow-lg ring-1 ring-zinc-400/40'
                        : 'bg-[#15151e] border-[#252535] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a24]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${def.badgeClass}`}>
                          {def.badgeLabel}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <p className="text-xs font-bold text-white mt-2 leading-tight">
                        {def.label.replace('Organization ', '')}
                      </p>
                    </div>

                    <span className="text-[10px] text-zinc-500 font-mono mt-1">
                      {r === 'org_admin' ? 'Executive' : r === 'team_leader' ? 'Leadership' : 'Contributor'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#15151e] border border-[#222230] text-xs text-zinc-400">
              <strong className="text-white">{activeDef.label}:</strong> {activeDef.description}
            </div>
          </div>

          {/* Step 2: Account Details */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Designation Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Producer, Logistics Head"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ananya@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Select Organization</label>
              <select
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white focus:outline-none focus:border-zinc-400 transition-colors"
              >
                {allOrgs.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name} ({o.members.length} members)
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <span>Register & Enter as {activeDef.label}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="pt-2 text-center border-t border-[#20202d]">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <Link href="/signin" className="text-white font-semibold hover:underline">
                Sign In to Existing Portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
