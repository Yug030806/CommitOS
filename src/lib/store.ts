'use client';

import {
  Organization,
  TeamMember,
  AppRole,
  Meeting,
  Decision,
  DecisionHistoryItem,
  DecisionConflict,
  Task,
  OrganizationalMemory,
  ExecutionRisk,
  ChatMessage,
  ConflictStatus,
  AuditLog,
} from './types';
import {
  DEMO_ORGANIZATION,
  DEMO_ORGANIZATIONS,
  DEMO_MEMBERS,
  DEMO_MEETINGS,
  DEMO_DECISIONS,
  DEMO_CONFLICTS,
  DEMO_TASKS,
  DEMO_MEMORIES,
  DEMO_RISKS,
  DEMO_AUDIT_LOGS,
} from './demo-data';
import { RBAC } from './rbac';

const STORAGE_KEYS = {
  ORGANIZATIONS: 'commitos_organizations',
  ACTIVE_ORG_ID: 'commitos_active_org_id',
  CURRENT_USER: 'commitos_current_user',
  LEADER_APPROVAL_AUTH: 'commitos_leader_approval_authorized',
  AUDIT_LOGS: 'commitos_audit_logs',
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
    window.dispatchEvent(new Event('commitos_storage_updated'));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export class CommitOSStore {
  // Reset all data back to clean initial demo state
  static resetToDemo(): void {
    if (typeof window === 'undefined') return;
    safeSet(STORAGE_KEYS.ORGANIZATIONS, DEMO_ORGANIZATIONS);
    safeSet(STORAGE_KEYS.ACTIVE_ORG_ID, DEMO_ORGANIZATION.id);
    safeSet(STORAGE_KEYS.CURRENT_USER, DEMO_MEMBERS[0]); // Yug (Org Admin)
    safeSet(STORAGE_KEYS.LEADER_APPROVAL_AUTH, false);
    safeSet(STORAGE_KEYS.AUDIT_LOGS, DEMO_AUDIT_LOGS);
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

  // ============================================================================
  // RBAC & MULTI-ORGANIZATION IDENTITY MANAGEMENT
  // ============================================================================

  static getAllOrganizations(): Organization[] {
    return safeGet<Organization[]>(STORAGE_KEYS.ORGANIZATIONS, DEMO_ORGANIZATIONS);
  }

  static getActiveOrgId(): string {
    return safeGet<string>(STORAGE_KEYS.ACTIVE_ORG_ID, DEMO_ORGANIZATION.id);
  }

  static setActiveOrganization(orgId: string): void {
    const orgs = this.getAllOrganizations();
    const targetOrg = orgs.find((o) => o.id === orgId);
    if (!targetOrg) return;

    safeSet(STORAGE_KEYS.ACTIVE_ORG_ID, orgId);

    // If current user does not belong to target organization, switch to that org's first member
    const currentUser = this.getCurrentUser();
    const belongs = targetOrg.members.some((m) => m.id === currentUser.id || m.email === currentUser.email);
    if (!belongs && targetOrg.members.length > 0) {
      safeSet(STORAGE_KEYS.CURRENT_USER, targetOrg.members[0]);
    }

    this.recalculateRisks();
  }

  static getOrganization(orgId?: string): Organization {
    const targetId = orgId || this.getActiveOrgId();
    const orgs = this.getAllOrganizations();
    const found = orgs.find((o) => o.id === targetId);
    return found || DEMO_ORGANIZATION;
  }

  static updateOrganization(partial: Partial<Organization>): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canManageOrganization(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins can modify organization profile.');
    }

    const orgId = this.getActiveOrgId();
    const orgs = this.getAllOrganizations();
    const idx = orgs.findIndex((o) => o.id === orgId);
    if (idx === -1) return;

    orgs[idx] = { ...orgs[idx], ...partial };
    safeSet(STORAGE_KEYS.ORGANIZATIONS, orgs);

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'organization',
      entityId: orgId,
      metadata: partial,
    });
  }

  // Current active user persona
  static getCurrentUser(): TeamMember {
    const user = safeGet<TeamMember>(STORAGE_KEYS.CURRENT_USER, DEMO_MEMBERS[0]);
    // Ensure active organization role alignment
    const org = this.getOrganization();
    const memberInOrg = org.members.find((m) => m.id === user.id || m.email === user.email);
    if (memberInOrg) {
      return memberInOrg;
    }
    return user;
  }

  static setCurrentUser(user: TeamMember): void {
    safeSet(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Leader authorization flag for conflict approval (controlled by Admin)
  static isLeaderApprovalAuthorized(): boolean {
    return safeGet<boolean>(STORAGE_KEYS.LEADER_APPROVAL_AUTH, false);
  }

  static setLeaderApprovalAuthorized(authorized: boolean): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canManageOrganization(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins can authorize leader approval permissions.');
    }
    safeSet(STORAGE_KEYS.LEADER_APPROVAL_AUTH, authorized);

    this.addAuditLog({
      organizationId: this.getActiveOrgId(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: authorized ? 'LEADER_APPROVAL_AUTHORIZED' : 'LEADER_APPROVAL_REVOKED',
      entityType: 'settings',
      entityId: 'rbac-delegation',
      metadata: { authorized },
    });
  }

  // ============================================================================
  // TEAM MEMBER MANAGEMENT
  // ============================================================================

  static getMembers(orgId?: string): TeamMember[] {
    const org = this.getOrganization(orgId);
    return org.members || [];
  }

  static inviteMember(data: { name: string; email: string; role: AppRole; title: string }): TeamMember {
    const actor = this.getCurrentUser();
    if (!RBAC.canManageMembers(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins can invite team members.');
    }

    const orgId = this.getActiveOrgId();
    const orgs = this.getAllOrganizations();
    const orgIndex = orgs.findIndex((o) => o.id === orgId);
    if (orgIndex === -1) throw new Error('Organization not found.');

    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      userId: `uid-${Date.now()}`,
      organizationId: orgId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      title: data.title.trim() || 'Team Contributor',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    orgs[orgIndex].members = [...orgs[orgIndex].members, newMember];
    safeSet(STORAGE_KEYS.ORGANIZATIONS, orgs);

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MEMBER_INVITED',
      entityType: 'member',
      entityId: newMember.id,
      metadata: { name: newMember.name, email: newMember.email, role: newMember.role, title: newMember.title },
    });

    return newMember;
  }

  static updateMemberRole(memberId: string, newRole: AppRole, newTitle?: string): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canAssignRoles(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins can modify member roles.');
    }

    const orgId = this.getActiveOrgId();
    const orgs = this.getAllOrganizations();
    const orgIndex = orgs.findIndex((o) => o.id === orgId);
    if (orgIndex === -1) return;

    const memberIndex = orgs[orgIndex].members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) return;

    const oldRole = orgs[orgIndex].members[memberIndex].role;
    orgs[orgIndex].members[memberIndex].role = newRole;
    if (newTitle) {
      orgs[orgIndex].members[memberIndex].title = newTitle;
    }

    safeSet(STORAGE_KEYS.ORGANIZATIONS, orgs);

    // If updating currently logged in user, refresh current user state too
    if (actor.id === memberId) {
      this.setCurrentUser(orgs[orgIndex].members[memberIndex]);
    }

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ROLE_MODIFIED',
      entityType: 'member',
      entityId: memberId,
      metadata: {
        memberName: orgs[orgIndex].members[memberIndex].name,
        oldRole,
        newRole,
        newTitle,
      },
    });
  }

  static removeMember(memberId: string): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canManageMembers(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins can remove team members.');
    }

    const orgId = this.getActiveOrgId();
    const orgs = this.getAllOrganizations();
    const orgIndex = orgs.findIndex((o) => o.id === orgId);
    if (orgIndex === -1) return;

    const target = orgs[orgIndex].members.find((m) => m.id === memberId);
    if (!target) return;

    if (target.id === actor.id) {
      throw new Error('Cannot remove yourself. Transfer admin role first.');
    }

    orgs[orgIndex].members = orgs[orgIndex].members.filter((m) => m.id !== memberId);
    safeSet(STORAGE_KEYS.ORGANIZATIONS, orgs);

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MEMBER_REMOVED',
      entityType: 'member',
      entityId: memberId,
      metadata: { name: target.name, email: target.email, role: target.role },
    });
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  static getAuditLogs(orgId?: string): AuditLog[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const logs = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEMO_AUDIT_LOGS);
    return logs.filter((l) => l.organizationId === targetOrgId);
  }

  static addAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt'>): void {
    const logs = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEMO_AUDIT_LOGS);
    const newLog: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    safeSet(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  }

  // ============================================================================
  // MEETINGS & INTELLIGENCE (ORGANIZATION-ISOLATED)
  // ============================================================================

  static getMeetings(orgId?: string): Meeting[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const meetings = safeGet<Meeting[]>(STORAGE_KEYS.MEETINGS, DEMO_MEETINGS);
    return meetings.filter((m) => m.organizationId === targetOrgId);
  }

  static getMeetingById(id: string): Meeting | undefined {
    const meetings = safeGet<Meeting[]>(STORAGE_KEYS.MEETINGS, DEMO_MEETINGS);
    return meetings.find((m) => m.id === id);
  }

  static addMeeting(meeting: Meeting): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canUploadMeetings(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins and Team Leaders can upload meetings.');
    }

    const orgId = this.getActiveOrgId();
    const meetingWithOrg: Meeting = {
      ...meeting,
      organizationId: orgId,
    };

    const allMeetings = safeGet<Meeting[]>(STORAGE_KEYS.MEETINGS, DEMO_MEETINGS);
    safeSet(STORAGE_KEYS.MEETINGS, [meetingWithOrg, ...allMeetings]);

    if (meeting.decisions && meeting.decisions.length > 0) {
      const currentDecisions = safeGet<Decision[]>(STORAGE_KEYS.DECISIONS, DEMO_DECISIONS);
      const decisionsWithOrg = meeting.decisions.map((d) => ({ ...d, organizationId: orgId }));
      safeSet(STORAGE_KEYS.DECISIONS, [...decisionsWithOrg, ...currentDecisions]);
    }

    if (meeting.actionItems && meeting.actionItems.length > 0) {
      const currentTasks = safeGet<Task[]>(STORAGE_KEYS.TASKS, DEMO_TASKS);
      const tasksWithOrg = meeting.actionItems.map((t) => ({ ...t, organizationId: orgId }));
      safeSet(STORAGE_KEYS.TASKS, [...tasksWithOrg, ...currentTasks]);
    }

    const newMemories: OrganizationalMemory[] = [
      {
        id: `mem-${Date.now()}`,
        organizationId: orgId,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        date: meeting.date.split('T')[0],
        category: 'Meeting Summary',
        content: meeting.summary,
        tags: [meeting.title.toLowerCase(), ...meeting.participants.map((p) => p.split(' ')[0].toLowerCase())],
      },
    ];
    const currentMemories = safeGet<OrganizationalMemory[]>(STORAGE_KEYS.MEMORIES, DEMO_MEMORIES);
    safeSet(STORAGE_KEYS.MEMORIES, [...newMemories, ...currentMemories]);

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MEETING_UPLOADED',
      entityType: 'meeting',
      entityId: meeting.id,
      metadata: { title: meeting.title, decisionsCount: meeting.decisions?.length || 0 },
    });

    this.recalculateRisks();
  }

  // ============================================================================
  // DECISIONS & CONFLICT TRIAGE (SERVER/STORE ENFORCED RBAC)
  // ============================================================================

  static getDecisions(orgId?: string): Decision[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const decisions = safeGet<Decision[]>(STORAGE_KEYS.DECISIONS, DEMO_DECISIONS);
    return decisions.filter((d) => d.organizationId === targetOrgId);
  }

  static getDecisionHistory(): DecisionHistoryItem[] {
    return safeGet<DecisionHistoryItem[]>(STORAGE_KEYS.DECISION_HISTORY, []);
  }

  static getConflicts(orgId?: string): DecisionConflict[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const conflicts = safeGet<DecisionConflict[]>(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
    return conflicts.filter((c) => c.organizationId === targetOrgId);
  }

  static addConflict(conflict: DecisionConflict): void {
    const orgId = this.getActiveOrgId();
    const conflicts = safeGet<DecisionConflict[]>(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
    safeSet(STORAGE_KEYS.CONFLICTS, [{ ...conflict, organizationId: orgId }, ...conflicts]);
  }

  static resolveConflict(
    conflictId: string,
    action: ConflictStatus,
    resolutionNotes?: string,
    actorOverride?: { id: string; name: string; role: AppRole }
  ): { success: boolean; message: string } {
    const actor = actorOverride || this.getCurrentUser();
    const isLeaderAuth = this.isLeaderApprovalAuthorized();

    if (action === 'approved') {
      const perm = RBAC.canApproveDecisionConflict(actor.role, isLeaderAuth);
      if (!perm.allowed) {
        return {
          success: false,
          message: perm.reason || 'Forbidden: You do not have permission to approve official decision changes.',
        };
      }
    } else if (action === 'rejected') {
      if (!RBAC.canRejectDecisionConflict(actor.role)) {
        return {
          success: false,
          message: 'Forbidden: Team Members cannot reject official decisions. Organization Admin or Team Leader required.',
        };
      }
    }

    const orgId = this.getActiveOrgId();
    const allConflicts = safeGet<DecisionConflict[]>(STORAGE_KEYS.CONFLICTS, DEMO_CONFLICTS);
    const conflict = allConflicts.find((c) => c.id === conflictId);
    if (!conflict) {
      return { success: false, message: 'Conflict not found.' };
    }

    conflict.status = action;
    safeSet(STORAGE_KEYS.CONFLICTS, [...allConflicts]);

    const actorDisplay = `${actor.name} (${actor.role === 'org_admin' ? 'Admin' : 'Leader'})`;

    if (action === 'approved') {
      const allDecisions = safeGet<Decision[]>(STORAGE_KEYS.DECISIONS, DEMO_DECISIONS);
      const prevDec = allDecisions.find((d) => d.id === conflict.previousDecisionId);
      if (prevDec) {
        const history = this.getDecisionHistory();
        history.unshift({
          id: `hist-${Date.now()}`,
          decisionId: prevDec.id,
          previousValue: prevDec.value,
          newValue: conflict.proposedValue,
          changedBy: actorDisplay,
          sourceMeetingId: conflict.newMeetingId,
          sourceMeetingTitle: conflict.newMeetingTitle,
          reason: resolutionNotes || `Ratified change from ${conflict.newMeetingTitle}`,
          timestamp: new Date().toISOString(),
        });
        safeSet(STORAGE_KEYS.DECISION_HISTORY, history);

        prevDec.value = conflict.proposedValue;
        prevDec.status = 'approved';
        safeSet(STORAGE_KEYS.DECISIONS, [...allDecisions]);
      }
    } else if (action === 'rejected') {
      const allDecisions = safeGet<Decision[]>(STORAGE_KEYS.DECISIONS, DEMO_DECISIONS);
      const proposedDec = allDecisions.find(
        (d) => d.meetingId === conflict.newMeetingId && d.value === conflict.proposedValue
      );
      if (proposedDec) {
        proposedDec.status = 'rejected';
        safeSet(STORAGE_KEYS.DECISIONS, [...allDecisions]);
      }
    }

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: `CONFLICT_${action.toUpperCase()}`,
      entityType: 'conflict',
      entityId: conflictId,
      metadata: {
        action,
        previousValue: conflict.previousValue,
        proposedValue: conflict.proposedValue,
        notes: resolutionNotes,
      },
    });

    this.recalculateRisks();
    return { success: true, message: `Conflict successfully updated to ${action}.` };
  }

  // ============================================================================
  // TASKS & EXECUTION (RBAC ENFORCED)
  // ============================================================================

  static getTasks(orgId?: string): Task[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const tasks = safeGet<Task[]>(STORAGE_KEYS.TASKS, DEMO_TASKS);
    return tasks.filter((t) => t.organizationId === targetOrgId);
  }

  static addTask(task: Task): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canCreateTasks(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins and Team Leaders can create and assign tasks.');
    }

    const orgId = this.getActiveOrgId();
    const taskWithOrg: Task = { ...task, organizationId: orgId };
    const allTasks = safeGet<Task[]>(STORAGE_KEYS.TASKS, DEMO_TASKS);
    safeSet(STORAGE_KEYS.TASKS, [taskWithOrg, ...allTasks]);

    this.addAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'TASK_CREATED',
      entityType: 'task',
      entityId: task.id,
      metadata: { title: task.title, assignee: task.assigneeName, priority: task.priority },
    });

    this.recalculateRisks();
  }

  static updateTask(id: string, partial: Partial<Task>): void {
    const actor = this.getCurrentUser();
    // All members can update status. But editing details/assignee requires Admin or Leader
    const isOnlyStatusChange = Object.keys(partial).every((k) => k === 'status' || k === 'completedAt');
    if (!isOnlyStatusChange && !RBAC.canCreateTasks(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins and Team Leaders can edit task assignments and details.');
    }

    const allTasks = safeGet<Task[]>(STORAGE_KEYS.TASKS, DEMO_TASKS);
    const idx = allTasks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    if (partial.status === 'completed' && allTasks[idx].status !== 'completed') {
      partial.completedAt = new Date().toISOString();
    }
    allTasks[idx] = { ...allTasks[idx], ...partial };
    safeSet(STORAGE_KEYS.TASKS, allTasks);

    this.addAuditLog({
      organizationId: allTasks[idx].organizationId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'TASK_UPDATED',
      entityType: 'task',
      entityId: id,
      metadata: partial,
    });

    this.recalculateRisks();
  }

  static deleteTask(id: string): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canDeleteTasks(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins and Team Leaders can delete tasks.');
    }

    const allTasks = safeGet<Task[]>(STORAGE_KEYS.TASKS, DEMO_TASKS);
    const target = allTasks.find((t) => t.id === id);
    const filtered = allTasks.filter((t) => t.id !== id);
    safeSet(STORAGE_KEYS.TASKS, filtered);

    if (target) {
      this.addAuditLog({
        organizationId: target.organizationId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'TASK_DELETED',
        entityType: 'task',
        entityId: id,
        metadata: { title: target.title },
      });
    }

    this.recalculateRisks();
  }

  // ============================================================================
  // ORGANIZATIONAL MEMORY & RISKS
  // ============================================================================

  static getMemories(orgId?: string): OrganizationalMemory[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const memories = safeGet<OrganizationalMemory[]>(STORAGE_KEYS.MEMORIES, DEMO_MEMORIES);
    return memories.filter((m) => m.organizationId === targetOrgId);
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

  static getRisks(orgId?: string): ExecutionRisk[] {
    const targetOrgId = orgId || this.getActiveOrgId();
    const risks = safeGet<ExecutionRisk[]>(STORAGE_KEYS.RISKS, DEMO_RISKS);
    return risks.filter((r) => r.organizationId === targetOrgId);
  }

  static recalculateRisks(): ExecutionRisk[] {
    const orgId = this.getActiveOrgId();
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
        organizationId: orgId,
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
        organizationId: orgId,
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
        organizationId: orgId,
        level: 'LOW',
        title: 'Execution On Track',
        reason: 'All conflicts resolved and high priority tasks are progressing towards the target milestones.',
        affectedTaskTitles: [],
        potentialImpact: 'Minimal risk detected across current organization milestones.',
        recommendedAction: 'Maintain weekly sync schedule.',
        detectedAt: new Date().toISOString(),
      });
    }

    const allRisks = safeGet<ExecutionRisk[]>(STORAGE_KEYS.RISKS, DEMO_RISKS).filter(
      (r) => r.organizationId !== orgId
    );
    safeSet(STORAGE_KEYS.RISKS, [...generatedRisks, ...allRisks]);
    return generatedRisks;
  }

  // ============================================================================
  // SETTINGS & CHAT
  // ============================================================================

  static getSettings(): AppSettings {
    return safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    const actor = this.getCurrentUser();
    if (!RBAC.canManageSettings(actor.role)) {
      throw new Error('Forbidden: Only Organization Admins can modify settings.');
    }
    safeSet(STORAGE_KEYS.SETTINGS, settings);

    this.addAuditLog({
      organizationId: this.getActiveOrgId(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'SETTINGS_UPDATED',
      entityType: 'settings',
      entityId: 'global',
    });
  }

  static getChatMessages(): ChatMessage[] {
    const org = this.getOrganization();
    return safeGet<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hello! I am CommitOS, your AI organizational memory assistant for ${org.name}. Ask me anything about previous meetings, approved budgets, task assignments, or decision history.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }

  static addChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    safeSet(STORAGE_KEYS.CHAT_MESSAGES, [...messages, message]);
  }
}
