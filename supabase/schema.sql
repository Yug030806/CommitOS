-- ==============================================================================
-- CommitOS: Complete Supabase Database Schema, Indexes, RLS & Seed Script
-- Target: Supabase PostgreSQL with pgvector extension & Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORGANIZATION MEMBERS (Three Primary Roles: org_admin, team_leader, team_member)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'team_member', -- 'org_admin', 'team_leader', 'team_member'
    title TEXT NOT NULL,                      -- e.g. 'Production Head', 'Marketing Lead'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS public.meetings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    meeting_id TEXT NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRANSCRIPTS
CREATE TABLE IF NOT EXISTS public.transcripts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    meeting_id TEXT NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp_start TEXT,
    timestamp_end TEXT,
    sequence_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DECISIONS TABLE
CREATE TABLE IF NOT EXISTS public.decisions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id TEXT NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    decision_id TEXT NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
    previous_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    source_meeting_id TEXT REFERENCES public.meetings(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DECISION CONFLICTS (Signature Feature)
CREATE TABLE IF NOT EXISTS public.decision_conflicts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    new_meeting_id TEXT NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    previous_decision_id TEXT NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id TEXT REFERENCES public.meetings(id) ON DELETE SET NULL,
    decision_id TEXT REFERENCES public.decisions(id) ON DELETE SET NULL,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ORGANIZATIONAL MEMORIES & MEMORY EMBEDDINGS (pgvector)
CREATE TABLE IF NOT EXISTS public.organizational_memories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id TEXT REFERENCES public.meetings(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    embedding vector(768), -- Gemini text-embedding-004 dimension is 768
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXECUTION RISKS (Predictor Agent)
CREATE TABLE IF NOT EXISTS public.execution_risks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    title TEXT NOT NULL,
    reason TEXT NOT NULL,
    affected_task_ids TEXT[],
    potential_impact TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT LOGS (Tamper-evident trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id TEXT,
    actor_name TEXT NOT NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_meetings_org ON public.meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_decisions_org ON public.decisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_decisions_meeting ON public.decisions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_org ON public.decision_conflicts(organization_id);
CREATE INDEX IF NOT EXISTS idx_memories_org ON public.organizational_memories(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES (Idempotent with DROP IF EXISTS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for organizations" ON public.organizations;
CREATE POLICY "Public read for organizations" ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for organizations" ON public.organizations;
CREATE POLICY "Allow insert for organizations" ON public.organizations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for organizations" ON public.organizations;
CREATE POLICY "Allow update for organizations" ON public.organizations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read for members" ON public.organization_members;
CREATE POLICY "Public read for members" ON public.organization_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for members" ON public.organization_members;
CREATE POLICY "Allow insert for members" ON public.organization_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for members" ON public.organization_members;
CREATE POLICY "Allow update for members" ON public.organization_members FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete for members" ON public.organization_members;
CREATE POLICY "Allow delete for members" ON public.organization_members FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read for meetings" ON public.meetings;
CREATE POLICY "Public read for meetings" ON public.meetings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for meetings" ON public.meetings;
CREATE POLICY "Allow insert for meetings" ON public.meetings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for meetings" ON public.meetings;
CREATE POLICY "Allow update for meetings" ON public.meetings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read for decisions" ON public.decisions;
CREATE POLICY "Public read for decisions" ON public.decisions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for decisions" ON public.decisions;
CREATE POLICY "Allow insert for decisions" ON public.decisions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for decisions" ON public.decisions;
CREATE POLICY "Allow update for decisions" ON public.decisions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read for conflicts" ON public.decision_conflicts;
CREATE POLICY "Public read for conflicts" ON public.decision_conflicts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for conflicts" ON public.decision_conflicts;
CREATE POLICY "Allow insert for conflicts" ON public.decision_conflicts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for conflicts" ON public.decision_conflicts;
CREATE POLICY "Allow update for conflicts" ON public.decision_conflicts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read for tasks" ON public.tasks;
CREATE POLICY "Public read for tasks" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for tasks" ON public.tasks;
CREATE POLICY "Allow insert for tasks" ON public.tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for tasks" ON public.tasks;
CREATE POLICY "Allow update for tasks" ON public.tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read for memories" ON public.organizational_memories;
CREATE POLICY "Public read for memories" ON public.organizational_memories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for memories" ON public.organizational_memories;
CREATE POLICY "Allow insert for memories" ON public.organizational_memories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read for risks" ON public.execution_risks;
CREATE POLICY "Public read for risks" ON public.execution_risks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for risks" ON public.execution_risks;
CREATE POLICY "Allow insert for risks" ON public.execution_risks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read for audit_logs" ON public.audit_logs;
CREATE POLICY "Public read for audit_logs" ON public.audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert for audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 18. SEED DATA (SVIT Podcast Club Demonstration Dataset)
-- ==============================================================================

-- Seed Users
INSERT INTO public.users (id, email, full_name, avatar_url)
VALUES
  ('usr-yug-01', 'yug@svitpodcast.org', 'Yug Patel', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face'),
  ('usr-rahul-02', 'rahul@svitpodcast.org', 'Rahul Sharma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face'),
  ('usr-yash-03', 'yash@svitpodcast.org', 'Yash Mehta', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face'),
  ('usr-priya-04', 'priya@svitpodcast.org', 'Priya Nair', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Seed Organization
INSERT INTO public.organizations (id, name, slug, description)
VALUES
  ('org-svit-podcast', 'SVIT Podcast Club', 'svit-podcast-club', 'Premier student podcast and media production collective at SVIT.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Seed Organization Members with Roles
INSERT INTO public.organization_members (id, organization_id, user_id, role, title)
VALUES
  ('mem-001', 'org-svit-podcast', 'usr-yug-01', 'org_admin', 'Production Head'),
  ('mem-002', 'org-svit-podcast', 'usr-rahul-02', 'team_leader', 'Marketing Lead'),
  ('mem-003', 'org-svit-podcast', 'usr-yash-03', 'team_leader', 'Sponsorship Lead'),
  ('mem-004', 'org-svit-podcast', 'usr-priya-04', 'team_member', 'Event Coordinator')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role, title = EXCLUDED.title;

-- Seed Meetings
INSERT INTO public.meetings (id, organization_id, title, date, duration, status, summary)
VALUES
  ('meet-001', 'org-svit-podcast', 'Meeting 1: Event Planning Meeting', '2026-11-15T15:00:00Z', '45 mins', 'processed', 'Team aligned on the flagship podcast recording session date, agreed to cap total production budget at ₹15,000, and assigned marketing to Rahul and sponsorship to Yash.'),
  ('meet-002', 'org-svit-podcast', 'Meeting 2: Production Discussion', '2026-11-22T16:00:00Z', '38 mins', 'processed', 'Finalized the live studio panel recording format and selected 4x Shure SM7B microphones with dual Sony A7III 4K cameras as the official equipment standard.'),
  ('meet-003', 'org-svit-podcast', 'Meeting 3: Follow-up Meeting', '2026-11-28T14:00:00Z', '30 mins', 'needs_review', 'Follow-up sync regarding sponsorships. Yash proposed moving the event date to December 20 to accommodate an EdTech sponsor, triggering a contradiction alert against the Nov 15 approved date.')
ON CONFLICT (id) DO UPDATE SET summary = EXCLUDED.summary;

-- Seed Decisions
INSERT INTO public.decisions (id, organization_id, meeting_id, title, value, status, confidence, category, rationale, decided_at)
VALUES
  ('dec-101', 'org-svit-podcast', 'meet-001', 'Annual Flagship Event Date', 'December 15, 2026', 'approved', 0.98, 'schedule', 'Unanimously approved in Meeting 1 to secure auditorium booking.', '2026-11-15T15:20:00Z'),
  ('dec-102', 'org-svit-podcast', 'meet-001', 'Total Event Budget Cap', '₹15,000 INR', 'approved', 0.95, 'budget', 'Approved based on student council treasury balance.', '2026-11-15T15:35:00Z'),
  ('dec-103', 'org-svit-podcast', 'meet-001', 'Marketing Campaign Lead', 'Rahul Sharma', 'approved', 1.0, 'team', 'Rahul volunteered and was affirmed as marketing lead.', '2026-11-15T15:40:00Z'),
  ('dec-104', 'org-svit-podcast', 'meet-001', 'Sponsorship Outreach Lead', 'Yash Mehta', 'approved', 1.0, 'team', 'Yash assigned to lead outbound corporate sponsor outreach.', '2026-11-15T15:42:00Z'),
  ('dec-105', 'org-svit-podcast', 'meet-002', 'Episode Format Selection', 'Live Interactive Panel (4 Speakers)', 'approved', 0.94, 'production', 'Chosen to maximize audience engagement.', '2026-11-22T16:15:00Z'),
  ('dec-106', 'org-svit-podcast', 'meet-002', 'Studio Tech Configuration', '4x Shure SM7B + 2x Sony A7III 4K', 'approved', 0.96, 'tech', 'Selected to ensure broadcast quality 4K audio/video.', '2026-11-22T16:28:00Z'),
  ('dec-107', 'org-svit-podcast', 'meet-003', 'Event Date Revision (Proposed)', 'December 20, 2026', 'proposed', 0.88, 'schedule', 'Yash proposed moving date back by 5 days for sponsor alignment.', '2026-11-28T14:18:00Z')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;

-- Seed Decision Conflict (Signature Demonstration Feature)
INSERT INTO public.decision_conflicts (id, organization_id, new_meeting_id, previous_decision_id, proposed_value, previous_value, conflict_reason, impact, status, resolution_notes)
VALUES
  ('conf-001', 'org-svit-podcast', 'meet-003', 'dec-101', 'December 20, 2026', 'December 15, 2026', 'Yash proposed moving the event date to December 20 to secure an EdTech sponsorship, conflicting with the previously approved December 15 date.', 'Impacts auditorium booking contract, flyer release timelines, and exam week schedule overlap for student participants.', 'pending', 'Awaiting administrative ratification from Organization Admin (Yug Patel).')
ON CONFLICT (id) DO UPDATE SET conflict_reason = EXCLUDED.conflict_reason;

-- Seed Tasks
INSERT INTO public.tasks (id, organization_id, meeting_id, decision_id, title, description, assignee_name, assignee_role, deadline, priority, status)
VALUES
  ('task-201', 'org-svit-podcast', 'meet-001', 'dec-103', 'Create and publish official event poster', 'Design Instagram square and printed A3 posters citing Dec 15 date.', 'Rahul Sharma', 'Marketing Lead', '2026-12-01', 'high', 'completed'),
  ('task-202', 'org-svit-podcast', 'meet-001', 'dec-104', 'Contact 5 local sponsors with sponsorship pitch', 'Deliver pitch decks to target technology and education sponsors.', 'Yash Mehta', 'Sponsorship Lead', '2026-12-05', 'urgent', 'in_progress'),
  ('task-203', 'org-svit-podcast', 'meet-002', 'dec-106', 'Inspect SM7B microphone inventory & cables', 'Check audio interface phantom power and 4x XLR cable lengths.', 'Yug Patel', 'Production Head', '2026-12-08', 'medium', 'todo'),
  ('task-204', 'org-svit-podcast', 'meet-002', 'dec-105', 'Finalize speaker rundown & time blocks', 'Draft segment schedule for the 4 interactive panelists.', 'Priya Nair', 'Event Coordinator', '2026-12-10', 'high', 'in_progress')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- Seed Organizational Memories
INSERT INTO public.organizational_memories (id, organization_id, meeting_id, category, content, tags)
VALUES
  ('mem-01', 'org-svit-podcast', 'meet-001', 'schedule', 'Event officially confirmed for December 15, 2026 in the SVIT Main Auditorium.', ARRAY['event_date', 'venue', 'auditorium']),
  ('mem-02', 'org-svit-podcast', 'meet-001', 'budget', 'Total event operational expenditure is strictly capped at ₹15,000 INR from treasury funds.', ARRAY['budget', 'treasury', 'finance']),
  ('mem-03', 'org-svit-podcast', 'meet-002', 'format', 'Recording structure is a Live Interactive Panel featuring 4 invited collegiate speakers.', ARRAY['format', 'panel', 'speakers']),
  ('mem-04', 'org-svit-podcast', 'meet-002', 'equipment', 'Camera and audio rig consists of dual Sony A7III 4K cameras and 4 Shure SM7B vocal mics.', ARRAY['tech', 'equipment', 'camera', 'audio'])
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- Seed Execution Risks
INSERT INTO public.execution_risks (id, organization_id, risk_level, title, reason, affected_task_ids, potential_impact, recommended_action, is_resolved)
VALUES
  ('risk-001', 'org-svit-podcast', 'HIGH', 'Date Conflict Blocks Marketing & Venue Booking', 'Proposed shift from Dec 15 to Dec 20 creates uncertainty for posters and venue agreements.', ARRAY['task-201', 'task-202'], 'May incur cancellation fee at auditorium and delays marketing outreach by 5 days.', 'Admin must ratify or reject the date change in Meeting 3 Triage.', false)
ON CONFLICT (id) DO UPDATE SET risk_level = EXCLUDED.risk_level;

-- Seed Audit Logs (using jsonb_build_object to guarantee 100% valid JSON syntax without character escape issues)
INSERT INTO public.audit_logs (id, organization_id, actor_id, actor_name, actor_role, action, entity_type, entity_id, metadata)
VALUES
  ('audit-001', 'org-svit-podcast', 'usr-yug-01', 'Yug Patel', 'org_admin', 'DECISION_APPROVED', 'decision', 'dec-101', jsonb_build_object('title', 'Annual Flagship Event Date', 'value', 'December 15, 2026')),
  ('audit-002', 'org-svit-podcast', 'usr-yug-01', 'Yug Patel', 'org_admin', 'ROLE_ASSIGNED', 'member', 'mem-002', jsonb_build_object('role', 'team_leader', 'title', 'Marketing Lead')),
  ('audit-003', 'org-svit-podcast', 'usr-yash-03', 'Yash Mehta', 'team_leader', 'CONFLICT_SUBMITTED', 'conflict', 'conf-001', jsonb_build_object('proposedValue', 'December 20, 2026', 'previousValue', 'December 15, 2026'))
ON CONFLICT (id) DO UPDATE SET action = EXCLUDED.action;
