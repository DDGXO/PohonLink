'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import {
  isDangerousUrl,
  formatSafeUrl,
  sanitizeSocialLinks,
  validateImageUpload,
} from '@/lib/security';

/**
 * Helper to get authenticated user and verify they are not blocked.
 */
async function getAuthSession() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { supabase, user: null, profile: null, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_blocked')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { supabase, user: null, profile: null, error: 'Profil tidak ditemukan' };
  }

  if (profile.is_blocked) {
    return { supabase, user: null, profile: null, error: 'Akun Anda telah diblokir' };
  }

  return { supabase, user, profile, error: null };
}

/**
 * Helper to get authenticated admin user and verify admin role + not blocked.
 */
async function getAdminSession() {
  const session = await getAuthSession();
  if (session.error || !session.user || !session.profile) {
    return { ...session, error: session.error || 'Unauthorized' };
  }

  if (session.profile.role !== 'admin') {
    return { ...session, error: 'Unauthorized: Akses khusus admin' };
  }

  return session;
}

// AUTH
export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('display_name') as string;
  const username = formData.get('username') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: displayName, preferred_username: username } },
  });
  if (error) return { error: error.message };
  
  // Jika trigger sudah buat profile, update username-nya
  if (data.user && username) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await adminClient.from('profiles').update({ username }).eq('id', data.user.id);
  }
  
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function updateUsername(formData: FormData) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const username = (formData.get('username') as string).toLowerCase().trim();
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return { error: 'Username hanya boleh huruf kecil, angka, underscore, strip. Min 3, max 30.' };
  }

  const { error } = await session.supabase
    .from('profiles')
    .update({ username })
    .eq('id', session.user.id);

  if (error) return { error: error.code === '23505' ? 'Username sudah dipakai' : error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const session = await getAuthSession();
  if (session.error || !session.user || !session.profile) return { error: session.error };

  const display_name = formData.get('display_name') as string;
  const bio = formData.get('bio') as string;
  let rawSettings: Record<string, unknown> | null = null;
  const settingsStr = formData.get('settings') as string;
  if (settingsStr) {
    try { rawSettings = JSON.parse(settingsStr); } catch {}
  }

  // Whitelist fields to strictly prevent privilege escalation (cannot set role, is_blocked, etc.)
  const updateData: {
    display_name: string | null;
    bio: string | null;
    settings?: Record<string, unknown>;
  } = {
    display_name: display_name?.trim() || null,
    bio: bio?.trim() || null,
  };

  if (rawSettings && typeof rawSettings === 'object') {
    // Privilege escalation prevention: only admin or vip can enable verified badge
    const canVerify = session.profile.role === 'admin' || session.profile.role === 'vip';
    const validShapes = ['circle', 'rounded', 'square'];
    const avatarShape = typeof rawSettings.avatar_shape === 'string' && validShapes.includes(rawSettings.avatar_shape)
      ? rawSettings.avatar_shape as 'circle' | 'rounded' | 'square'
      : 'circle';

    const socialPosition = rawSettings.social_position === 'bottom' ? 'bottom' : 'top';

    updateData.settings = {
      open_links_new_tab: Boolean(rawSettings.open_links_new_tab),
      show_share_button: rawSettings.show_share_button !== false,
      show_verified_badge: canVerify ? Boolean(rawSettings.show_verified_badge) : false,
      hide_username: Boolean(rawSettings.hide_username),
      avatar_shape: avatarShape,
      social_position: socialPosition,
      show_footer: rawSettings.show_footer !== false,
      custom_footer_text: typeof rawSettings.custom_footer_text === 'string' ? rawSettings.custom_footer_text.trim().slice(0, 100) : undefined,
      social_links: sanitizeSocialLinks(rawSettings.social_links as Record<string, string> | undefined),
    };
  }

  const { error } = await session.supabase
    .from('profiles')
    .update(updateData)
    .eq('id', session.user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteOwnAccount() {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminSupabase.auth.admin.deleteUser(session.user.id);
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function createLink(formData: FormData) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const title = formData.get('title') as string;
  const rawUrl = formData.get('url') as string;
  const htmlContent = formData.get('html_content') as string;
  const type = (formData.get('type') as string) || 'link';
  const subtitle = (formData.get('subtitle') as string)?.trim() || undefined;
  const schedule_start = (formData.get('schedule_start') as string)?.trim() || undefined;
  const schedule_end = (formData.get('schedule_end') as string)?.trim() || undefined;
  const is_locked = formData.get('is_locked') === 'true' || formData.get('is_locked') === 'on';
  const lock_type = (formData.get('lock_type') as string) || 'pin';
  const lock_pin = (formData.get('lock_pin') as string)?.trim() || undefined;

  const validTypes = ['link', 'heading', 'text', 'spacer', 'email', 'telephone', 'html', 'spotify', 'youtube', 'apple_music'];
  if (!validTypes.includes(type)) {
    return { error: 'Tipe link tidak valid' };
  }

  // Untuk spacer/heading/html, validasi spesifik
  if (type === 'link' || type === 'email' || type === 'telephone' || type === 'spotify' || type === 'youtube' || type === 'apple_music') {
    if (!title?.trim()) return { error: 'Judul tidak boleh kosong' };
    if (!rawUrl?.trim()) return { error: 'URL tidak boleh kosong' };
  }
  if (type === 'heading' && !title?.trim()) return { error: 'Teks heading tidak boleh kosong' };
  if (type === 'html' && !htmlContent?.trim()) return { error: 'Kode HTML tidak boleh kosong' };

  // XSS on URL Prevention: check dangerous schemes
  if (rawUrl && isDangerousUrl(rawUrl)) {
    return { error: 'URL menggunakan protokol berbahaya yang dilarang' };
  }

  // Get current max sort_order
  const { data: lastLink } = await session.supabase
    .from('links')
    .select('sort_order')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const sort_order = (lastLink?.sort_order ?? -1) + 1;

  let finalUrl = rawUrl?.trim() || null;
  let dbType: 'link' | 'heading' | 'text' | 'spacer' = 'link';
  const customCssObj: Record<string, unknown> = {
    subtitle,
    schedule_start,
    schedule_end,
    is_locked,
    lock_type: is_locked ? lock_type : undefined,
    lock_pin: is_locked ? lock_pin : undefined,
  };

  if (type === 'html') {
    dbType = 'text';
    customCssObj.is_html = true;
    finalUrl = htmlContent?.trim() || null;
  } else if (type === 'spotify' || type === 'youtube' || type === 'apple_music') {
    dbType = 'link';
    customCssObj.embed_type = type;
    finalUrl = formatSafeUrl(finalUrl || '');
  } else if (type === 'link' && finalUrl) {
    dbType = 'link';
    finalUrl = formatSafeUrl(finalUrl);
    if (!finalUrl) return { error: 'URL tidak valid' };
  } else if (type === 'email' && finalUrl) {
    dbType = 'link';
    if (isDangerousUrl(finalUrl)) return { error: 'Email tidak valid' };
    if (!finalUrl.startsWith('mailto:')) finalUrl = `mailto:${finalUrl}`;
  } else if (type === 'telephone' && finalUrl) {
    dbType = 'link';
    if (isDangerousUrl(finalUrl)) return { error: 'Nomor telepon tidak valid' };
    if (!finalUrl.startsWith('tel:')) finalUrl = `tel:${finalUrl}`;
  } else if (type === 'heading' || type === 'text' || type === 'spacer') {
    dbType = type;
  }

  const { error } = await session.supabase.from('links').insert({
    user_id: session.user.id,
    title: title?.trim() || (type === 'html' ? 'Custom HTML' : type),
    url: finalUrl,
    type: dbType,
    custom_css: customCssObj,
    sort_order,
  } as unknown as Database['public']['Tables']['links']['Insert']);

  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateLink(id: string, formData: FormData) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const title = formData.get('title') as string;
  const rawUrl = formData.get('url') as string;
  const htmlContent = formData.get('html_content') as string;
  const subtitle = (formData.get('subtitle') as string)?.trim() || undefined;
  const schedule_start = (formData.get('schedule_start') as string)?.trim() || undefined;
  const schedule_end = (formData.get('schedule_end') as string)?.trim() || undefined;
  const is_locked = formData.get('is_locked') === 'true' || formData.get('is_locked') === 'on';
  const lock_type = (formData.get('lock_type') as string) || 'pin';
  const lock_pin = (formData.get('lock_pin') as string)?.trim() || undefined;

  // IDOR fix: ensure link belongs to user before reading/updating
  const { data: existingLink } = await session.supabase
    .from('links')
    .select('type, custom_css')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (!existingLink) {
    return { error: 'Link tidak ditemukan atau tidak memiliki akses' };
  }

  // XSS on URL Prevention: check dangerous schemes
  if (rawUrl && isDangerousUrl(rawUrl)) {
    return { error: 'URL menggunakan protokol berbahaya yang dilarang' };
  }

  const existingMeta = (existingLink.custom_css as Record<string, unknown> | null) || {};
  const isHtml = existingLink.type === 'text' && existingMeta.is_html;
  let finalUrl = rawUrl?.trim() || null;
  if (isHtml) {
    finalUrl = (htmlContent || rawUrl)?.trim() || null;
  } else if (existingLink.type === 'link' && finalUrl) {
    finalUrl = formatSafeUrl(finalUrl);
    if (!finalUrl) return { error: 'URL tidak valid' };
  } else if (existingLink.type === 'link' && finalUrl && finalUrl.startsWith('mailto:')) {
    if (isDangerousUrl(finalUrl)) return { error: 'Email tidak valid' };
  } else if (existingLink.type === 'link' && finalUrl && finalUrl.startsWith('tel:')) {
    if (isDangerousUrl(finalUrl)) return { error: 'Nomor telepon tidak valid' };
  }

  const updatedCustomCss = {
    ...existingMeta,
    subtitle,
    schedule_start,
    schedule_end,
    is_locked,
    lock_type: is_locked ? lock_type : undefined,
    lock_pin: is_locked ? lock_pin : undefined,
  };

  const { error } = await session.supabase
    .from('links')
    .update({
      title: title?.trim() || null,
      url: finalUrl,
      custom_css: updatedCustomCss,
    } as Database['public']['Tables']['links']['Update'])
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteLink(id: string) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const { error } = await session.supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) return { error: error.message };
  revalidatePath('/links');
  return { success: true };
}

export async function toggleLinkActive(id: string, currentVal: boolean) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  await session.supabase
    .from('links')
    .update({ is_active: !currentVal } as Database['public']['Tables']['links']['Update'])
    .eq('id', id)
    .eq('user_id', session.user.id);

  revalidatePath('/links');
  return { success: true };
}

export async function toggleLinkPinned(id: string, currentVal: boolean) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  await session.supabase
    .from('links')
    .update({ is_pinned: !currentVal } as Database['public']['Tables']['links']['Update'])
    .eq('id', id)
    .eq('user_id', session.user.id);

  revalidatePath('/links');
  return { success: true };
}

export async function updateTheme(themeConfig: object) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const { error } = await session.supabase
    .from('profiles')
    .update({ theme_config: themeConfig } as Database['public']['Tables']['profiles']['Update'])
    .eq('id', session.user.id);

  if (error) return { error: error.message };
  revalidatePath('/appearance');
  return { success: true };
}

// ADMIN ACTIONS
export async function adminBlockUser(userId: string, block: boolean) {
  const session = await getAdminSession();
  if (session.error || !session.user) return { error: session.error };

  // Privilege escalation & self-unblock prevention
  if (userId === session.user.id) {
    return { error: 'Tidak dapat mengubah status blokir akun sendiri' };
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if target user is an admin
  const { data: targetProfile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (targetProfile?.role === 'admin') {
    return { error: 'Tidak dapat memblokir akun Admin' };
  }

  const { error } = await adminSupabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function adminDeleteUser(userId: string) {
  const session = await getAdminSession();
  if (session.error || !session.user) return { error: session.error };

  // Prevent deleting own account via admin route
  if (userId === session.user.id) {
    return { error: 'Gunakan fitur hapus akun sendiri di menu profil' };
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if target user is an admin
  const { data: targetProfile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (targetProfile?.role === 'admin') {
    return { error: 'Tidak dapat menghapus akun Admin' };
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function adminToggleVip(userId: string, isVip: boolean) {
  const session = await getAdminSession();
  if (session.error || !session.user) return { error: session.error };

  // Privilege escalation: user cannot change own role
  if (userId === session.user.id) {
    return { error: 'Tidak dapat mengubah role akun sendiri' };
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminSupabase
    .from('profiles')
    .update({ role: isVip ? 'vip' : 'user' })
    .eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function adminCreateUser(formData: FormData) {
  const session = await getAdminSession();
  if (session.error || !session.user) return { error: session.error };

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const displayName = formData.get('display_name') as string || username;

  if (!email || !password || !username) {
    return { error: 'Email, password, dan username wajib diisi' };
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });

  if (createError) return { error: createError.message };

  if (newUser.user) {
    await adminSupabase.from('profiles').update({
      username,
      display_name: displayName,
    }).eq('id', newUser.user.id);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function reorderLinks(orders: { id: string; sort_order: number }[]) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const promises = orders.map(({ id, sort_order }) =>
    session.supabase
      .from('links')
      .update({ sort_order } as Database['public']['Tables']['links']['Update'])
      .eq('id', id)
      .eq('user_id', session.user.id)
  );

  await Promise.all(promises);
  revalidatePath('/links');
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const file = formData.get('avatar') as File;
  const validation = validateImageUpload(file, 2 * 1024 * 1024);
  if (!validation.valid || !validation.ext) {
    return { error: validation.error || 'File tidak valid' };
  }

  const path = `${session.user.id}/avatar_${Date.now()}.${validation.ext}`;

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await adminSupabase.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type || `image/${validation.ext}`, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrlData } = adminSupabase.storage.from('avatars').getPublicUrl(path);
  const avatar_url = publicUrlData.publicUrl;

  await adminSupabase.from('profiles').update({ avatar_url }).eq('id', session.user.id);

  revalidatePath('/', 'layout');
  return { success: true, avatar_url };
}

export async function removeAvatar() {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await adminSupabase.from('profiles').update({ avatar_url: null }).eq('id', session.user.id);

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function uploadBackground(formData: FormData) {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const file = formData.get('background') as File;
  const validation = validateImageUpload(file, 5 * 1024 * 1024);
  if (!validation.valid || !validation.ext) {
    return { error: validation.error || 'File tidak valid' };
  }

  const path = `${session.user.id}/bg_${Date.now()}.${validation.ext}`;

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await adminSupabase.storage
    .from('backgrounds')
    .upload(path, buffer, { contentType: file.type || `image/${validation.ext}`, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrlData } = adminSupabase.storage.from('backgrounds').getPublicUrl(path);
  const bg_url = publicUrlData.publicUrl;

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('theme_config')
    .eq('id', session.user.id)
    .single();

  const theme_config = { ...(profile?.theme_config as Record<string, unknown> || {}), bg_type: 'image' };

  await adminSupabase.from('profiles').update({ bg_url, theme_config }).eq('id', session.user.id);

  revalidatePath('/', 'layout');
  return { success: true, bg_url };
}

export async function removeBackground() {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('theme_config')
    .eq('id', session.user.id)
    .single();

  const theme_config = { ...(profile?.theme_config as Record<string, unknown> || {}), bg_type: 'color' };

  await adminSupabase.from('profiles').update({ bg_url: null, theme_config }).eq('id', session.user.id);

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function exportUserData() {
  const session = await getAuthSession();
  if (session.error || !session.user) return { error: session.error };

  const { data: profile } = await session.supabase.from('profiles').select('*').eq('id', session.user.id).single();
  const { data: links } = await session.supabase.from('links').select('*').eq('user_id', session.user.id).order('sort_order', { ascending: true });

  return {
    success: true,
    data: {
      version: '1.0',
      exported_at: new Date().toISOString(),
      profile,
      links: links || [],
    },
  };
}

export async function importUserData(payload: { profile?: Record<string, unknown>; links?: Record<string, unknown>[] }) {
  const session = await getAuthSession();
  if (session.error || !session.user || !session.profile) return { error: session.error };

  if (payload.profile) {
    const { display_name, bio, theme_config, settings } = payload.profile as {
      display_name?: string;
      bio?: string;
      theme_config?: Database['public']['Tables']['profiles']['Update']['theme_config'];
      settings?: Record<string, unknown>;
    };
    const canVerify = session.profile.role === 'admin' || session.profile.role === 'vip';

    const validShapes = ['circle', 'rounded', 'square'];
    const avatarShape = typeof settings?.avatar_shape === 'string' && validShapes.includes(settings.avatar_shape)
      ? settings.avatar_shape as 'circle' | 'rounded' | 'square'
      : 'circle';

    const cleanSettings = settings && typeof settings === 'object' ? {
      open_links_new_tab: Boolean(settings.open_links_new_tab),
      show_share_button: settings.show_share_button !== false,
      show_verified_badge: canVerify ? Boolean(settings.show_verified_badge) : false,
      hide_username: Boolean(settings.hide_username),
      avatar_shape: avatarShape,
      social_position: settings.social_position === 'bottom' ? 'bottom' : 'top',
      show_footer: settings.show_footer !== false,
      custom_footer_text: typeof settings.custom_footer_text === 'string' ? settings.custom_footer_text.trim().slice(0, 100) : undefined,
      social_links: sanitizeSocialLinks(settings.social_links as Record<string, string> | undefined),
    } : undefined;

    // Strict whitelist: role and is_blocked are NEVER updated here
    await session.supabase.from('profiles').update({
      display_name: typeof display_name === 'string' ? display_name.trim() : null,
      bio: typeof bio === 'string' ? bio.trim() : null,
      theme_config: theme_config && typeof theme_config === 'object' ? theme_config : undefined,
      settings: cleanSettings as Database['public']['Tables']['profiles']['Update']['settings'],
    }).eq('id', session.user.id);
  }

  if (Array.isArray(payload.links) && payload.links.length > 0) {
    // Delete existing links first
    await session.supabase.from('links').delete().eq('user_id', session.user.id);

    const validTypes = ['link', 'heading', 'text', 'spacer', 'email', 'telephone', 'html'];
    const inserts = payload.links.slice(0, 100).map((l, index) => {
      const linkType = (typeof l.type === 'string' && validTypes.includes(l.type)) ? l.type : 'link';
      let cleanUrl = typeof l.url === 'string' ? l.url.trim() : null;
      let dbType: 'link' | 'heading' | 'text' | 'spacer' = 'link';
      let customCssObj: Record<string, unknown> = {};

      if (linkType === 'html') {
        dbType = 'text';
        customCssObj = { is_html: true };
      } else if (linkType === 'heading' || linkType === 'text' || linkType === 'spacer') {
        dbType = linkType;
      }

      if (cleanUrl && isDangerousUrl(cleanUrl)) {
        cleanUrl = '#';
      } else if (linkType === 'link' && cleanUrl) {
        cleanUrl = formatSafeUrl(cleanUrl) || '#';
      }

      return {
        user_id: session.user.id,
        title: typeof l.title === 'string' ? l.title.trim().slice(0, 200) : 'Link',
        url: cleanUrl,
        type: dbType,
        custom_css: customCssObj,
        icon: typeof l.icon === 'string' ? l.icon.slice(0, 50) : null,
        is_pinned: Boolean(l.is_pinned),
        is_active: l.is_active !== undefined ? Boolean(l.is_active) : true,
        sort_order: typeof l.sort_order === 'number' ? l.sort_order : index,
      };
    });

    if (inserts.length > 0) {
      await session.supabase.from('links').insert(inserts as Database['public']['Tables']['links']['Insert'][]);
    }
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
