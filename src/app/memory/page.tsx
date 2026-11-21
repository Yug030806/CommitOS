'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  Search,
  Filter,
  History,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { OrganizationalMemory, Decision, DecisionHistoryItem } from '@/lib/types';

export default function MemoryPage() {
  const [memories, setMemories] = useState<OrganizationalMemory[]>(() => CommitOSStore.getMemories());
  const [decisions, setDecisions] = useState<Decision[]>(() => CommitOSStore.getDecisions());
  const [history, setHistory] = useState<DecisionHistoryItem[]>(() => CommitOSStore.getDecisionHistory());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadData = () => {
    setMemories(CommitOSStore.getMemories());
    setDecisions(CommitOSStore.getDecisions());
    setHistory(CommitOSStore.getDecisionHistory());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, []);

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.meetingTitle.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || m.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Logistics', 'Budget', 'Roles & Responsibilities', 'Production'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[11px] text-zinc-300 font-mono mb-2 border border-zinc-700">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
            <span>Persistent Organizational Memory</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Memory & Decision Vault</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Long-term organizational context, vectorized commitments, and immutable audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono bg-[#14141a] px-3 py-1.5 rounded-lg border border-[#23232e]">
            {decisions.length} Decisions Logged • {memories.length} Memories Indexed
          </span>
        </div>
      </div>

      {/* Semantic Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizational memory by topic, keywords, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white bg-[#14141a] border border-[#23232e]'
              }`}
            >
              {cat === 'all' ? 'All Records' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left Column Timeline & Right Column Decision History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory Timeline (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Chronological Memory Records</h2>
            <span className="text-xs text-zinc-500 font-mono">{filteredMemories.length} Records</span>
          </div>

          <div className="space-y-3">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-xl bg-[#121217] border border-[#23232f] hover:border-zinc-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {mem.category}
                    </span>
                    <Link
                      href={`/meetings/${mem.meetingId}`}
                      className="text-xs font-semibold text-white hover:text-zinc-300 flex items-center gap-1"
                    >
                      <span>{mem.meetingTitle}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                    </Link>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{mem.date}</span>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">{mem.content}</p>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1e1e28]">
                  {mem.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-zinc-400 bg-[#16161f] px-2 py-0.5 rounded border border-[#262635]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {filteredMemories.length === 0 && (
              <div className="text-center py-12 bg-[#121217] rounded-xl border border-[#23232f] text-zinc-500 text-xs">
                No matching memory records found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Decision History & Audit Trail */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-white" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Decision History & Audit Trail
                </h3>
                <p className="text-[11px] text-zinc-400">Log of ratified revisions and date amendments</p>
              </div>
            </div>

            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((hist) => (
                  <div
                    key={hist.id}
                    className="p-3.5 rounded-lg bg-[#16161d] border border-[#262633] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="text-zinc-300 font-semibold">{hist.changedBy}</span>
                      <span>{new Date(hist.timestamp).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-zinc-500">{hist.previousValue}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                      <span className="text-white font-semibold">{hist.newValue}</span>
                    </div>

                    <p className="text-[11px] text-zinc-400">{hist.reason}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Origin: {hist.sourceMeetingTitle}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500">
                  No decision revisions have been ratified yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Memory Persistence Integrity
            </h4>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between py-1 border-b border-[#1f1f28]">
                <span className="text-zinc-400">Isolated Organization</span>
                <span className="text-white font-medium">SVIT Podcast Club</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f1f28]">
                <span className="text-zinc-400">Contradiction Sentinel</span>
                <span className="text-zinc-200 font-medium">Active (Gemini + pgvector)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Memory Retention</span>
                <span className="text-white font-medium">Permanent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
