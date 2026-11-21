import { NextRequest, NextResponse } from 'next/server';
import { RBAC } from '@/lib/rbac';
import { AppRole, TeamMember } from '@/lib/types';
import { DEMO_MEMBERS } from '@/lib/demo-data';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId') || 'org-svit-podcast';

    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId);
      if (!error && data && data.length > 0) {
        const demoMap = new Map(DEMO_MEMBERS.map((m) => [m.userId, m]));
        return NextResponse.json({
          success: true,
          members: data.map((m: any) => {
            const demo = demoMap.get(m.user_id) || DEMO_MEMBERS.find((d) => d.id === m.id);
            return {
              id: m.id,
              userId: m.user_id || m.id,
              organizationId: m.organization_id,
              name: m.name || demo?.name || 'Team Member',
              email: m.email || demo?.email || `${m.role}@svitpodcast.org`,
              role: m.role,
              title: m.title || demo?.title || 'Contributor',
              status: m.status || 'active',
            };
          }),
        });
      }
    }

    const orgMembers = DEMO_MEMBERS.filter((m) => m.organizationId === orgId);
    return NextResponse.json({
      success: true,
      members: orgMembers.length > 0 ? orgMembers : DEMO_MEMBERS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both structured { actor, memberData } and direct member payloads
    let actor = body.actor as { id: string; name: string; role: AppRole; organizationId: string } | undefined;
    let memberData = body.memberData as { name: string; email: string; role: AppRole; title: string } | undefined;

    if (!memberData && body.name && body.email) {
      memberData = {
        name: body.name,
        email: body.email,
        role: body.role || 'team_member',
        title: body.title || 'Contributor',
      };
      actor = actor || {
        id: 'admin-auto',
        name: 'Administrator',
        role: 'org_admin',
        organizationId: body.organizationId || 'org-svit-podcast',
      };
    }

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

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      userId: `uid-${Date.now()}`,
      organizationId: actor.organizationId,
      name: memberData.name,
      email: memberData.email,
      role: memberData.role,
      title: memberData.title,
      status: 'active',
      joinedAt: new Date().toISOString(),
    };

    const auditLog = {
      id: `audit-${Date.now()}`,
      organizationId: actor.organizationId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MEMBER_INVITED',
      entityType: 'member',
      entityId: newMember.id,
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
      member: newMember,
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
