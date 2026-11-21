import { NextRequest, NextResponse } from 'next/server';
import { askCommitOSRAG } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, apiKey, memories = [], decisions = [], tasks = [] } = body;

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
