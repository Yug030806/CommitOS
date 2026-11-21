'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  CheckSquare,
  AlertTriangle,
  BrainCircuit,
  ArrowUpRight,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Meeting, Task, Decision, ExecutionRisk, DecisionConflict, TeamMember } from '@/lib/types';
import { RBAC } from '@/lib/rbac';
import AskCommitOSWidget from '@/components/dashboard/AskCommitOSWidget';
import UploadMeetingModal from '@/components/meetings/UploadMeetingModal';
import { Lock } from 'lucide-react';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [conflicts, setConflicts] = useState<DecisionConflict[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());
  const [members, setMembers] = useState<TeamMember[]>(() => CommitOSStore.getMembers());

  const loadData = () => {
    setMeetings(CommitOSStore.getMeetings());
    setTasks(CommitOSStore.getTasks());
    setDecisions(CommitOSStore.getDecisions());
    setRisks(CommitOSStore.getRisks());
    setConflicts(CommitOSStore.getConflicts());
    setCurrentUser(CommitOSStore.getCurrentUser());
    setMembers(CommitOSStore.getMembers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, []);

  const canUpload = RBAC.canUploadMeetings(currentUser.role);

  const toggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    CommitOSStore.updateTask(task.id, { status: nextStatus });
  };

  // Calculations
  const totalMeetings = meetings.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const tasksOnTrack = tasks.filter((t) => t.status !== 'completed' && new Date(t.deadline).getTime() >= Date.now()).length;
  const highRisk = risks.find((r) => r.level === 'HIGH');
  const pendingConflicts = conflicts.filter((c) => c.status === 'pending');

  // Team member completion stats
  const memberStats = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assigneeName.includes(m.name));
    const done = memberTasks.filter((t) => t.status === 'completed').length;
    return { name: m.name, total: memberTasks.length, done };
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-300 mb-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Agentic AI Organizational OS
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Your Meetings. Now, Executed.
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            An AI agent that remembers, decides and gets things done across college clubs, startup teams, and committees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canUpload ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Meeting</span>
            </button>
          ) : (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-xs transition-all shadow-sm"
              title="Upload requires Organization Admin or Team Leader privileges. Team Members have view-only access."
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Upload Meeting</span>
            </button>
          )}
        </div>
      </div>

      {/* Signature Conflict Alert Banner if any conflict is pending */}
      {pendingConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-[#14141a] border border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Decision Contradiction Detected
                </span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-mono border border-zinc-700">
                  Needs Triage
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Meeting 3 proposed shifting the flagship event to <strong className="text-white">December 20</strong>, contradicting the approved <strong className="text-white">December 15</strong> date from Meeting 1.
              </p>
            </div>
          </div>
          <Link
            href={`/meetings/${pendingConflicts[0].newMeetingId}`}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs text-center transition-colors shrink-0 shadow-sm"
          >
            Review & Ratify Triage →
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Meetings */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Meetings</span>
            <Video className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalMeetings}</span>
            <span className="text-xs text-zinc-300 font-medium">All Transcribed</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">100% memory preserved</p>
        </div>

        {/* Tasks Created */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Tasks Created</span>
            <CheckSquare className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalTasks}</span>
            <span className="text-xs text-zinc-400 font-medium">{completedTasks} completed</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Extracted by AI Execution Agent</p>
        </div>

        {/* Tasks On Track */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Tasks On Track</span>
            <TrendingUp className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{tasksOnTrack}</span>
            <span className="text-xs text-zinc-400">of {totalTasks - completedTasks} active</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Monitored against deadlines</p>
        </div>

        {/* Execution Risks */}
        <div className="p-5 rounded-xl bg-[#121217] border border-zinc-700 hover:border-zinc-500 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Execution Risks</span>
            <AlertTriangle className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {highRisk ? 'HIGH' : 'LOW'}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Milestone Alert</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 truncate">
            {highRisk ? 'Dec 15 Event at Risk' : 'Operational stability normal'}
          </p>
        </div>
      </div>

      {/* Grid: Main Sections A, B, C, D, E, F */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION B: AI Insights Card */}
          <div className="p-5 rounded-xl bg-[#14141c] border border-[#292938] space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-white text-black">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Risk & Execution Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                Predictor Agent Active
              </span>
            </div>

            {highRisk ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-white uppercase mt-0.5">Execution Risk: HIGH</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">{highRisk.reason}</p>
                <div className="p-3 rounded-lg bg-[#0e0e13] border border-[#232330] text-xs space-y-1">
                  <p className="text-zinc-400 font-medium">Recommended Autonomous Next Action:</p>
                  <p className="text-white font-medium">{highRisk.recommendedAction}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                All organizational commitments and task velocity are operating within safe tolerances.
              </p>
            )}
          </div>

          {/* SECTION A: Recent Meetings */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Meetings</h3>
                <p className="text-xs text-zinc-400">Historical meeting transcripts & extracted decisions</p>
              </div>
              <Link
                href="/meetings"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
              >
                <span>View All ({meetings.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {meetings.slice(0, 3).map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="p-3.5 rounded-lg bg-[#16161d] hover:bg-[#1c1c25] border border-[#262633] flex items-center justify-between transition-colors block group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white group-hover:text-zinc-200 truncate">
                        {m.title}
                      </span>
                      {m.conflictDetected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                          Conflict
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          m.status === 'processed'
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(m.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {m.participants.length} speakers
                      </span>
                      <span>{m.decisions.length} decisions</span>
                      <span>{m.actionItems.length} tasks</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* SECTION C: Upcoming Tasks */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Upcoming Tasks</h3>
                <p className="text-xs text-zinc-400">Action items assigned from meetings</p>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
              >
                <span>Kanban Board</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                      isDone
                        ? 'bg-[#101015] border-[#1d1d26] opacity-60'
                        : 'bg-[#16161d] border-[#262633]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="text-zinc-500 hover:text-white transition-colors shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${
                            isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Assigned to <span className="text-zinc-200 font-semibold">{task.assigneeName}</span> • Due{' '}
                          {task.deadline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                          task.priority === 'urgent'
                            ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                            : task.priority === 'high'
                            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sections D, E, F, G */}
        <div className="space-y-6">
          {/* SECTION G: Ask CommitOS (RAG Assistant) */}
          <AskCommitOSWidget />

          {/* SECTION D: Key Decisions */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Decisions</h3>
                <p className="text-[11px] text-zinc-400">Approved organizational commitments</p>
              </div>
              <Link href="/memory" className="text-xs text-zinc-400 hover:text-white">
                All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {decisions.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg bg-[#16161d] border border-[#242430] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{d.category}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        d.status === 'approved'
                          ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">{d.title}</p>
                  <p className="text-xs text-zinc-300 font-medium">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION E: Team Progress */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Team Execution Progress</h3>
                <p className="text-[11px] text-zinc-400">SVIT Podcast Club active members</p>
              </div>
            </div>

            <div className="space-y-3">
              {memberStats.map((m) => {
                const percent = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
                return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 font-medium">{m.name}</span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {m.done}/{m.total} tasks ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1e1e27] overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION F: Decision Memory Counter */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#14141c] to-[#0f0f15] border border-[#262635] space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <BrainCircuit className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Organizational Memory
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{decisions.length}</span>
              <span className="text-xs text-zinc-400">Decisions Indexed</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Preserved in vector memory across 3 meetings with 0% decision drift.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Meeting Modal */}
      <UploadMeetingModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
