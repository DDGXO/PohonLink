# TASK.md - Pohonlink

> Task board and progress tracker. Update this file as tasks are completed.

---

## Phase 1: Foundation

- [ ] Initialize Next.js project with TypeScript + App Router
- [ ] Install and configure Tailwind CSS v3
- [ ] Install and configure shadcn/ui
- [ ] Install Supabase JS client (`@supabase/supabase-js`)
- [ ] Create `.env.local` and `.env.example`
- [ ] Create `lib/supabase/client.ts` (browser client)
- [ ] Create `lib/supabase/server.ts` (server client)
- [ ] Create `lib/supabase/middleware.ts` (session refresh)
- [ ] Create `middleware.ts` (auth + protected routes)
- [ ] Create `types/database.ts` (Supabase generated types)
- [ ] Create `lib/utils.ts` (cn, formatNumber)
- [ ] Create `lib/db/queries.ts` (database query layer)
- [ ] Create `lib/analytics.ts` (sendBeacon wrapper)
- [ ] Create `globals.css` with CSS variables
- [ ] Configure `tailwind.config.ts`
- [ ] Configure `next.config.ts`
- [ ] Run SQL schema in Supabase
- [ ] Create root `layout.tsx`

## Phase 2: Auth & Onboarding

- [ ] Create `(auth)/login/page.tsx`
- [ ] Create `(auth)/register/page.tsx`
- [ ] Create onboarding flow (choose username)
- [ ] Implement protected route redirects
- [ ] Test register + auto-create profile trigger

## Phase 3: Dashboard & Links

- [ ] Create `(dashboard)/layout.tsx` with sidebar
- [ ] Create `(dashboard)/dashboard/page.tsx` (stats overview)
- [ ] Create `(dashboard)/links/page.tsx` (link management)
- [ ] Create `components/dashboard/link-card.tsx`
- [ ] Create `components/dashboard/link-editor.tsx`
- [ ] Create `components/dashboard/sortable-link-list.tsx` (drag-and-drop)
- [ ] Install `@dnd-kit/core`
- [ ] Implement link CRUD operations
- [ ] Implement drag-and-drop reorder
- [ ] Implement pin/unpin toggle
- [ ] Implement active/inactive toggle

## Phase 4: Public Profile

- [ ] Create `@[username]/page.tsx` (Server Component)
- [ ] Create `components/profile/profile-page.tsx`
- [ ] Create `components/profile/link-button.tsx`
- [ ] Create `components/profile/profile-header.tsx`
- [ ] Create `api/track-click/route.ts`
- [ ] Create `api/track-view/route.ts`
- [ ] Implement Beacon API tracking in link-button
- [ ] Implement RPC `track_link_click` call
- [ ] Test 404 for non-existent or blocked profiles

## Phase 5: Appearance

- [ ] Create `(dashboard)/appearance/page.tsx`
- [ ] Implement preset themes (Dark, Light, Gradient)
- [ ] Implement color pickers (bg, card, text)
- [ ] Implement border radius controls
- [ ] Implement font selector
- [ ] Implement background image upload
- [ ] Implement avatar upload
- [ ] Implement real-time preview

## Phase 6: Analytics

- [ ] Create `(dashboard)/analytics/page.tsx`
- [ ] Create `components/analytics/stats-card.tsx`
- [ ] Create `components/analytics/clicks-chart.tsx`
- [ ] Implement total views display
- [ ] Implement clicks per link display
- [ ] Implement OS breakdown
- [ ] Implement referrer breakdown

## Phase 7: Admin

- [ ] Create `(admin)/layout.tsx`
- [ ] Create `(admin)/admin/page.tsx` (admin dashboard)
- [ ] Create `(admin)/admin/users/page.tsx` (user management)
- [ ] Implement user table with pagination
- [ ] Implement block/unblock toggle
- [ ] Implement user deletion
- [ ] Implement impersonation
- [ ] Server-side role check for admin routes

## Phase 8: Polish & Deploy

- [ ] SEO: og:title, og:description, og:image per profile
- [ ] Error boundaries for all Server Components
- [ ] WCAG AA contrast checks
- [ ] Dockerfile (Node 20 Alpine)
- [ ] Final security audit
- [ ] Update all documentation
- [ ] Tag v1.0.0
