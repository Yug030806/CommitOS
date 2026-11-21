'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Columns,
  List,
  CheckCircle2,
  Circle,
  Clock,
  User,
  Trash2,
  MoreVertical,
  X,
  AlertCircle,
} from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { Task, TaskPriority, TaskStatus, TeamMember } from '@/lib/types';
import { RBAC, ROLE_DEFINITIONS } from '@/lib/rbac';
import { Lock, ShieldCheck } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => CommitOSStore.getTasks());
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => CommitOSStore.getCurrentUser());
  const [members, setMembers] = useState<TeamMember[]>(() => CommitOSStore.getMembers());

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(members[0]?.name || 'Yug');
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  const loadTasks = () => {
    setTasks(CommitOSStore.getTasks());
    setCurrentUser(CommitOSStore.getCurrentUser());
    setMembers(CommitOSStore.getMembers());
  };

  useEffect(() => {
    loadTasks();
    window.addEventListener('commitos_storage_updated', loadTasks);
    return () => window.removeEventListener('commitos_storage_updated', loadTasks);
  }, []);

  const canCreate = RBAC.canCreateTasks(currentUser.role);
  const canDelete = RBAC.canDeleteTasks(currentUser.role);

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    CommitOSStore.updateTask(id, { status });
    loadTasks();
  };

  const handleDeleteTask = (id: string) => {
    if (!canDelete) {
      alert('Only Organization Admins and Team Leaders can delete tasks.');
      return;
    }
    CommitOSStore.deleteTask(id);
    loadTasks();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      alert('Only Organization Admins and Team Leaders can create and assign tasks.');
      return;
    }
    if (!newTitle.trim()) return;

    const member = members.find((m) => m.name === newAssignee);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      organizationId: CommitOSStore.getActiveOrgId(),
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom organizational task',
      assigneeName: newAssignee,
      assigneeRole: member?.title || 'Team Contributor',
      deadline: newDeadline,
      priority: newPriority,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    CommitOSStore.addTask(newTask);
    setIsAddOpen(false);
    setNewTitle('');
    setNewDesc('');
    loadTasks();
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    const matchesAssignee = assigneeFilter === 'all' || t.assigneeName.includes(assigneeFilter);
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesAssignee && matchesPriority;
  });

  const columns: { key: TaskStatus; label: string }[] = [
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Execution Tasks</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track commitments, assignee accountability, and milestone deadlines
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Switcher Pills */}
          <div className="flex items-center p-1 rounded-lg bg-[#14141a] border border-[#23232e]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {canCreate ? (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          ) : (
            <div
              title="Creating and assigning tasks requires Organization Admin or Team Leader privileges"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 text-zinc-500 border border-zinc-800 text-xs cursor-not-allowed shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Add Task (Leader/Admin)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter tasks by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Toggle: My Assigned Tasks */}
          <button
            onClick={() => setAssigneeFilter(assigneeFilter === currentUser.name ? 'all' : currentUser.name)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              assigneeFilter === currentUser.name
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-[#14141a] text-zinc-400 hover:text-white border-[#23232e]'
            }`}
          >
            <span>Assigned to Me</span>
            {assigneeFilter === currentUser.name && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>

          {/* Member Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Assignees</option>
            {members.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name} ({m.title})
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#14141a] border border-[#23232e] text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="rounded-xl bg-[#101015] border border-[#1f1f28] p-4 flex flex-col min-h-[220px] md:min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1b24] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-lg bg-[#16161d] border border-[#262633] hover:border-zinc-600 transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                            task.priority === 'urgent'
                              ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                              : task.priority === 'high'
                              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-white leading-snug">{task.title}</h4>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#22222e] flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-zinc-200 font-medium">{task.assigneeName}</span>
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {task.deadline}
                        </span>
                      </div>

                      {/* Quick Move Dropdown */}
                      <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Move status:</span>
                        <div className="flex items-center gap-1">
                          {columns
                            .filter((c) => c.key !== task.status)
                            .map((c) => (
                              <button
                                key={c.key}
                                onClick={() => handleUpdateStatus(task.id, c.key)}
                                className="px-1.5 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[9px]"
                              >
                                {c.label.split(' ')[0]}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-10 text-xs text-zinc-600">No tasks in this lane</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="rounded-xl bg-[#121217] border border-[#23232f] overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-[#1f1f28] bg-[#0f0f14]">
            <span className="col-span-1">Status</span>
            <span className="col-span-5">Task Details</span>
            <span className="col-span-2">Assignee</span>
            <span className="col-span-2">Deadline</span>
            <span className="col-span-1">Priority</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#1c1c25]">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-12 px-5 py-3.5 items-center text-xs hover:bg-[#16161e] transition-colors"
              >
                <div className="col-span-1">
                  <button
                    onClick={() =>
                      handleUpdateStatus(t.id, t.status === 'completed' ? 'todo' : 'completed')
                    }
                    className="text-zinc-500 hover:text-white"
                  >
                    {t.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="col-span-5 pr-4">
                  <p
                    className={`font-semibold ${
                      t.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'
                    }`}
                  >
                    {t.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{t.description}</p>
                </div>

                <div className="col-span-2">
                  <span className="text-zinc-200 font-medium">{t.assigneeName}</span>
                  <p className="text-[10px] text-zinc-500">{t.assigneeRole}</p>
                </div>

                <div className="col-span-2 text-zinc-400 flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{t.deadline}</span>
                </div>

                <div className="col-span-1">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      t.priority === 'urgent'
                        ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                        : t.priority === 'high'
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="col-span-1 text-right">
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-zinc-600 hover:text-white transition-colors p-1"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1f28]">
            <h3 className="text-sm font-semibold text-white">Execution Milestones & Schedule (December 2026)</h3>
            <span className="text-xs text-zinc-400 font-mono">Flagship Event: Dec 15</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {['2026-12-01', '2026-12-03', '2026-12-04', '2026-12-05', '2026-12-06', '2026-12-08', '2026-12-15'].map(
              (dateStr) => {
                const dayTasks = tasks.filter((t) => t.deadline === dateStr);
                const isEventDay = dateStr === '2026-12-15';
                return (
                  <div
                    key={dateStr}
                    className={`p-3.5 rounded-lg border min-h-[120px] flex flex-col justify-between ${
                      isEventDay
                        ? 'bg-white/5 border-white/40 ring-1 ring-white/20'
                        : 'bg-[#15151c] border-[#242432]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs pb-1 mb-2 border-b border-[#21212a]">
                        <span className={`font-mono font-semibold ${isEventDay ? 'text-white' : 'text-zinc-400'}`}>
                          {dateStr}
                        </span>
                        {isEventDay && (
                          <span className="text-[9px] font-bold uppercase bg-white text-black px-1.5 py-0.2 rounded">
                            Target Date
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-1.5 rounded bg-[#1c1c26] border border-[#29293a] text-[10px] space-y-0.5"
                          >
                            <p className="font-semibold text-zinc-100 truncate">{t.title}</p>
                            <p className="text-zinc-400 text-[9px]">{t.assigneeName}</p>
                          </div>
                        ))}
                        {dayTasks.length === 0 && (
                          <p className="text-[10px] text-zinc-600 italic">No task deadline</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-md rounded-2xl bg-[#121217] border border-[#272733] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1f1f28]">
              <h3 className="text-sm font-semibold text-white">Create New Task</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm audio mixer reservation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional context, deliverables, or checklist..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white focus:outline-none"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f1f28] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
