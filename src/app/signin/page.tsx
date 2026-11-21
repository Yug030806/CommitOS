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

  const rolePresets: Record<AppRole, { member: TeamMember; label: string; mobileLabel?: string }> = {
    org_admin: {
      member: DEMO_MEMBERS[0], // Yug
      label: 'Admin',
      mobileLabel: 'Admin',
    },
    team_leader: {
      member: DEMO_MEMBERS[1], // Rahul
      label: 'Team Leader',
      mobileLabel: 'Leader',
    },
    team_member: {
      member: DEMO_MEMBERS[3], // Priya
      label: 'Team Member',
      mobileLabel: 'Member',
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
      {/* High-Visibility Logo Emblem in Background */}
      <AuthBackground />

      {/* Main Translucent Card (Background Emblem Visible Through It with Darkened Backdrop for Legibility) */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl bg-black/65 backdrop-blur-md border border-white/20 p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
          {/* Brand Logo Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <img
                src="/logo-white.png"
                alt="CommitOS"
                className="h-8 w-auto object-contain drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)]"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Access your meetings, decisions &amp; tasks
            </p>
          </div>

          {/* Role Portal Segmented Control (Dark High-Contrast Tabs with Dark Selected Word) */}
          <div className="space-y-1.5 mb-5">
            <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Role Portal
            </label>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-black/80 border border-white/20 shadow-inner">
              {(['org_admin', 'team_leader', 'team_member'] as AppRole[]).map((r) => {
                const isSelected = selectedRole === r;
                const preset = rolePresets[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`py-2 px-1 text-xs rounded-lg transition-all text-center ${
                      isSelected
                        ? 'bg-white text-zinc-950 font-extrabold shadow-md'
                        : 'text-zinc-300 hover:text-white hover:bg-white/10 font-bold'
                    }`}
                  >
                    <span className="hidden sm:inline">{preset.label}</span>
                    <span className="sm:hidden">{preset.mobileLabel || preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider mb-1.5 block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-white/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider mb-1.5 block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-white/50 transition-all font-medium font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-black/80 border border-white/20 text-xs text-zinc-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-300" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.99] mt-6 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-zinc-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
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
