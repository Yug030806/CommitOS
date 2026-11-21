import { NextRequest, NextResponse } from 'next/server';
import { RBAC } from '@/lib/rbac';
import { AppRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, memberData } = body as {
      actor: { id: string; name: string; role: AppRole; organizationId: string };
      memberData: { name: string; email: string; role: AppRole; title: string };
    };

    if (!actor || !memberData) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // SERVER-SIDE RBAC ENFORCEMENT
    if (!RBAC.canManageMembers(actor.role)) {
      return NextResponse.json(
        {
          error: 'Security Violation: Unauthorized Member Invitation.',
          reason: 'Only Organization Admins can invite team members and assign roles.',
        },
        { status: 403 }
      );
    }

    const auditLog = {
      id: `audit-${Date.now()}`,
      organizationId: actor.organizationId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MEMBER_INVITED',
      entityType: 'member',
      entityId: `new-${Date.now()}`,
      metadata: {
        invitedName: memberData.name,
        invitedEmail: memberData.email,
        assignedRole: memberData.role,
        assignedTitle: memberData.title,
        serverVerified: true,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Member invitation authorized and logged.',
      auditLog,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, targetMemberId, newRole, newTitle } = body as {
      actor: { id: string; name: string; role: AppRole; organizationId: string };
      targetMemberId: string;
      newRole: AppRole;
      newTitle?: string;
    };

    if (!actor || !targetMemberId || !newRole) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // SERVER-SIDE RBAC ENFORCEMENT: Prevent unauthorized role modifications
    if (!RBAC.canAssignRoles(actor.role)) {
      return NextResponse.json(
        {
          error: 'Security Violation: Unauthorized Role Modification.',
          reason: 'Only Organization Admins can modify member roles.',
        },
        { status: 403 }
      );
    }

    const auditLog = {
      id: `audit-${Date.now()}`,
      organizationId: actor.organizationId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ROLE_MODIFIED',
      entityType: 'member',
      entityId: targetMemberId,
      metadata: {
        newRole,
        newTitle,
        serverVerified: true,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Role modification authorized and logged.',
      auditLog,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, targetMemberId, isSelf } = body as {
      actor: { id: string; name: string; role: AppRole; organizationId: string };
      targetMemberId: string;
      isSelf?: boolean;
    };

    if (!actor || !targetMemberId) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    if (!RBAC.canManageMembers(actor.role)) {
      return NextResponse.json(
        {
          error: 'Security Violation: Unauthorized Member Removal.',
          reason: 'Only Organization Admins can remove members from the organization.',
        },
        { status: 403 }
      );
    }

    if (isSelf || actor.id === targetMemberId) {
      return NextResponse.json(
        {
          error: 'Action Denied: You cannot remove your own administrator account. Transfer admin role first.',
        },
        { status: 400 }
      );
    }

    const auditLog = {
      id: `audit-${Date.now()}`,
      organizationId: actor.organizationId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MEMBER_REMOVED',
      entityType: 'member',
      entityId: targetMemberId,
      metadata: { serverVerified: true },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Member removal authorized and logged.',
      auditLog,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
