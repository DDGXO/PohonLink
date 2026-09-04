import { NextRequest, NextResponse } from 'next/server';
import { generateBioOptions, generateLinkCopyOptions, generateAnalyticsInsights, generateAutoDmTemplates } from '@/lib/ai/groq';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'bio') {
      const { prompt, tone } = body;
      const bios = await generateBioOptions(prompt, tone);
      return NextResponse.json({ success: true, bios });
    }

    if (action === 'link-copy') {
      const { input } = body;
      const copy = await generateLinkCopyOptions(input);
      return NextResponse.json({ success: true, copy });
    }

    if (action === 'insights') {
      const { stats } = body;
      const insights = await generateAnalyticsInsights(stats);
      return NextResponse.json({ success: true, insights });
    }

    if (action === 'auto-dm') {
      const { keyword, linkUrl, topic } = body;
      const templates = await generateAutoDmTemplates(keyword, linkUrl, topic);
      return NextResponse.json({ success: true, templates });
    }

    return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 });
  } catch (err: unknown) {
    console.error('AI API error:', err);
    return NextResponse.json({ error: 'Gagal memproses permintaan AI' }, { status: 500 });
  }
}
