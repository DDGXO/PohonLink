# DECISIONS.md - Pohonlink

> Log of locked architectural decisions. Do not reopen without explicit user approval.

---

## D001: Tech Stack Selection

- **Date**: 2026-09-02
- **Decision**: Next.js 14+ (App Router) + Supabase + Tailwind + shadcn/ui
- **Rationale**: Server Components for fast public pages, Supabase for managed PostgreSQL/Auth/Storage, shadcn/ui for rapid UI development with full control.
- **Alternatives Considered**: Remix (less ecosystem), Nuxt (not JS stack preference), Firebase (vendor lock-in, no SQL flexibility).

## D002: Click Tracking via Beacon API

- **Date**: 2026-09-02
- **Decision**: Use `navigator.sendBeacon()` for click tracking before redirect, with Supabase RPC for atomic click increment.
- **Rationale**: Zero-delay redirect for users, fire-and-forget tracking, no third-party analytics dependencies.
- **Trade-off**: Beacon can be dropped in rare cases (page unload race), but acceptable for analytics accuracy vs UX priority.

## D003: No Third-Party Analytics

- **Date**: 2026-09-02
- **Decision**: All analytics stored in Supabase `analytics_events` table. No Google Analytics, Mixpanel, or similar.
- **Rationale**: Privacy-first, full data ownership, no external dependencies, GDPR-friendly for Indonesian market.

## D004: Self-Hosted Deployment

- **Date**: 2026-09-02
- **Decision**: Deploy via Docker (Node 20 Alpine) to self-hosted server. No Vercel/Netlify.
- **Rationale**: Full control over infrastructure, cost predictability, DGXO ecosystem standards.

## D005: Email/Password Auth Only (v1)

- **Date**: 2026-09-02
- **Decision**: No OAuth (Google, GitHub) in v1. Email + password via Supabase Auth.
- **Rationale**: Simpler implementation, faster v1 launch, OAuth adds complexity and third-party dependency.

## D006: Database Schema via SQL Migrations

- **Date**: 2026-09-02
- **Decision**: Direct SQL schema execution in Supabase SQL Editor. No ORM (Prisma/Drizzle).
- **Rationale**: Full PostgreSQL feature access (RLS, triggers, RPC), no ORM overhead, schema lives in docs for transparency.

## D007: Branding Name "Pohonlink"

- **Date**: 2026-09-02
- **Decision**: Product name is "Pohonlink". Tree/nature theme for biolink concept.
- **Rationale**: Unique, locally resonant (Indonesian), memorable, fits the "link tree" metaphor.
