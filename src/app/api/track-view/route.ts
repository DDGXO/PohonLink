import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId } = body;
    if (!profileId) return NextResponse.json({ status: false });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const userAgent = request.headers.get('user-agent') || '';
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iOS')) os = 'iOS';

    let device = 'desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'mobile';
    else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'tablet';

    const referer = request.headers.get('referer') || null;

    await supabase.from('analytics_events').insert({
      profile_id: profileId,
      event: 'pageview',
      os,
      device,
      referer,
    });

    return NextResponse.json({ status: true });
  } catch {
    return NextResponse.json({ status: false });
  }
}
