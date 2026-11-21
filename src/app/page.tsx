'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  CheckSquare,
  ArrowUpRight,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  Plus,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Meeting, Task, DecisionConflict, TeamMember } from '@/lib/types';
import { RBAC } from '@/lib/rbac';
import AskCommitOSWidget from '@/components/dashboard/AskCommitOSWidget';
import UploadMeetingModal from '@/components/meetings/UploadMeetingModal';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conflicts, setConflicts] = useState<DecisionConflict[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());

  const loadData = () => {
    setMeetings(CommitOSStore.getMeetings());
    setTasks(CommitOSStore.getTasks());
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

  const pendingConflicts = conflicts.filter((c) => c.status === 'pending');

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full min-w-0">
      {/* Clean Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            SVIT Podcast Club Workspace • AI Memory &amp; Execution
          </p>
        </div>

        <div>
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

      {/* Decision Conflict Alert (Shown only if unresolved conflict exists) */}
      {pendingConflicts.length > 0 && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <p className="text-zinc-200">
              <strong className="text-white">Decision Conflict:</strong> Meeting 3 proposed changing the event date to December 20, contradicting the approved December 15 schedule.
            </p>
          </div>
          <Link
            href={`/meetings/${pendingConflicts[0].newMeetingId}`}
            className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors shrink-0 text-center"
          >
            Review &amp; Triage →
          </Link>
        </div>
      )}

      {/* SECTION 1: THE HIGHLIGHTED AI CHATBOT (Hero of the Dashboard) */}
      <section>
        <AskCommitOSWidget highlighted={true} />
      </section>

      {/* SECTION 2: WORKSPACE ESSENTIALS (2 Clean Side-by-Side Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Card A: Recent Meetings */}
        <div className="p-5 rounded-2xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white">Recent Meetings</h3>
            </div>
            <Link
              href="/meetings"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
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
                className="p-3 rounded-xl bg-[#171720] hover:bg-[#1d1d28] border border-zinc-800 flex items-center justify-between transition-colors block group"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white group-hover:text-zinc-200 truncate">
                      {m.title}
                    </span>
                    {m.conflictDetected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
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
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Card B: Action Items Checklist */}
        <div className="p-5 rounded-2xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white">Action Items</h3>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Tasks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {tasks.slice(0, 4).map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isDone
                      ? 'bg-[#101015] border-[#1d1d26] opacity-60'
                      : 'bg-[#171720] border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
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
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      task.priority === 'urgent'
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upload Meeting Modal */}
      <UploadMeetingModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
