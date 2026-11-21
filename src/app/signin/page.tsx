'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { AppRole, TeamMember } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
import { DEMO_MEMBERS } from '@/lib/demo-data';

export default function SignInPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>('org_admin');
  const [email, setEmail] = useState('yug@svitpodcast.org');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const rolePresets: Record<AppRole, { member: TeamMember; hint: string }> = {
    org_admin: {
      member: DEMO_MEMBERS[0], // Yug
      hint: 'Full admin privileges, member invites, decision conflict ratifications & settings.',
    },
    team_leader: {
      member: DEMO_MEMBERS[1], // Rahul
      hint: 'Upload & process meetings, review AI intelligence, assign tasks & monitor milestones.',
    },
    team_member: {
      member: DEMO_MEMBERS[3], // Priya
      hint: 'View permitted meetings, update assigned task status & query organizational memory.',
    },
  };

  const handleSelectRole = (role: AppRole) => {
    setSelectedRole(role);
    setEmail(rolePresets[role].member.email);
    setPassword('••••••••••••');
    setError('');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const members = CommitOSStore.getMembers();
        let targetMember = members.find(
          (m) => m.email.toLowerCase() === email.toLowerCase() && m.role === selectedRole
        );

        if (!targetMember) {
          // If custom email or role preset
          targetMember = {
            id: `usr-${Date.now()}`,
            userId: `uid-${Date.now()}`,
            organizationId: CommitOSStore.getActiveOrgId(),
            name: email.split('@')[0],
            email: email.toLowerCase(),
            role: selectedRole,
            title: ROLE_DEFINITIONS[selectedRole].label,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
            status: 'active',
          };
        }

        CommitOSStore.login(targetMember);
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Authentication failed.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (role: AppRole) => {
    const preset = rolePresets[role];
    CommitOSStore.login(preset.member);
    router.push('/');
  };

  const activeDef = ROLE_DEFINITIONS[selectedRole];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-xl space-y-8 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#14141d] border border-[#232333] text-xs text-zinc-300 font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Role-Based Access Control • Active</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center text-black font-black text-lg shadow-md">
              C
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">CommitOS</h1>
          </div>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Your Meetings. Now, Executed. Authenticate with your assigned organizational role to enter.
          </p>
        </div>

        {/* Main Sign-In Card */}
        <div className="rounded-2xl bg-[#121217] border border-[#23232f] shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Step 1: Role Selection Tabs */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Select Access Role Portal</span>
              <span className="text-[11px] text-zinc-500 font-mono">Step 1 of 2</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {(['org_admin', 'team_leader', 'team_member'] as AppRole[]).map((r) => {
                const def = ROLE_DEFINITIONS[r];
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
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
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-xs font-bold text-white mt-2 leading-tight">
                        {def.label.replace('Organization ', '')}
                      </p>
                    </div>

                    <span className="text-[10px] text-zinc-500 font-mono mt-2">
                      {r === 'org_admin' ? 'Full Access' : r === 'team_leader' ? 'Lead & Manage' : 'Tasks & RAG'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Role Scope Callout */}
            <div className="p-3 rounded-xl bg-[#15151e] border border-[#222230] text-xs text-zinc-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-white text-[11px]">{activeDef.label} Permissions:</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{rolePresets[selectedRole].hint}</p>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Role Login */}
          <div className="p-3 rounded-xl bg-[#181822] border border-[#2a2a3b] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rolePresets[selectedRole].member.avatar}
                  alt={rolePresets[selectedRole].member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  Sign in as {rolePresets[selectedRole].member.name}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{rolePresets[selectedRole].member.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin(selectedRole)}
              className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-xs font-semibold text-white transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Instant Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#232332] w-full" />
            <span className="bg-[#121217] px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-mono">
              Or sign in with email
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@organization.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161f] border border-[#262635] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Sign In as {activeDef.label}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Switch to Sign Up */}
          <div className="pt-2 text-center border-t border-[#20202d]">
            <p className="text-xs text-zinc-400">
              Need a new organizational account?{' '}
              <Link href="/signup" className="text-white font-semibold hover:underline">
                Sign Up with Role Selection →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
