import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Link } from '@/types/database';

export const getProfileByUsername = cache(async (username: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('is_blocked', false)
    .single();

  if (error) return null;
  return data as Profile;
});

export const getProfileById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Profile;
});

function normalizeLink(link: Record<string, unknown>): Link {
  let type = link.type as Link['type'];
  const customCss = link.custom_css as Record<string, unknown> | null;
  const url = typeof link.url === 'string' ? link.url : '';

  if (customCss?.is_lead_form) {
    type = 'lead_form';
  } else if (customCss?.is_html) {
    type = 'html';
  } else if (type === 'link' && url.startsWith('mailto:')) {
    type = 'email';
  } else if (type === 'link' && url.startsWith('tel:')) {
    type = 'telephone';
  }

  return {
    ...link,
    type,
  } as unknown as Link;
}

export const getActiveLinks = cache(async (userId: string, smartSort = false) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  const now = Date.now();
  const filtered = data
    .map(normalizeLink)
    .filter(link => {
      const meta = link.custom_css as Record<string, unknown> | null;
      if (meta?.is_product) return false;
      if (meta?.is_archived) return false;
      if (meta?.schedule_start) {
        const st = new Date(meta.schedule_start as string).getTime();
        if (!isNaN(st) && now < st) return false;
      }
      if (meta?.schedule_end) {
        const et = new Date(meta.schedule_end as string).getTime();
        if (!isNaN(et) && now > et) return false;
      }
      return true;
    });

  if (smartSort) {
    return filtered.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (b.click_count !== a.click_count) return b.click_count - a.click_count;
      return a.sort_order - b.sort_order;
    });
  }

  return filtered;
});

export const getActiveProducts = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data
    .map(normalizeLink)
    .filter(link => {
      const meta = link.custom_css as Record<string, unknown> | null;
      return Boolean(meta?.is_product);
    });
});

export const getAllProducts = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data
    .map(normalizeLink)
    .filter(link => {
      const meta = link.custom_css as Record<string, unknown> | null;
      return Boolean(meta?.is_product);
    });
});

export const getAllLinks = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data
    .map(normalizeLink)
    .filter(link => {
      const meta = link.custom_css as Record<string, unknown> | null;
      return !meta?.is_product;
    });
});

export const getProfileStats = cache(async (userId: string) => {
  const supabase = await createClient();

  const { count: totalLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: totalViews } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('event', 'pageview');

  const { data: links } = await supabase
    .from('links')
    .select('click_count')
    .eq('user_id', userId);

  const totalClicks = (links as { click_count: number }[] | null)?.reduce(
    (sum, link) => sum + (link.click_count || 0),
    0
  ) ?? 0;

  return {
    totalLinks: totalLinks ?? 0,
    totalViews: totalViews ?? 0,
    totalClicks,
  };
});

export const getUserCount = cache(async () => {
  const supabase = await createClient();
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  return count ?? 0;
});

export const getOsBreakdown = cache(async (profileId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('analytics_events')
    .select('os')
    .eq('profile_id', profileId)
    .eq('event', 'pageview')
    .not('os', 'is', null);

  if (error || !data) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
    const os = row.os || 'Lainnya';
    counts[os] = (counts[os] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
});

export const getDeviceBreakdown = cache(async (profileId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('analytics_events')
    .select('device')
    .eq('profile_id', profileId)
    .eq('event', 'pageview')
    .not('device', 'is', null);

  if (error || !data) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
    const dev = row.device || 'desktop';
    const label = dev === 'mobile' ? '📱 Mobile' : dev === 'tablet' ? '📟 Tablet' : '💻 Desktop';
    counts[label] = (counts[label] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
});

export const getReferrerBreakdown = cache(async (profileId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('analytics_events')
    .select('referer')
    .eq('profile_id', profileId)
    .eq('event', 'pageview');

  if (error || !data) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
    let source = 'Langsung / Direct';
    if (row.referer) {
      const lower = row.referer.toLowerCase();
      if (lower.includes('instagram.com')) source = '📸 Instagram';
      else if (lower.includes('tiktok.com')) source = '🎵 TikTok';
      else if (lower.includes('t.co') || lower.includes('twitter.com') || lower.includes('x.com')) source = '🐦 X / Twitter';
      else if (lower.includes('youtube.com')) source = '▶️ YouTube';
      else if (lower.includes('whatsapp') || lower.includes('wa.me')) source = '💬 WhatsApp';
      else if (lower.includes('facebook.com')) source = '👤 Facebook';
      else if (lower.includes('google.com')) source = '🔍 Google';
      else {
        try {
          source = new URL(row.referer).hostname;
        } catch {
          source = 'Web Lainnya';
        }
      }
    }
    counts[source] = (counts[source] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
});

export const getAnalyticsEvents = cache(async (profileId: string, limit: number = 5000) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
});

export const getPageviewCount = cache(async (profileId: string) => {
  const supabase = await createClient();
  const { count } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('event', 'pageview');
  return count ?? 0;
});

export const getAllUsers = cache(async (page: number = 1, limit: number = 20) => {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { users: [], total: 0 };
  return { users: data as Profile[], total: count ?? 0 };
});

export async function updateProfileSortOrder(
  userId: string,
  linkOrders: { id: string; sort_order: number }[]
) {
  const supabase = await createClient();
  const updates = linkOrders.map((item) =>
    supabase
      .from('links')
      .update({ sort_order: item.sort_order } as never)
      .eq('id', item.id)
      .eq('user_id', userId)
  );

  await Promise.all(updates);
}
