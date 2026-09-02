# CONVENTIONS.md - Pohonlink

> Coding standards, naming conventions, and patterns for this project.

---

## TypeScript

- **Strict mode**: Always `true`. Zero `any` usage.
- **Generated types**: Use Supabase generated types from `types/database.ts`.
- **Interfaces over type aliases** for object shapes (unless union/intersection needed).

## Naming

| Element | Convention | Example |
| :--- | :--- | :--- |
| Files (components) | kebab-case | `link-card.tsx` |
| Files (utilities) | camelCase | `analytics.ts` |
| Files (routes) | Next.js convention | `page.tsx`, `layout.tsx`, `route.ts` |
| Components | PascalCase | `LinkCard`, `ProfilePage` |
| Functions | camelCase | `trackLinkClick`, `formatNumber` |
| Variables | camelCase | `clickCount`, `themeConfig` |
| Constants | UPPER_SNAKE | `MAX_LINKS`, `DEFAULT_THEME` |
| Database tables | snake_case | `analytics_events` |
| CSS variables | kebab-case with `--` prefix | `--bg`, `--card`, `--accent` |
| Environment vars | UPPER_SNAKE with prefix | `NEXT_PUBLIC_SUPABASE_URL` |

## File Organization

- `components/ui/` - shadcn/ui primitives (do not edit manually)
- `components/dashboard/` - Dashboard-specific components
- `components/profile/` - Public profile components
- `components/analytics/` - Analytics display components
- `lib/` - Shared utilities, DB queries, Supabase clients
- `types/` - TypeScript type definitions
- `app/` - Next.js App Router pages and API routes

## Component Patterns

- Server Components by default. Add `'use client'` only when interactivity is needed.
- Extract database queries to `lib/db/queries.ts`. Never inline queries in components.
- Use `cn()` utility from `lib/utils.ts` for conditional classnames.
- All interactive elements require `aria-label`.

## Error Handling

- Server Components: wrap in error boundaries.
- API routes: return `{ status: true, result: data }` or `{ status: false, error: message }`.
- Never return HTTP 200 for errors.
- Never expose internal error details to the client.

## Styling

- Follow Pohonlink design system (see DESIGN.md).
- Dark theme by default. No heavy gradients.
- Sharp corners (4px) for buttons/inputs. 12px max for cards.
- Responsive grid wrapping. No horizontal sliders.

## Git

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`
- No auto-commit or auto-push. User controls git workflow.
- Branch naming: `feat/feature-name`, `fix/bug-name`
