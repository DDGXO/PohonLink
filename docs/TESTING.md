# TESTING.md - Pohonlink

> Testing strategy, commands, and coverage targets.

---

## Strategy

- **Unit**: Utility functions (`lib/utils.ts`, `lib/analytics.ts`)
- **Integration**: Database queries (`lib/db/queries.ts`), API routes
- **E2E**: Critical user flows (register, login, link CRUD, public profile)
- **Manual**: Visual regression, theme preview, responsive layout

## Commands

```bash
# Unit + Integration tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Lint
pnpm lint

# Type check
pnpm typecheck

# Build verification
pnpm build
```

## Test Cases (Minimum)

### Auth
- Register creates profile via trigger
- Login with valid credentials succeeds
- Login with invalid credentials fails
- Protected routes redirect when unauthenticated
- Logout clears session

### Links
- Add link saves to database
- Edit link updates correctly
- Delete link removes from database
- Drag-and-drop updates sort_order
- Pin/unpin toggles is_pinned
- Active/inactive toggles is_active

### Public Profile
- Valid username renders profile
- Invalid username returns 404
- Blocked profile returns 404
- Only active links displayed
- Pageview tracked on visit
- Click tracked before redirect

### Analytics
- Pageview count accurate
- Click count accurate per link
- OS breakdown populated
- Referrer breakdown populated

## Verification Standard

Every feature must be tested with **2 different inputs** to confirm dynamic behavior (not mock/static output). HTTP 200 is not proof of correctness.

## Coverage Target

- Utils: 90%+
- API routes: 80%+
- Components: Manual verification
