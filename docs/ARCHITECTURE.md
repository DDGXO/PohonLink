# ARCHITECTURE.md - Pohonlink

> System design, data flow, component structure, and database schema.

---

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────>│  Next.js     │────>│  Supabase   │
│  (Client)   │<────│  (Server)    │<────│  (PG+Auth)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

- **Next.js**: App Router with Server Components for public pages, Client Components for dashboard interactivity
- **Supabase**: PostgreSQL database, Auth, Storage, and RPC functions
- **Beacon API**: Client-side fire-and-forget tracking (no server round-trip blocking)

## Data Flow

### Public Profile Visit
1. User visits `/@username`
2. Server Component queries Supabase for profile + active links
3. Page renders server-side (fast TTFB)
4. Client sends pageview beacon to `/api/track-view`
5. On link click: client sends click beacon to `/api/track-click`, then redirects instantly

### Dashboard
1. User logs in via Supabase Auth
2. Middleware refreshes session, protects `/dashboard/*` and `/admin/*`
3. Dashboard pages use Server Components for data fetching
4. Link CRUD uses Server Actions or API routes

## Folder Structure

```
/
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx
    dashboard/page.tsx
    links/page.tsx
    appearance/page.tsx
    analytics/page.tsx
    settings/page.tsx
  (admin)/
    layout.tsx
    admin/
      page.tsx
      users/page.tsx
  @[username]/
    page.tsx
  api/
    track-click/route.ts
    track-view/route.ts
  globals.css
  layout.tsx
components/
  ui/
  dashboard/
    link-card.tsx
    link-editor.tsx
    sortable-link-list.tsx
  profile/
    profile-page.tsx
    link-button.tsx
    profile-header.tsx
  analytics/
    stats-card.tsx
    clicks-chart.tsx
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
  db/
    queries.ts
  analytics.ts
  utils.ts
types/
  database.ts
middleware.ts
```

## Database Schema

### Enums

```sql
create type user_role as enum ('user', 'vip', 'admin');
create type link_type as enum ('link', 'heading', 'text', 'spacer');
create type event_type as enum ('pageview', 'click');
```

### Table: profiles

```sql
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  username      text unique not null,
  display_name  text,
  bio           text,
  avatar_url    text,
  bg_url        text,
  role          user_role default 'user' not null,
  is_blocked    boolean default false not null,
  theme_config  jsonb not null default '{
    "preset": "default",
    "bg_type": "color",
    "bg_value": "#050505",
    "card_bg": "#111111",
    "text_color": "#f0ece4",
    "btn_radius": "4px",
    "btn_style": "solid",
    "font": "DM Sans"
  }'::jsonb,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);
```

### Table: links

```sql
create table public.links (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  type        link_type default 'link' not null,
  title       text,
  url         text,
  icon        text,
  sort_order  int default 0 not null,
  is_pinned   boolean default false not null,
  is_active   boolean default true not null,
  click_count bigint default 0 not null,
  custom_css  jsonb default '{}'::jsonb,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);
```

### Table: analytics_events

```sql
create table public.analytics_events (
  id          uuid default uuid_generate_v4() primary key,
  profile_id  uuid references public.profiles(id) on delete cascade not null,
  link_id     uuid references public.links(id) on delete set null,
  event       event_type not null,
  referer     text,
  os          text,
  device      text,
  country     text,
  ip_hash     text,
  created_at  timestamptz default now() not null
);
```

### Indexes

```sql
create index idx_profiles_username on public.profiles(username);
create index idx_links_user_order  on public.links(user_id, is_pinned desc, sort_order asc);
create index idx_links_active      on public.links(user_id, is_active);
create index idx_analytics_profile on public.analytics_events(profile_id, created_at desc);
create index idx_analytics_link    on public.analytics_events(link_id, created_at desc);
```

### RLS Policies

```sql
-- profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable" on public.profiles for select using (true);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = id);

-- links
alter table public.links enable row level security;
create policy "Public links are viewable"  on public.links for select using (true);
create policy "Users can manage own links" on public.links for all using (auth.uid() = user_id);

-- analytics_events
alter table public.analytics_events enable row level security;
create policy "Users can view own analytics" on public.analytics_events for select using (auth.uid() = profile_id);
```

### RPC: Atomic Click Increment

```sql
create or replace function public.track_link_click(
  p_link_id    uuid,
  p_profile_id uuid,
  p_referer    text default null,
  p_os         text default null,
  p_device     text default null,
  p_country    text default null,
  p_ip_hash    text default null
) returns void
language plpgsql security definer as $$
begin
  update public.links
    set click_count = click_count + 1, updated_at = now()
    where id = p_link_id;
  insert into public.analytics_events (profile_id, link_id, event, referer, os, device, country, ip_hash)
  values (p_profile_id, p_link_id, 'click', p_referer, p_os, p_device, p_country, p_ip_hash);
end;
$$;
```

### Triggers

```sql
-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function update_updated_at();
create trigger trg_links_updated_at    before update on public.links    for each row execute function update_updated_at();

-- Auto-create profile after registration
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, 'user_' || substr(new.id::text, 1, 8), coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```
