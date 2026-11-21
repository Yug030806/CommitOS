'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Search,
  Filter,
  Clock,
  Users,
  CheckSquare,
  BrainCircuit,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Meeting, TeamMember } from '@/lib/types';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(() => CommitOSStore.getMeetings());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processed' | 'needs_review'>('all');
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());

  const loadMeetings = () => {
    setMeetings(CommitOSStore.getMeetings());
    setCurrentUser(CommitOSStore.getCurrentUser());
  };

  useEffect(() => {
    loadMeetings();
    window.addEventListener('commitos_storage_updated', loadMeetings);
    return () => window.removeEventListener('commitos_storage_updated', loadMeetings);
  }, []);

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.summary.toLowerCase().includes(search.toLowerCase()) ||
      m.participants.some((p) => p.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Meetings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Transcribed recordings, structured decisions, and cross-meeting intelligence
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, participant, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white bg-[#14141a] border border-[#23232e]'
            }`}
          >
            All ({meetings.length})
          </button>
          <button
            onClick={() => setStatusFilter('processed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'processed'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white bg-[#14141a] border border-[#23232e]'
            }`}
          >
            Processed ({meetings.filter((m) => m.status === 'processed').length})
          </button>
          <button
            onClick={() => setStatusFilter('needs_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'needs_review'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white bg-[#14141a] border border-[#23232e]'
            }`}
          >
            Needs Review ({meetings.filter((m) => m.status === 'needs_review').length})
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.map((m) => (
          <Link
            key={m.id}
            href={`/meetings/${m.id}`}
            className="p-5 rounded-xl bg-[#121217] hover:bg-[#16161e] border border-[#23232f] hover:border-zinc-700 transition-all block group relative flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    m.status === 'processed'
                      ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {m.status.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-zinc-100 flex items-center gap-1.5">
                  <span>{m.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{m.summary}</p>
              </div>

              {m.conflictDetected && (
                <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Decision Conflict Detected</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#1f1f28] flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {m.duration}
              </span>
              <span className="flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-zinc-500" />
                {m.decisions.length} Decisions
              </span>
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-zinc-500" />
                {m.actionItems.length} Tasks
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <div className="text-center py-16 bg-[#121217] rounded-xl border border-[#23232f] space-y-3">
          <Video className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-medium text-white">No meetings found</h3>
          <p className="text-xs text-zinc-500">Try adjusting your search or upload a new recording.</p>
        </div>
      )}
    </div>
  );
}
