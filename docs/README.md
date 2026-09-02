# Pohonlink

> Your single link for everything. A modern biolink platform built for speed.

Pohonlink is a fast, open biolink platform built with Next.js and Supabase. Create your profile, add your links, share one URL everywhere.

## Features

- **Instant Public Profiles**: Server-rendered biolink pages with sub-50ms TTFB
- **Click Analytics**: Track clicks, views, OS, device, and referrer in real-time
- **Theme Customization**: Multiple presets plus full color/font/border control
- **Drag & Drop Links**: Reorder, pin, toggle, and manage your links easily
- **Admin Panel**: Manage users, block/unblock, and impersonate for support
- **Beacon Tracking**: Zero-delay click tracking using the Beacon API

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 14+ (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Icons | Lucide React + Simple Icons |
| Deployment | Docker (Node 20 Alpine) |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A Supabase project

### Installation

```bash
git clone https://github.com/your-org/pohonlink.git
cd pohonlink
pnpm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Fill in your Supabase keys in `.env.local`.

### Database Setup

Run the SQL schema from `docs/ARCHITECTURE.md` in your Supabase SQL Editor.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
pnpm start
```

## Documentation

All project documentation lives in the `docs/` folder:

- [Planning](docs/PLANNING.md) - Vision, architecture decisions, and design
- [Architecture](docs/ARCHITECTURE.md) - System design, data flow, and database schema
- [Task Board](docs/TASK.md) - Current tasks and progress tracker
- [Roadmap](docs/ROADMAP.md) - Phases and milestones
- [Design System](docs/DESIGN.md) - Branding, colors, typography, components
- [Conventions](docs/CONVENTIONS.md) - Coding standards and patterns
- [Testing](docs/TESTING.md) - Testing strategy and commands
- [Security](docs/SECURITY.md) - Security policies and checklist
- [Deployment](docs/DEPLOYMENT.md) - Deploy guide and runbook
- [Scope](docs/SCOPE.md) - What's in and what's deferred
- [Decisions](docs/decisions/) - Architecture Decision Records

## License

Proprietary. All rights reserved.
