# ADR-001: Tech Stack Selection

> Status: Accepted
> Date: 2026-09-02

## Context

Pohonlink needs a modern web stack for a biolink SaaS platform. Requirements: fast public pages, real-time analytics, auth, file storage, and easy deployment.

## Decision

- **Next.js 14+ (App Router)**: Server Components for fast public pages, API routes for tracking endpoints
- **Supabase**: PostgreSQL + Auth + Storage + RPC in one platform
- **Tailwind CSS v3 + shadcn/ui**: Rapid UI with full control over components
- **TypeScript strict**: Type safety across the entire codebase
- **Vercel**: Serverless deployment, zero config

## Alternatives Considered

| Option | Rejected Because |
| :--- | :--- |
| Remix | Smaller ecosystem, less community support |
| Nuxt (Vue) | Team preference for React ecosystem |
| Firebase | Vendor lock-in, no SQL flexibility, limited RLS |
| Prisma ORM | Unnecessary abstraction for Supabase-managed DB |
| Docker self-host | Overhead for a serverless-first app |

## Consequences

- Server Components enable fast public page rendering
- Supabase manages DB, auth, and storage (less infrastructure to maintain)
- Vercel handles deployment and scaling automatically
- shadcn/ui gives full component ownership (no dependency lock-in)
