import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { linkId, profileId, referer: clientReferer, search: clientSearch } = body;

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

    // IP & IP Hash
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1');
    const ipHash = crypto.createHash('sha256').update(`${ip}-pohon`).digest('hex').substring(0, 16);

    // Country Geolocation
    const country =
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('x-country') ||
      'ID';

    // Referer & UTM query
    let referer = clientReferer || request.headers.get('referer') || null;
    if (clientSearch && clientSearch.length > 1) {
      if (referer) {
        referer = referer.includes('?') ? `${referer}&${clientSearch.replace(/^\?/, '')}` : `${referer}${clientSearch}`;
      } else {
        referer = clientSearch;
      }
    }

    // Try RPC first
    const { error: rpcError } = await supabase.rpc('track_link_click', {
      p_link_id: linkId,
      p_profile_id: profileId,
      p_referer: referer,
      p_os: os,
      p_device: device,
      p_country: country,
      p_ip_hash: ipHash,
    });

    // If RPC is missing or fails, update directly
    if (rpcError) {
      // 1. Insert analytics event
      await supabase.from('analytics_events').insert({
        profile_id: profileId,
        link_id: linkId,
        event: 'click',
        referer,
        os,
        device,
        country,
        ip_hash: ipHash,
      });

      // 2. Increment link click_count
      const { data: currentLink } = await supabase
        .from('links')
        .select('click_count')
        .eq('id', linkId)
        .single();

      if (currentLink) {
        await supabase
          .from('links')
          .update({ click_count: (currentLink.click_count || 0) + 1 })
          .eq('id', linkId);
      }
    }

    return NextResponse.json({ status: true, result: { tracked: true } });
  } catch {
    return NextResponse.json(
      { status: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
