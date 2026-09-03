import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';
import type { User } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  profile: Profile | null;
}

/**
 * Memoized per-request auth & profile loader.
 * React.cache guarantees this runs at most ONCE per server request lifecycle,
 * eliminating redundant HTTPS roundtrips across layout and child pages.
 */
export const getAuthenticatedUser = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile: profile as Profile | null,
  };
});
