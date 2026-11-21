'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { AppRole, TeamMember } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
import AuthBackground from '@/components/auth/AuthBackground';

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

        const orgs = CommitOSStore.getAllOrganizations();
        const currentOrgIdx = orgs.findIndex((o) => o.id === activeOrg.id);
        if (currentOrgIdx !== -1) {
          orgs[currentOrgIdx].members.push(newMember);
          localStorage.setItem('commitos_organizations', JSON.stringify(orgs));
        }

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

        CommitOSStore.login(newMember);
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-white selection:text-black">
      {/* High-Visibility Logo Emblem in Background */}
      <AuthBackground />

      {/* Main Translucent Card (Background Emblem Visible Through It with Darkened Backdrop for Legibility) */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300 my-8">
        <div className="rounded-3xl bg-black/65 backdrop-blur-md border border-white/20 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
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
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Join your organizational workspace
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
                const label = r === 'org_admin' ? 'Admin' : r === 'team_leader' ? 'Leader' : 'Member';
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-2 text-xs rounded-lg transition-all text-center ${
                      isSelected
                        ? 'bg-white text-zinc-950 font-extrabold shadow-md'
                        : 'text-zinc-300 hover:text-white hover:bg-white/10 font-bold'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider mb-1.5 block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Username
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-white/50 transition-all font-medium"
              />
            </div>

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

            <div>
              <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider mb-1.5 block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Organization
              </label>
              <select
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 transition-all font-medium"
              >
                {allOrgs.map((o) => (
                  <option key={o.id} value={o.name} className="bg-zinc-900 text-white">
                    {o.name}
                  </option>
                ))}
              </select>
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
              <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-zinc-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Already have an account?{' '}
              <Link href="/signin" className="text-white font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
