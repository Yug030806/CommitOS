import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const key = serviceKey || anonKey;

    if (!url || !key) {
      return NextResponse.json({
        configured: false,
        connected: false,
        tablesReady: false,
        message: 'NEXT_PUBLIC_SUPABASE_URL and Supabase keys not set in environment.',
      });
    }

    const supabase = createClient(url, key);

    const tables = [
      'organizations',
      'organization_members',
      'meetings',
      'decisions',
      'decision_conflicts',
      'tasks',
      'audit_logs',
    ];

    const tableStatus: Record<string, { exists: boolean; count?: number; error?: string }> = {};

    for (const table of tables) {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
      if (error) {
        tableStatus[table] = { exists: false, error: error.message };
      } else {
        tableStatus[table] = { exists: true, count: count ?? (data ? data.length : 0) };
      }
    }

    const allExist = Object.values(tableStatus).every((t) => t.exists);

    return NextResponse.json({
      configured: true,
      connected: true,
      url,
      tablesReady: allExist,
      tableStatus,
      message: allExist
        ? 'Supabase PostgreSQL database is connected and active with all tables ready.'
        : 'Supabase project is reachable, but database schema has not been run in the SQL Editor yet.',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        tablesReady: false,
        error: err.message || 'Error connecting to Supabase endpoint.',
      },
      { status: 500 }
    );
  }
}
