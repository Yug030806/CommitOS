export type DecisionStatus = 'approved' | 'proposed' | 'rejected' | 'superseded';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type ConflictStatus = 'pending' | 'approved' | 'rejected' | 'discussed';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type AppRole = 'org_admin' | 'team_leader' | 'team_member';

export interface TeamMember {
  id: string;
  userId?: string;
  organizationId?: string;
  name: string;
  email: string;
  role: AppRole;
  title: string; // e.g., "Production Head", "Marketing Lead"
  avatar?: string;
  joinedAt?: string;
  status?: 'active' | 'invited';
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  actorRole: AppRole;
  action: string; // e.g. 'DECISION_APPROVED', 'ROLE_MODIFIED', 'MEMBER_INVITED'
  entityType: 'organization' | 'member' | 'decision' | 'conflict' | 'meeting' | 'task' | 'settings';
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  organizationId: string;
  role: AppRole;
  title: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  members: TeamMember[];
  createdAt: string;
}

export interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: string; // e.g., "02:14"
}

export interface Decision {
  id: string;
  organizationId: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  value: string;
  status: DecisionStatus;
  confidence: number; // 0.0 to 1.0
  category: 'logistics' | 'budget' | 'marketing' | 'production' | 'sponsorship' | 'general';
  rationale?: string;
  decidedAt: string; // ISO date
}

export interface DecisionHistoryItem {
  id: string;
  decisionId: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  reason: string;
  timestamp: string;
}

export interface DecisionConflict {
  id: string;
  organizationId: string;
  newMeetingId: string;
  newMeetingTitle: string;
  previousDecisionId: string;
  previousMeetingTitle: string;
  previousMeetingDate: string;
  proposedValue: string;
  previousValue: string;
  conflictReason: string;
  impact: string;
  status: ConflictStatus;
  detectedAt: string;
}

export interface Task {
  id: string;
  organizationId: string;
  meetingId?: string;
  meetingTitle?: string;
  decisionId?: string;
  title: string;
  description: string;
  assigneeName: string;
  assigneeRole: string;
  deadline: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface OrganizationalMemory {
  id: string;
  organizationId: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
  category: string;
  content: string;
  tags: string[];
}

export interface ExecutionRisk {
  id: string;
  organizationId: string;
  level: RiskLevel;
  title: string;
  reason: string;
  affectedTaskTitles: string[];
  potentialImpact: string;
  recommendedAction: string;
  detectedAt: string;
}

export interface Meeting {
  id: string;
  organizationId: string;
  title: string;
  date: string;
  duration: string;
  audioUrl?: string;
  status: 'processing' | 'processed' | 'needs_review' | 'failed';
  summary: string;
  participants: string[];
  keyDiscussionPoints: string[];
  unresolvedQuestions: string[];
  decisions: Decision[];
  actionItems: Task[];
  transcript: TranscriptItem[];
  conflictDetected?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    meetingTitle: string;
    date: string;
    snippet: string;
  }[];
  timestamp: string;
}

export interface MeetingAnalysisResult {
  meeting_title: string;
  summary: string;
  participants: string[];
  discussion_points: string[];
  decisions: {
    title: string;
    value: string;
    status: DecisionStatus;
    confidence: number;
    category: 'logistics' | 'budget' | 'marketing' | 'production' | 'sponsorship' | 'general';
    rationale?: string;
  }[];
  action_items: {
    task: string;
    description?: string;
    owner: string;
    deadline: string;
    priority: TaskPriority;
  }[];
  unresolved_questions: string[];
}
