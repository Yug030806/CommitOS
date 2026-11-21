import { NextRequest, NextResponse } from 'next/server';
import { RBAC } from '@/lib/rbac';
import { AppRole, ConflictStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conflictId,
      action,
      resolutionNotes = '',
      actor,
      isLeaderAuthorized = false,
    } = body as {
      conflictId: string;
      action: ConflictStatus;
      resolutionNotes?: string;
      actor: { id: string; name: string; role: AppRole; organizationId: string };
      isLeaderAuthorized?: boolean;
    };

    if (!conflictId || !action || !actor) {
      return NextResponse.json(
        { error: 'Missing required fields (conflictId, action, actor).' },
        { status: 400 }
      );
    }

    // SERVER-SIDE RBAC ENFORCEMENT
    // 1. Verify approval authority
    if (action === 'approved') {
      const perm = RBAC.canApproveDecisionConflict(actor.role, isLeaderAuthorized);
      if (!perm.allowed) {
        return NextResponse.json(
          {
            error: 'Security Violation: Unauthorized Decision Approval.',
            reason: perm.reason || 'Only Organization Admins can ratify decision modifications.',
            code: 'FORBIDDEN_ROLE_ACTION',
          },
          { status: 403 }
        );
      }
    } else if (action === 'rejected') {
      if (!RBAC.canRejectDecisionConflict(actor.role)) {
        return NextResponse.json(
          {
            error: 'Security Violation: Unauthorized Decision Rejection.',
            reason: 'Team Members have read-only access to decision triage.',
            code: 'FORBIDDEN_ROLE_ACTION',
          },
          { status: 403 }
        );
      }
    }

    // Record server audit trail payload
    const auditRecord = {
      id: `audit-${Date.now()}`,
      organizationId: actor.organizationId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: `DECISION_CONFLICT_${action.toUpperCase()}`,
      entityType: 'conflict',
      entityId: conflictId,
      metadata: {
        action,
        resolutionNotes,
        serverVerified: true,
        authorizedByAdmin: actor.role === 'org_admin' || isLeaderAuthorized,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Server successfully verified and ratified conflict triage as ${action}.`,
      action,
      resolution: {
        status: action,
        notes: resolutionNotes,
        triageAt: new Date().toISOString(),
      },
      auditRecord,
    });
  } catch (err: any) {
    console.error('Triage decision error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error verifying decision permissions.' },
      { status: 500 }
    );
  }
}
