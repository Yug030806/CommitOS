'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { AppRole, TeamMember } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
import { DEMO_MEMBERS } from '@/lib/demo-data';
import AuthBackground from '@/components/auth/AuthBackground';

export default function SignInPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>('org_admin');
  const [email, setEmail] = useState('yug@svitpodcast.org');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const rolePresets: Record<AppRole, { member: TeamMember; label: string }> = {
    org_admin: {
      member: DEMO_MEMBERS[0], // Yug
      label: 'Admin',
    },
    team_leader: {
      member: DEMO_MEMBERS[1], // Rahul
      label: 'Team Leader',
    },
    team_member: {
      member: DEMO_MEMBERS[3], // Priya
      label: 'Team Member',
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
          targetMember = {
            id: `usr-${Date.now()}`,
            userId: `uid-${Date.now()}`,
            organizationId: CommitOSStore.getActiveOrgId(),
            name: email.split('@')[0],
            email: email.toLowerCase(),
            role: selectedRole,
            title: ROLE_DEFINITIONS[selectedRole].label,
            status: 'active',
          };
        }

        CommitOSStore.login(targetMember);
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Authentication failed.');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-white selection:text-black">
      {/* 3D Organic Logo Background */}
      <AuthBackground />

      {/* Main Glassmorphic Card Container with Reduced Opacity */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl bg-black/25 backdrop-blur-md border border-white/10 p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
          {/* Brand Logo Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <img
                src="/logo-white.png"
                alt="CommitOS"
                className="h-8 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Access your meetings, decisions &amp; tasks
            </p>
          </div>

          {/* Role Portal Segmented Control (Translucent Glass Tabs - Low Opacity) */}
          <div className="space-y-1.5 mb-5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Role Portal
            </label>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
              {(['org_admin', 'team_leader', 'team_member'] as AppRole[]).map((r) => {
                const isSelected = selectedRole === r;
                const label = rolePresets[r].label;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`py-2 text-xs rounded-lg transition-all text-center ${
                      isSelected
                        ? 'bg-white/[0.08] text-white font-bold backdrop-blur-sm border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent font-medium'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 backdrop-blur-xs transition-all font-normal"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 backdrop-blur-xs transition-all font-normal font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-black/30 border border-white/15 text-xs text-zinc-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] mt-6 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
