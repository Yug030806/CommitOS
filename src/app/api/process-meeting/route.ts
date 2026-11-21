import { NextRequest, NextResponse } from 'next/server';
import { analyzeMeetingWithGemini, detectConflictsWithGemini } from '@/lib/gemini';
import { Meeting, Decision, Task, TranscriptItem, AppRole } from '@/lib/types';
import { RBAC } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      transcript = '',
      title = 'New Strategy Meeting',
      date = new Date().toISOString(),
      historicalDecisions = [],
      apiKey,
      model = 'gemini-1.5-flash',
      actorRole,
      organizationId = 'org-svit-podcast',
    } = body as {
      transcript?: string;
      title?: string;
      date?: string;
      historicalDecisions?: any[];
      apiKey?: string;
      model?: string;
      actorRole?: AppRole;
      organizationId?: string;
    };

    // SERVER-SIDE RBAC ENFORCEMENT: AI agents and upload requests cannot bypass permissions
    if (actorRole && !RBAC.canUploadMeetings(actorRole)) {
      return NextResponse.json(
        {
          error: 'Security Violation: Unauthorized Meeting Upload.',
          reason: 'Team Members have read-only access to organizational meetings. Only Organization Admins and Team Leaders can upload and process meetings.',
        },
        { status: 403 }
      );
    }

    if (!transcript.trim()) {
      return NextResponse.json({ error: 'Transcript content is required.' }, { status: 400 });
    }

    // Step 1: Agent 1 - Meeting Intelligence Extraction
    const { result: analysis, isLiveAI } = await analyzeMeetingWithGemini(transcript, apiKey, model);

    const meetingId = `meet-${Date.now()}`;
    const meetingTitle = title || analysis.meeting_title || 'Executive Meeting';

    // Step 2: Extract Decisions with IDs
    const decisions: Decision[] = analysis.decisions.map((d, index) => ({
      id: `dec-${Date.now()}-${index}`,
      organizationId,
      meetingId,
      meetingTitle,
      title: d.title,
      value: d.value,
      status: d.status,
      confidence: d.confidence,
      category: d.category,
      rationale: d.rationale,
      decidedAt: date,
    }));

    // Step 3: Agent 3 - Conflict Detection against Organizational Memory
    const { conflicts: detectedConflicts } = await detectConflictsWithGemini(
      decisions.map((d) => ({ title: d.title, value: d.value, category: d.category })),
      historicalDecisions,
      apiKey
    );

    // Enforce proper meeting links on detected conflicts
    const enrichedConflicts = detectedConflicts.map((c) => ({
      ...c,
      newMeetingId: meetingId,
      newMeetingTitle: meetingTitle,
    }));

    // Step 4: Agent 4 - Task Generation
    const tasks: Task[] = analysis.action_items.map((item, index) => ({
      id: `task-${Date.now()}-${index}`,
      organizationId: 'org-svit-podcast',
      meetingId,
      meetingTitle,
      title: item.task,
      description: item.description || `Extracted from ${meetingTitle}`,
      assigneeName: item.owner || 'Unassigned',
      assigneeRole: 'Team Member',
      deadline: item.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: item.priority || 'medium',
      status: 'todo',
      createdAt: new Date().toISOString(),
    }));

    // Step 5: Format transcript lines
    const transcriptLines: TranscriptItem[] = transcript
      .split('\n')
      .filter((l: string) => l.trim().length > 0)
      .map((line: string, idx: number) => {
        const parts = line.split(':');
        let speaker = 'Speaker';
        let text = line;
        if (parts.length >= 2) {
          speaker = parts[0].trim();
          text = parts.slice(1).join(':').trim();
        }
        return {
          id: `t-${idx}`,
          speaker,
          text,
          timestamp: `0${Math.floor(idx / 2)}:${((idx * 17) % 60).toString().padStart(2, '0')}`,
        };
      });

    const processedMeeting: Meeting = {
      id: meetingId,
      organizationId: 'org-svit-podcast',
      title: meetingTitle,
      date,
      duration: `${Math.max(15, Math.min(60, transcriptLines.length * 4))} mins`,
      status: enrichedConflicts.length > 0 ? 'needs_review' : 'processed',
      summary: analysis.summary,
      participants: analysis.participants,
      keyDiscussionPoints: analysis.discussion_points,
      unresolvedQuestions: analysis.unresolved_questions,
      decisions,
      actionItems: tasks,
      transcript: transcriptLines,
      conflictDetected: enrichedConflicts.length > 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      meeting: processedMeeting,
      conflicts: enrichedConflicts,
      isLiveAI,
      analysis,
    });
  } catch (err: any) {
    console.error('Process meeting error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process meeting conversation.' },
      { status: 500 }
    );
  }
}
