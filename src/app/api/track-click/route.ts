import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { linkId, profileId } = body;

    if (!linkId || !profileId) {
      return NextResponse.json(
        { status: false, error: 'Missing linkId or profileId' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const referer = request.headers.get('referer') || null;
    const userAgent = request.headers.get('user-agent') || '';

    // Parse OS from user agent
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';

    // Parse device
    let device = 'desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'mobile';
    else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'tablet';

    await supabase.rpc('track_link_click', {
      p_link_id: linkId,
      p_profile_id: profileId,
      p_referer: referer,
      p_os: os,
      p_device: device,
    });

    return NextResponse.json({ status: true, result: { tracked: true } });
  } catch {
    return NextResponse.json(
      { status: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
