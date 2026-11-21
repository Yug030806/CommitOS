-- ==============================================================================
-- CommitOS: Database Schema & Migration Script
-- Target: Supabase PostgreSQL with pgvector extension & Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORGANIZATION MEMBERS (Three Primary Roles: org_admin, team_leader, team_member)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'team_member', -- 'org_admin', 'team_leader', 'team_member'
    title TEXT NOT NULL,                      -- e.g. 'Production Head', 'Marketing Lead'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    duration TEXT,
    audio_url TEXT,
    status TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'processed', 'needs_review', 'failed'
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MEETING PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRANSCRIPTS
CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp_start TEXT,
    timestamp_end TEXT,
    sequence_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DECISIONS TABLE
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved', -- 'approved', 'proposed', 'rejected', 'superseded'
    confidence NUMERIC(3, 2) DEFAULT 0.95,
    category TEXT NOT NULL DEFAULT 'general',
    rationale TEXT,
    decided_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DECISION HISTORY TABLE (Audit Trail)
CREATE TABLE IF NOT EXISTS public.decision_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
    previous_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    source_meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DECISION CONFLICTS (Signature Feature)
CREATE TABLE IF NOT EXISTS public.decision_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    new_meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    previous_decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
    proposed_value TEXT NOT NULL,
    previous_value TEXT NOT NULL,
    conflict_reason TEXT NOT NULL,
    impact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'discussed'
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TASKS TABLE (AI Execution Agent)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
    decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    assignee_name TEXT NOT NULL,
    assignee_role TEXT,
    deadline DATE,
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT NOT NULL DEFAULT 'todo',     -- 'todo', 'in_progress', 'review', 'completed'
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TASK COMMENTS
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ORGANIZATIONAL MEMORIES & MEMORY EMBEDDINGS (pgvector)
CREATE TABLE IF NOT EXISTS public.organizational_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    embedding vector(768), -- Gemini text-embedding-004 dimension is 768
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXECUTION RISKS (Predictor Agent)
CREATE TABLE IF NOT EXISTS public.execution_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    title TEXT NOT NULL,
    reason TEXT NOT NULL,
    affected_task_ids UUID[],
    potential_impact TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'conflict_detected', 'risk_alert', 'task_assigned', 'decision_updated'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g. 'DECISION_OVERRIDDEN', 'CONFLICT_RESOLVED'
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_meetings_org ON public.meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_decisions_org ON public.decisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_decisions_meeting ON public.decisions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_org ON public.decision_conflicts(organization_id);
CREATE INDEX IF NOT EXISTS idx_memories_org ON public.organizational_memories(organization_id);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON public.organizational_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 18. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS & POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user belongs to organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current auth user is Organization Admin
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid() AND role = 'org_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current auth user is Team Leader or Admin
CREATE OR REPLACE FUNCTION public.is_leader_or_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid() AND role IN ('org_admin', 'team_leader')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Organizations Policies (Isolation: Only members can view their organization)
CREATE POLICY "Members can view their own organization"
    ON public.organizations FOR SELECT
    USING (public.is_org_member(id));

CREATE POLICY "Admins can update their organization"
    ON public.organizations FOR UPDATE
    USING (public.is_org_admin(id));

-- 2. Organization Members Policies (Role management restricted to Admins)
CREATE POLICY "Members can view roster of their organization"
    ON public.organization_members FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Admins can invite and assign member roles"
    ON public.organization_members FOR INSERT
    WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Admins can modify member roles"
    ON public.organization_members FOR UPDATE
    USING (public.is_org_admin(organization_id));

CREATE POLICY "Admins can remove members"
    ON public.organization_members FOR DELETE
    USING (public.is_org_admin(organization_id));

-- 3. Meetings Policies (Leaders and Admins can upload meetings)
CREATE POLICY "Members can view meetings in their organization"
    ON public.meetings FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Leaders and Admins can create meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (public.is_leader_or_admin(organization_id));

CREATE POLICY "Admins can delete meetings"
    ON public.meetings FOR DELETE
    USING (public.is_org_admin(organization_id));

-- 4. Decisions Policies
CREATE POLICY "Members can view decisions in their organization"
    ON public.decisions FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Leaders and Admins can create decisions"
    ON public.decisions FOR INSERT
    WITH CHECK (public.is_leader_or_admin(organization_id));

CREATE POLICY "Admins can modify ratified decisions"
    ON public.decisions FOR UPDATE
    USING (public.is_org_admin(organization_id));

-- 5. Decision Conflicts Policies (Signature Security: Official approval restricted to Admins)
CREATE POLICY "Members can view decision conflicts"
    ON public.decision_conflicts FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Admins can ratify decision conflicts"
    ON public.decision_conflicts FOR UPDATE
    USING (public.is_org_admin(organization_id));

-- 6. Tasks Policies (Members can update status; Leaders/Admins can create & assign)
CREATE POLICY "Members can view organization tasks"
    ON public.tasks FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Leaders and Admins can create tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (public.is_leader_or_admin(organization_id));

CREATE POLICY "Members can update task progress"
    ON public.tasks FOR UPDATE
    USING (public.is_org_member(organization_id));

CREATE POLICY "Leaders and Admins can delete tasks"
    ON public.tasks FOR DELETE
    USING (public.is_leader_or_admin(organization_id));

-- 7. Memories & Embeddings Policies
CREATE POLICY "Members can query organizational memory"
    ON public.organizational_memories FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Leaders and Admins can write memory records"
    ON public.organizational_memories FOR INSERT
    WITH CHECK (public.is_leader_or_admin(organization_id));

-- 8. Execution Risks Policies
CREATE POLICY "Members can view execution risks"
    ON public.execution_risks FOR SELECT
    USING (public.is_org_member(organization_id));

-- 9. Audit Logs Policies (Tamper-evident trail for leaders & admins)
CREATE POLICY "Leaders and Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_leader_or_admin(organization_id));

CREATE POLICY "System can record audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.is_org_member(organization_id));
