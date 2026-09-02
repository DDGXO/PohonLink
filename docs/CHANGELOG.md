# CHANGELOG.md - Pohonlink

> Release history. Follows Conventional Commits format.

---

## [0.2.0] - 2026-09-02

### Added
- Authentication flow (register, login, logout, forgot/reset password)
- Profile creation via Supabase trigger on registration
- Dashboard with stats overview (total links, clicks, views)
- Link management: CRUD, drag-and-drop reorder, pin/unpin, active/inactive
- Public profile page with theme customization (colors, fonts, radius)
- Appearance settings with real-time preview
- Avatar & background image upload to Supabase Storage
- Analytics page (pageview count, clicks per link, OS breakdown)
- Beacon API tracking (pageview + click with zero-delay redirect)
- Admin panel (user list, block/unblock, delete, VIP toggle, create user)
- Username availability check API
- `/api/ping` keyless healthcheck
- SEO files (robots.txt, sitemap.xml, manifest.json, security.txt)

### Changed
- Optimized dashboard navigation: added `loading.tsx`, cached DB queries with React `cache()`, parallel data fetching
- Reduced middleware overhead: public routes now skip Supabase network calls, faster redirects for protected routes
- Consolidated profile fetch to use cached queries, removed duplicate DB reads

### Fixed
- Middleware no longer queries Supabase on every public request (proxy latency reduced)

## [0.1.0] - 2026-09-02

### Added
- Project initialization with Next.js 16 + TypeScript + App Router
- Tailwind CSS + shadcn/ui configuration
- Supabase client setup (browser + server)
- Auth middleware with session refresh
- Database schema (profiles, links, analytics_events)
- RPC function for atomic click tracking
- Auto-create profile trigger on user registration
- Complete folder structure per architecture spec
- All project documentation (docs/)
- Pohonlink branding and design system
- MIT License
