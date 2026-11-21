'use client';

import {
  Organization,
  Meeting,
  Decision,
  DecisionHistoryItem,
  DecisionConflict,
  Task,
  OrganizationalMemory,
  ExecutionRisk,
  ChatMessage,
  ConflictStatus,
} from './types';
import {
  DEMO_ORGANIZATION,
  DEMO_MEETINGS,
  DEMO_DECISIONS,
  DEMO_CONFLICTS,
  DEMO_TASKS,
  DEMO_MEMORIES,
  DEMO_RISKS,
} from './demo-data';

const STORAGE_KEYS = {
  ORGANIZATION: 'commitos_organization',
  MEETINGS: 'commitos_meetings',
  DECISIONS: 'commitos_decisions',
  DECISION_HISTORY: 'commitos_decision_history',
  CONFLICTS: 'commitos_conflicts',
  TASKS: 'commitos_tasks',
  MEMORIES: 'commitos_memories',
  RISKS: 'commitos_risks',
  SETTINGS: 'commitos_settings',
  CHAT_MESSAGES: 'commitos_chat_messages',
};

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  transcriptionProvider: string;
  deepgramApiKey?: string;
  assemblyAiApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isDemoMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',
  transcriptionProvider: 'gemini_audio',
  deepgramApiKey: '',
  assemblyAiApiKey: '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  isDemoMode: true,
};

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom window event for inter-component reactive updates
    window.dispatchEvent(new Event('commitos_storage_updated'));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export class CommitOSStore {
  // Reset all data back to clean SVIT Podcast Club initial demo state
  static resetToDemo(): void {
    if (typeof window === 'undefined') return;
    safeSet(STORAGE_KEYS.ORGANIZATION, DEMO_ORGANIZATION);
    safeSet(STORAGE_KEYS.MEETINGS, DEMO_MEETINGS);
    safeSet(STORAGE_KEYS.DECISIONS, DEMO_DECISIONS);
    safeSet(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
    safeSet(STORAGE_KEYS.TASKS, DEMO_TASKS);
    safeSet(STORAGE_KEYS.MEMORIES, DEMO_MEMORIES);
    safeSet(STORAGE_KEYS.RISKS, DEMO_RISKS);
    safeSet(STORAGE_KEYS.DECISION_HISTORY, [
      {
        id: 'hist-001',
        decisionId: 'dec-101',
        previousValue: 'None',
        newValue: 'December 15',
        changedBy: 'Yug',
        sourceMeetingId: 'meet-001',
        sourceMeetingTitle: 'Event Planning Meeting',
        reason: 'Initial ratification for flagship event date',
        timestamp: '2026-11-15T16:30:00Z',
      },
    ]);
  }

  static getOrganization(): Organization {
    return safeGet<Organization>(STORAGE_KEYS.ORGANIZATION, DEMO_ORGANIZATION);
  }

  static getMeetings(): Meeting[] {
    return safeGet<Meeting[]>(STORAGE_KEYS.MEETINGS, DEMO_MEETINGS);
  }

  static getMeetingById(id: string): Meeting | undefined {
    const meetings = this.getMeetings();
    return meetings.find((m) => m.id === id);
  }

  static addMeeting(meeting: Meeting): void {
    const meetings = this.getMeetings();
    const updated = [meeting, ...meetings];
    safeSet(STORAGE_KEYS.MEETINGS, updated);

    // Also register any extracted decisions
    if (meeting.decisions && meeting.decisions.length > 0) {
      const currentDecisions = this.getDecisions();
      safeSet(STORAGE_KEYS.DECISIONS, [...meeting.decisions, ...currentDecisions]);
    }

    // Also register any extracted tasks
    if (meeting.actionItems && meeting.actionItems.length > 0) {
      const currentTasks = this.getTasks();
      safeSet(STORAGE_KEYS.TASKS, [...meeting.actionItems, ...currentTasks]);
    }

    // Register memories
    const newMemories: OrganizationalMemory[] = [
      {
        id: `mem-${Date.now()}`,
        organizationId: meeting.organizationId,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        date: meeting.date.split('T')[0],
        category: 'Meeting Summary',
        content: meeting.summary,
        tags: [meeting.title.toLowerCase(), ...meeting.participants.map((p) => p.split(' ')[0].toLowerCase())],
      },
    ];
    const currentMemories = this.getMemories();
    safeSet(STORAGE_KEYS.MEMORIES, [...newMemories, ...currentMemories]);

    // Recalculate risks
    this.recalculateRisks();
  }

  static getDecisions(): Decision[] {
    return safeGet<Decision[]>(STORAGE_KEYS.DECISIONS, DEMO_DECISIONS);
  }

  static getDecisionHistory(): DecisionHistoryItem[] {
    return safeGet<DecisionHistoryItem[]>(STORAGE_KEYS.DECISION_HISTORY, []);
  }

  static updateDecision(id: string, partial: Partial<Decision>, actorName = 'Admin', reason = 'Manual update'): void {
    const decisions = this.getDecisions();
    const idx = decisions.findIndex((d) => d.id === id);
    if (idx === -1) return;

    const oldDecision = decisions[idx];
    const updatedDecision = { ...oldDecision, ...partial };
    decisions[idx] = updatedDecision;
    safeSet(STORAGE_KEYS.DECISIONS, decisions);

    // Record history
    if (partial.value && partial.value !== oldDecision.value) {
      const history = this.getDecisionHistory();
      const newHistoryItem: DecisionHistoryItem = {
        id: `hist-${Date.now()}`,
        decisionId: id,
        previousValue: oldDecision.value,
        newValue: partial.value,
        changedBy: actorName,
        sourceMeetingId: oldDecision.meetingId,
        sourceMeetingTitle: oldDecision.meetingTitle,
        reason,
        timestamp: new Date().toISOString(),
      };
      safeSet(STORAGE_KEYS.DECISION_HISTORY, [newHistoryItem, ...history]);
    }
  }

  static getConflicts(): DecisionConflict[] {
    return safeGet<DecisionConflict[]>(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
  }

  static addConflict(conflict: DecisionConflict): void {
    const conflicts = this.getConflicts();
    safeSet(STORAGE_KEYS.CONFLICTS, [conflict, ...conflicts]);
  }

  static resolveConflict(
    conflictId: string,
    action: ConflictStatus,
    resolutionNotes?: string,
    actorName = 'Yug (Production Head)'
  ): void {
    const conflicts = this.getConflicts();
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    conflict.status = action;
    safeSet(STORAGE_KEYS.CONFLICTS, [...conflicts]);

    // If approved, update the original decision and mark previous as superseded
    if (action === 'approved') {
      const decisions = this.getDecisions();
      const prevDec = decisions.find((d) => d.id === conflict.previousDecisionId);
      if (prevDec) {
        const history = this.getDecisionHistory();
        history.unshift({
          id: `hist-${Date.now()}`,
          decisionId: prevDec.id,
          previousValue: prevDec.value,
          newValue: conflict.proposedValue,
          changedBy: actorName,
          sourceMeetingId: conflict.newMeetingId,
          sourceMeetingTitle: conflict.newMeetingTitle,
          reason: resolutionNotes || `Ratified change from ${conflict.newMeetingTitle}`,
          timestamp: new Date().toISOString(),
        });
        safeSet(STORAGE_KEYS.DECISION_HISTORY, history);

        prevDec.value = conflict.proposedValue;
        prevDec.status = 'approved';
        safeSet(STORAGE_KEYS.DECISIONS, [...decisions]);
      }
    } else if (action === 'rejected') {
      // Keep previous decision as approved, mark the proposed decision as rejected
      const decisions = this.getDecisions();
      const proposedDec = decisions.find(
        (d) => d.meetingId === conflict.newMeetingId && d.value === conflict.proposedValue
      );
      if (proposedDec) {
        proposedDec.status = 'rejected';
        safeSet(STORAGE_KEYS.DECISIONS, [...decisions]);
      }
    }

    this.recalculateRisks();
  }

  static getTasks(): Task[] {
    return safeGet<Task[]>(STORAGE_KEYS.TASKS, DEMO_TASKS);
  }

  static addTask(task: Task): void {
    const tasks = this.getTasks();
    safeSet(STORAGE_KEYS.TASKS, [task, ...tasks]);
    this.recalculateRisks();
  }

  static updateTask(id: string, partial: Partial<Task>): void {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    if (partial.status === 'completed' && tasks[idx].status !== 'completed') {
      partial.completedAt = new Date().toISOString();
    }
    tasks[idx] = { ...tasks[idx], ...partial };
    safeSet(STORAGE_KEYS.TASKS, tasks);
    this.recalculateRisks();
  }

  static deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    safeSet(STORAGE_KEYS.TASKS, tasks);
    this.recalculateRisks();
  }

  static getMemories(): OrganizationalMemory[] {
    return safeGet<OrganizationalMemory[]>(STORAGE_KEYS.MEMORIES, DEMO_MEMORIES);
  }

  static searchMemories(query: string): OrganizationalMemory[] {
    const memories = this.getMemories();
    if (!query.trim()) return memories;
    const lower = query.toLowerCase();
    return memories.filter(
      (m) =>
        m.content.toLowerCase().includes(lower) ||
        m.category.toLowerCase().includes(lower) ||
        m.meetingTitle.toLowerCase().includes(lower) ||
        m.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  static getRisks(): ExecutionRisk[] {
    return safeGet<ExecutionRisk[]>(STORAGE_KEYS.RISKS, DEMO_RISKS);
  }

  static recalculateRisks(): ExecutionRisk[] {
    const tasks = this.getTasks();
    const conflicts = this.getConflicts();
    const pendingConflicts = conflicts.filter((c) => c.status === 'pending');
    const overdueTasks = tasks.filter((t) => {
      if (t.status === 'completed') return false;
      const due = new Date(t.deadline).getTime();
      return due < Date.now();
    });
    const highPriorityIncomplete = tasks.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
    );

    const generatedRisks: ExecutionRisk[] = [];

    if (pendingConflicts.length > 0) {
      generatedRisks.push({
        id: `risk-conf-${Date.now()}`,
        organizationId: DEMO_ORGANIZATION.id,
        level: 'HIGH',
        title: 'Unresolved Decision Conflict Causing Execution Ambiguity',
        reason: `Pending conflict: "${pendingConflicts[0].previousValue}" vs proposed "${pendingConflicts[0].proposedValue}". Downstream tasks cannot proceed without date certainty.`,
        affectedTaskTitles: highPriorityIncomplete.slice(0, 3).map((t) => t.title),
        potentialImpact: 'High likelihood of wasted effort, missed sponsor deliverables, and venue cancellation.',
        recommendedAction: 'Resolve the date conflict in Decision Triage to align the marketing and sponsorship leads.',
        detectedAt: new Date().toISOString(),
      });
    } else if (overdueTasks.length > 0) {
      generatedRisks.push({
        id: `risk-overdue-${Date.now()}`,
        organizationId: DEMO_ORGANIZATION.id,
        level: 'MEDIUM',
        title: `${overdueTasks.length} Overdue Action Items Requiring Attention`,
        reason: `Tasks past their deadline: ${overdueTasks.map((t) => t.title).join(', ')}.`,
        affectedTaskTitles: overdueTasks.map((t) => t.title),
        potentialImpact: 'Milestone delays cascading into production prep.',
        recommendedAction: 'Reassign or grant deadline extensions to ensure accountability.',
        detectedAt: new Date().toISOString(),
      });
    } else {
      generatedRisks.push({
        id: `risk-low-${Date.now()}`,
        organizationId: DEMO_ORGANIZATION.id,
        level: 'LOW',
        title: 'Execution On Track',
        reason: 'All conflicts resolved and high priority tasks are progressing towards the target event date.',
        affectedTaskTitles: [],
        potentialImpact: 'Minimal risk detected across current club milestones.',
        recommendedAction: 'Maintain weekly sync schedule.',
        detectedAt: new Date().toISOString(),
      });
    }

    safeSet(STORAGE_KEYS.RISKS, generatedRisks);
    return generatedRisks;
  }

  static getSettings(): AppSettings {
    return safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  }

  static getChatMessages(): ChatMessage[] {
    return safeGet<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          'Hello! I am CommitOS, your AI organizational memory assistant. Ask me anything about previous SVIT Podcast Club meetings, approved budgets, task assignments, or decision history.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }

  static addChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    safeSet(STORAGE_KEYS.CHAT_MESSAGES, [...messages, message]);
  }
}
