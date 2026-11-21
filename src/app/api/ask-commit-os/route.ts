import { NextRequest, NextResponse } from 'next/server';
import { askCommitOSRAG } from '@/lib/gemini';
import { DEMO_MEMORIES, DEMO_DECISIONS, DEMO_TASKS } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, apiKey } = body;

    let memories = body.memories;
    let decisions = body.decisions;
    let tasks = body.tasks;

    if (!Array.isArray(memories) || memories.length === 0) {
      memories = DEMO_MEMORIES.map((m) => ({
        content: m.content,
        meetingTitle: m.meetingTitle,
        date: m.date,
      }));
    }

    if (!Array.isArray(decisions) || decisions.length === 0) {
      decisions = DEMO_DECISIONS.map((d) => ({
        title: d.title,
        value: d.value,
        meetingTitle: d.meetingTitle,
        decidedAt: d.decidedAt,
      }));
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      tasks = DEMO_TASKS.map((t) => ({
        title: t.title,
        assigneeName: t.assigneeName,
        deadline: t.deadline,
        status: t.status,
      }));
    }

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const { answer, sources, isLiveAI } = await askCommitOSRAG(
      question,
      memories,
      decisions,
      tasks,
      apiKey
    );

    return NextResponse.json({
      success: true,
      answer,
      sources,
      isLiveAI,
    });
  } catch (err: any) {
    console.error('Ask CommitOS error:', err);
    return NextResponse.json({ error: err.message || 'Error querying CommitOS memory.' }, { status: 500 });
  }
}
