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

export const getActiveLinks = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data as Link[];
});

export const getAllLinks = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data as Link[];
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

  if (error) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
    const os = row.os || 'unknown';
    counts[os] = (counts[os] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
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
