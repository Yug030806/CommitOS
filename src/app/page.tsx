'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  CheckSquare,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  Plus,
  ShieldAlert,
  BrainCircuit,
  Lock,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Meeting, Task, Decision, ExecutionRisk, DecisionConflict, TeamMember } from '@/lib/types';
import { RBAC } from '@/lib/rbac';
import AskCommitOSWidget from '@/components/dashboard/AskCommitOSWidget';
import UploadMeetingModal from '@/components/meetings/UploadMeetingModal';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [conflicts, setConflicts] = useState<DecisionConflict[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());

  const loadData = () => {
    setMeetings(CommitOSStore.getMeetings());
    setTasks(CommitOSStore.getTasks());
    setDecisions(CommitOSStore.getDecisions());
    setRisks(CommitOSStore.getRisks());
    setConflicts(CommitOSStore.getConflicts());
    setCurrentUser(CommitOSStore.getCurrentUser());
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

  const totalMeetings = meetings.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const highRisk = risks.find((r) => r.level === 'HIGH');
  const pendingConflicts = conflicts.filter((c) => c.status === 'pending');

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            SVIT Podcast Club • Here is what's happening across your meetings and tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canUpload ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Meeting</span>
            </button>
          ) : (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-xs transition-all shadow-sm"
              title="Upload requires Organization Admin or Team Leader privileges."
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Upload Meeting</span>
            </button>
          )}
        </div>
      </div>

      {/* Signature Conflict Alert Banner if any */}
      {pendingConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-[#14141a] border border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Decision Conflict: December 15 vs December 20
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Meeting 3 proposed shifting the event date, conflicting with the ratified December 15 schedule.
              </p>
            </div>
          </div>
          <Link
            href={`/meetings/${pendingConflicts[0].newMeetingId}`}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs text-center transition-colors shrink-0 shadow-sm"
          >
            Review & Triage →
          </Link>
        </div>
      )}

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121217] border border-[#23232f]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Meetings</span>
            <Video className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalMeetings}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Recorded & analyzed</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121217] border border-[#23232f]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Tasks</span>
            <CheckSquare className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {totalTasks - completedTasks}
            <span className="text-xs font-normal text-zinc-400 ml-1.5">open</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">{completedTasks} completed</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121217] border border-[#23232f]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Decisions</span>
            <BrainCircuit className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{decisions.length}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Ratified & preserved</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121217] border border-[#23232f]">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Execution Status</span>
            <AlertTriangle className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {highRisk ? 'High Risk' : 'Normal'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            {highRisk ? 'Dec 15 Event milestone' : 'All deliverables on track'}
          </p>
        </div>
      </div>

      {/* Main Content Layout: Left Stream + Right Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Recent Meetings & Action Items (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Action Items Checklist */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Action Items</h3>
                <p className="text-xs text-zinc-400">Tasks assigned across meetings</p>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
              >
                <span>Kanban</span>
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
                          {task.assigneeName} • Due {task.deadline}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-semibold shrink-0 ${
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
                );
              })}
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Meetings</h3>
                <p className="text-xs text-zinc-400">Recordings and extracted decisions</p>
              </div>
              <Link
                href="/meetings"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
              >
                <span>View All ({meetings.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
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
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-500" />
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
        </div>

        {/* Right Column: CommitOS AI Assistant & Decisions Snapshot (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ask CommitOS Widget */}
          <AskCommitOSWidget />

          {/* Key Decisions Snapshot */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">Ratified Decisions</h3>
                <p className="text-[11px] text-zinc-400">Active commitments across meetings</p>
              </div>
              <Link href="/memory" className="text-xs text-zinc-400 hover:text-white">
                All ({decisions.length}) →
              </Link>
            </div>

            <div className="space-y-2">
              {decisions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg bg-[#16161d] border border-[#242430] space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{d.category}</span>
                    <span className="text-[10px] text-zinc-500">{d.meetingTitle}</span>
                  </div>
                  <p className="text-xs font-medium text-white">{d.title}</p>
                  <p className="text-xs text-zinc-300 font-semibold">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Meeting Modal */}
      <UploadMeetingModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
