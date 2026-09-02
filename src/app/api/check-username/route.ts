import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.toLowerCase().trim();

  if (!username) return NextResponse.json({ available: false });
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) return NextResponse.json({ available: false, error: 'Format tidak valid' });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase.from('profiles').select('id').eq('username', username).single();
  return NextResponse.json({ available: !data });
}
