'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BrainCircuit,
  ShieldAlert,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Task, Meeting, Decision, ExecutionRisk } from '@/lib/types';

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [risks, setRisks] = useState<ExecutionRisk[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTasks(CommitOSStore.getTasks());
    setMeetings(CommitOSStore.getMeetings());
    setDecisions(CommitOSStore.getDecisions());
    setRisks(CommitOSStore.getRisks());
  }, []);

  if (!mounted) return null;

  // Chart data calculations
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const statusPieData = [
    { name: 'Completed', value: completedTasks, color: '#f4f4f5' },
    { name: 'In Progress', value: inProgressTasks, color: '#71717a' },
    { name: 'To Do', value: todoTasks, color: '#3f3f46' },
    { name: 'In Review', value: reviewTasks, color: '#27272a' },
  ];

  const teamWorkloadData = ['Yug', 'Rahul', 'Yash', 'Priya'].map((name) => {
    const memberTasks = tasks.filter((t) => t.assigneeName.includes(name));
    const completed = memberTasks.filter((t) => t.status === 'completed').length;
    const pending = memberTasks.length - completed;
    return { name, Completed: completed, Pending: pending };
  });

  const meetingTimelineData = meetings.map((m, index) => ({
    meeting: `M${index + 1}: ${m.title.split(' ')[0]}`,
    decisions: m.decisions.length,
    tasks: m.actionItems.length,
  }));

  const riskFactors = [
    { factor: 'Date Alignment Ambiguity', level: 90 },
    { factor: 'Sponsorship Signing Lead-time', level: 85 },
    { factor: 'Marketing Poster Approval', level: 70 },
    { factor: 'Auditorium Booking Slot', level: 60 },
    { factor: 'Equipment Technical Readiness', level: 20 },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[11px] text-zinc-300 font-mono mb-2 border border-zinc-700">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
            <span>Execution Intelligence Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Risk Metrics</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Predictive tracking of commitment completion, member workloads, and deadline exposure
          </p>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f]">
          <span className="text-xs text-zinc-400 font-medium">Task Completion Velocity</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{completionRate}%</span>
            <span className="text-xs text-zinc-400">
              ({completedTasks}/{tasks.length})
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Target velocity: 80%</p>
        </div>

        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f]">
          <span className="text-xs text-zinc-400 font-medium">Active Decisions</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{decisions.length}</span>
            <span className="text-xs text-zinc-300">0 Overridden</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Across 3 historical sessions</p>
        </div>

        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f]">
          <span className="text-xs text-zinc-400 font-medium">Average Meeting Duration</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">35</span>
            <span className="text-xs text-zinc-400">Minutes</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">High conversion to action items</p>
        </div>

        <div className="p-5 rounded-xl bg-[#121217] border border-zinc-700">
          <span className="text-xs text-zinc-400 font-medium">Flagship Event Risk Score</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">HIGH</span>
            <span className="text-xs text-zinc-400 font-mono">Dec 15</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Poster & sponsor blockers active</p>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Team Member Workload */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Team Member Task Allocation</h3>
              <p className="text-xs text-zinc-400">Pending vs completed commitments per member</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181822',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                  itemStyle={{
                    color: '#ffffff',
                    fontWeight: 500,
                  }}
                  labelStyle={{
                    color: '#ffffff',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                />
                <Bar dataKey="Completed" fill="#f4f4f5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#3f3f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Status Distribution */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Execution Status Distribution</h3>
              <p className="text-xs text-zinc-400">Breakdown of organizational action items</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181822',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                  itemStyle={{
                    color: '#ffffff',
                    fontWeight: 500,
                  }}
                  labelStyle={{
                    color: '#ffffff',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
            {statusPieData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>
                  {s.name} ({s.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Decisions & Tasks per Meeting */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Commitment Extraction Cadence</h3>
              <p className="text-xs text-zinc-400">Decisions vs Tasks extracted across meetings</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={meetingTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" vertical={false} />
                <XAxis dataKey="meeting" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181822',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  }}
                  itemStyle={{
                    color: '#ffffff',
                    fontWeight: 500,
                  }}
                  labelStyle={{
                    color: '#ffffff',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                />
                <Line type="monotone" dataKey="decisions" stroke="#f4f4f5" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tasks" stroke="#71717a" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Execution Risk Factor Breakdown */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Execution Risk Factors</h3>
              <p className="text-xs text-zinc-400">AI Risk Predictor sensitivity breakdown</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {riskFactors.map((rf) => (
              <div key={rf.factor} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200">{rf.factor}</span>
                  <span className="font-mono text-zinc-400 text-[11px]">{rf.level}% Risk</span>
                </div>
                <div className="h-2 rounded-full bg-[#1e1e27] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rf.level >= 80 ? 'bg-zinc-100' : rf.level >= 60 ? 'bg-zinc-400' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${rf.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
