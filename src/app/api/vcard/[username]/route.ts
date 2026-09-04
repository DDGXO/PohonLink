import { NextRequest, NextResponse } from 'next/server';
import { getProfileByUsername } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  let { username } = await params;
  if (username.startsWith('%40')) username = username.slice(3);
  if (username.startsWith('@')) username = username.slice(1);

  const profile = await getProfileByUsername(username);
  if (!profile) {
    return new NextResponse('Profile Not Found', { status: 404 });
  }

  const vcard = profile.settings?.vcard;
  const fullName = vcard?.full_name || profile.display_name || `@${profile.username}`;
  const phone = vcard?.phone || '';
  const email = vcard?.email || '';
  const company = vcard?.company || '';
  const jobTitle = vcard?.job_title || '';
  const note = vcard?.note || profile.bio || '';
  const website = `https://phn.my.id/@${profile.username}`;

  // Build standard vCard 3.0 string
  const vcfLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `N:${fullName};;;;`,
    company ? `ORG:${company}` : '',
    jobTitle ? `TITLE:${jobTitle}` : '',
    phone ? `TEL;TYPE=CELL,VOICE:${phone}` : '',
    email ? `EMAIL;TYPE=PREF,INTERNET:${email}` : '',
    `URL:${website}`,
    note ? `NOTE:${note.replace(/\n/g, ' ')}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');

  return new NextResponse(vcfLines, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.username}-contact.vcf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
