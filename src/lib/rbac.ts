import { AppRole } from './types';

export interface RoleDefinition {
  id: AppRole;
  label: string;
  badgeLabel: string;
  description: string;
  badgeClass: string;
  dotColor: string;
}

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  org_admin: {
    id: 'org_admin',
    label: 'Organization Admin',
    badgeLabel: 'Admin',
    description: 'Full organization access, member management, decision ratifications, and settings.',
    badgeClass: 'bg-white text-black border-white font-semibold',
    dotColor: 'bg-white',
  },
  team_leader: {
    id: 'team_leader',
    label: 'Team Leader',
    badgeLabel: 'Leader',
    description: 'Upload & manage meetings, review AI intelligence, assign tasks, and monitor progress.',
    badgeClass: 'bg-zinc-800 text-zinc-100 border-zinc-700 font-medium',
    dotColor: 'bg-zinc-300',
  },
  team_member: {
    id: 'team_member',
    label: 'Team Member',
    badgeLabel: 'Member',
    description: 'View permitted meetings, update assigned tasks, query organizational memory, and view insights.',
    badgeClass: 'bg-zinc-900 text-zinc-400 border-zinc-800 font-normal',
    dotColor: 'bg-zinc-500',
  },
};

export const RBAC = {
  // 1. Organization Management
  canManageOrganization(role: AppRole): boolean {
    return role === 'org_admin';
  },

  // 2. Member Management & Invitations
  canManageMembers(role: AppRole): boolean {
    return role === 'org_admin';
  },

  canAssignRoles(role: AppRole): boolean {
    return role === 'org_admin';
  },

  canRemoveMember(actorRole: AppRole, targetRole: AppRole, isSelf: boolean): boolean {
    if (isSelf) return false; // Prevent removing self if sole admin
    return actorRole === 'org_admin';
  },

  // 3. Meeting & Intelligence
  canUploadMeetings(role: AppRole): boolean {
    return role === 'org_admin' || role === 'team_leader';
  },

  canDeleteMeetings(role: AppRole): boolean {
    return role === 'org_admin';
  },

  // 4. Tasks & Execution
  canCreateTasks(role: AppRole): boolean {
    return role === 'org_admin' || role === 'team_leader';
  },

  canDeleteTasks(role: AppRole): boolean {
    return role === 'org_admin' || role === 'team_leader';
  },

  canUpdateTaskStatus(role: AppRole): boolean {
    // All members can update progress of tasks
    return true;
  },

  // 5. Decision Conflicts & Ratifications
  // Team Leader can approve only when authorized by Organization Admin
  canApproveDecisionConflict(role: AppRole, isLeaderAuthorized = false): {
    allowed: boolean;
    reason?: string;
  } {
    if (role === 'org_admin') {
      return { allowed: true };
    }
    if (role === 'team_leader') {
      if (isLeaderAuthorized) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Approval requires Organization Admin delegation or authorization.',
      };
    }
    return {
      allowed: false,
      reason: 'Team members have read-only access to decision conflicts. Admin authorization is required.',
    };
  },

  canRejectDecisionConflict(role: AppRole): boolean {
    return role === 'org_admin' || role === 'team_leader';
  },

  canRequestDiscussion(role: AppRole): boolean {
    return true; // Any authenticated member can flag for discussion
  },

  // 6. Settings & API Keys
  canManageSettings(role: AppRole): boolean {
    return role === 'org_admin';
  },

  // 7. Audit Logs
  canViewAuditLogs(role: AppRole): boolean {
    return role === 'org_admin' || role === 'team_leader';
  },

  // 8. Ask CommitOS (Memory Access)
  canAccessMemory(role: AppRole): boolean {
    return true;
  },
};
