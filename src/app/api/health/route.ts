import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = performance.now();

  let dbStatus: 'connected' | 'error' = 'error';
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  // 1. Check Database connection & query latency
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const dbStart = performance.now();
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      dbLatencyMs = Math.round(performance.now() - dbStart);

      if (error) {
        dbStatus = 'error';
        dbError = error.message;
      } else {
        dbStatus = 'connected';
      }
    } catch (err: unknown) {
      dbLatencyMs = Math.round(performance.now() - dbStart);
      dbStatus = 'error';
      dbError = err instanceof Error ? err.message : 'Database ping failed';
    }
  } else {
    dbError = 'Database environment variables not configured';
  }

  // 2. Check AI Engine readiness
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const aiStatus = hasGroqKey ? 'ready' : 'not_configured';

  // 3. System stats
  const totalLatencyMs = Math.round(performance.now() - startTime);
  const isHealthy = dbStatus === 'connected';

  const responseBody = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    latency_ms: totalLatencyMs,
    uptime_seconds: Math.floor(process.uptime()),
    version: '0.5.0',
    environment: process.env.NODE_ENV || 'production',
    services: {
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
      ai: {
        status: aiStatus,
      },
    },
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${totalLatencyMs}ms`,
    },
  });
}
