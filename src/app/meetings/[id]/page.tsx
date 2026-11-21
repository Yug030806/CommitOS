'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Users,
  CheckSquare,
  BrainCircuit,
  ShieldAlert,
  Sparkles,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Meeting, DecisionConflict } from '@/lib/types';
import ConflictAlertCard from '@/components/meetings/ConflictAlertCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [meeting, setMeeting] = useState<Meeting | null>(
    () => CommitOSStore.getMeetingById(resolvedParams.id) || null
  );
  const [conflicts, setConflicts] = useState<DecisionConflict[]>(() =>
    CommitOSStore.getConflicts().filter((c) => c.newMeetingId === resolvedParams.id)
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'decisions' | 'tasks' | 'insights'>('overview');
  const [transcriptSearch, setTranscriptSearch] = useState('');

  const loadData = () => {
    const found = CommitOSStore.getMeetingById(resolvedParams.id);
    if (found) {
      setMeeting({ ...found });
      const meetingConflicts = CommitOSStore.getConflicts().filter(
        (c) => c.newMeetingId === resolvedParams.id
      );
      setConflicts(meetingConflicts);
      if (meetingConflicts.length > 0 && found.conflictDetected) {
        // default to insights / conflict tab if unresolved conflict exists
        setActiveTab('insights');
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('commitos_storage_updated', loadData);
    return () => window.removeEventListener('commitos_storage_updated', loadData);
  }, [resolvedParams.id]);

  if (!meeting) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p>Loading meeting records...</p>
      </div>
    );
  }

  const filteredTranscript = meeting.transcript.filter(
    (item) =>
      item.speaker.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      item.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full min-w-0">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Meetings</span>
        </Link>

        <div className="flex items-center gap-2">
          {conflicts.some((c) => c.status === 'pending') && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Conflict Pending Triage</span>
            </span>
          )}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
              meeting.status === 'processed'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            {meeting.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Meeting Title & Meta Banner */}
      <div className="p-6 rounded-2xl bg-[#121217] border border-[#23232f] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">{meeting.title}</h1>
          <span className="text-xs text-zinc-400 font-mono">
            {new Date(meeting.date).toLocaleDateString([], {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-[#1f1f28]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            Duration: <strong className="text-zinc-200">{meeting.duration}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            {meeting.participants.length} Active Participants
          </span>
          <span className="flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-zinc-500" />
            {meeting.decisions.length} Decisions Logged
          </span>
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
            {meeting.actionItems.length} Action Items
          </span>
        </div>
      </div>

      {/* 5 Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#1f1f27] pb-1 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: FileText },
          { key: 'transcript', label: `Transcript (${meeting.transcript.length})`, icon: Play },
          { key: 'decisions', label: `Decisions (${meeting.decisions.length})`, icon: BrainCircuit },
          { key: 'tasks', label: `Action Items (${meeting.actionItems.length})`, icon: CheckSquare },
          {
            key: 'insights',
            label:
              conflicts.filter((c) => c.status === 'pending').length > 0
                ? `AI Insights (${conflicts.filter((c) => c.status === 'pending').length} Conflict)`
                : 'AI Insights',
            icon: Sparkles,
            highlight: conflicts.some((c) => c.status === 'pending'),
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-[#15151c]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>AI Executive Summary</span>
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed">{meeting.summary}</p>
          </div>

          {/* Key Discussion Points & Unresolved Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Key Discussion Points
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300">
                {meeting.keyDiscussionPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Unresolved Questions</span>
              </h3>
              {meeting.unresolvedQuestions.length > 0 ? (
                <ul className="space-y-2 text-xs text-zinc-300">
                  {meeting.unresolvedQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-500">All identified discussion topics were resolved.</p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Identified Participants
            </h3>
            <div className="flex flex-wrap gap-2">
              {meeting.participants.map((p, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-[#181822] border border-[#282836] text-xs font-medium text-zinc-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSCRIPT */}
      {activeTab === 'transcript' && (
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search transcript lines..."
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              className="w-full max-w-sm px-3 py-1.5 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            <span className="text-xs text-zinc-500 font-mono">
              {filteredTranscript.length} lines indexed
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {filteredTranscript.map((line) => (
              <div
                key={line.id}
                className="p-3 rounded-lg bg-[#15151c] border border-[#23232e] text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="font-bold text-zinc-200">{line.speaker}</span>
                  <span className="font-mono">{line.timestamp}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{line.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="space-y-3">
          {meeting.decisions.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                  {d.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    AI Confidence: {Math.round(d.confidence * 100)}%
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize font-mono ${
                      d.status === 'approved'
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white">{d.title}</h3>
              <p className="text-xs text-zinc-200 font-medium bg-[#16161d] p-3 rounded-lg border border-[#262633]">
                {d.value}
              </p>
              {d.rationale && (
                <p className="text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-300">Context:</span> {d.rationale}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ACTION ITEMS */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {meeting.actionItems.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-[#121217] border border-[#23232f] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate">{task.title}</h4>
                <p className="text-[11px] text-zinc-400">{task.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                  <span>
                    Owner: <strong className="text-zinc-200">{task.assigneeName}</strong>
                  </span>
                  <span>Due: {task.deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    task.priority === 'urgent'
                      ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                      : task.priority === 'high'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => {
                    const next = task.status === 'completed' ? 'todo' : 'completed';
                    CommitOSStore.updateTask(task.id, { status: next });
                    loadData();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    task.status === 'completed'
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-white hover:bg-zinc-200 text-black font-semibold'
                  }`}
                >
                  {task.status === 'completed' ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: AI INSIGHTS & CONFLICT ANALYSIS */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {conflicts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-zinc-300" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cross-Meeting Contradiction Analysis
                </h3>
              </div>
              {conflicts.map((c) => (
                <ConflictAlertCard key={c.id} conflict={c} onResolved={() => loadData()} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#121217] border border-[#23232f] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
              <h3 className="text-sm font-semibold text-white">No Decision Conflicts Detected</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                All decisions ratified in this meeting align consistently with historical organizational memory.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
