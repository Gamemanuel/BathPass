# HCB — Fiscal Sponsorship Platform

A modern fiscal sponsorship platform built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. Inspired by [Hack Club Bank (HCB)](https://hackclub.com/hcb/).

## Features

- **Organizations** — Create and manage multiple fiscal-sponsored organizations
- **Transactions** — Track income, expenses, transfers, and reimbursements with full audit trails
- **Cards** — Issue and manage virtual/physical Visa cards; freeze/unfreeze in one click
- **Admin panel** — Platform-wide overview of organizations, users, and pending transactions
- **Email login codes** — Stub for a passwordless email login flow (Supabase OAuth is the primary auth)
- **CSV export** — Export transaction history to CSV

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Auth | Supabase (OAuth — GitHub/Discord) |
| Database | Prisma + PostgreSQL |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Validation | Zod |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── hcb/
│   │   ├── layout.tsx             # HCB shell (sidebar + auth guard)
│   │   ├── dashboard/page.tsx     # Dashboard with stats & recent activity
│   │   ├── organizations/         # Org list + detail pages
│   │   ├── transactions/page.tsx  # Transaction history + filters + CSV export
│   │   ├── cards/page.tsx         # Card management (freeze/unfreeze/cancel)
│   │   ├── admin/page.tsx         # Admin overview
│   │   └── settings/page.tsx      # User profile & notification settings
│   └── api/hcb/                   # REST API routes (demo data)
├── components/hcb/
│   ├── sidebar.tsx                # Responsive navigation sidebar
│   ├── stats-card.tsx             # KPI card component
│   └── transaction-row.tsx        # Transaction table row
└── lib/
    ├── types.ts                   # TypeScript interfaces & enums
    ├── demo-data.ts               # Mock data for development
    ├── db.ts                      # Prisma client singleton
    └── auth.ts                    # Email login-code helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (or skip for demo mode)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@host:5432/dbname
ADMIN_EMAIL=admin@yourorg.com   # Optional: grants admin access
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Demo mode**: If Supabase env vars are not set, the `/hcb/*` pages still work with mock data. Auth redirects are bypassed gracefully.

### Database (optional)

```bash
# Generate Prisma client
npx prisma generate

# Apply schema to your database
npx prisma migrate dev
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | BathPass teacher-key + OAuth login |
| `/dashboard` | Original BathPass dashboard |
| `/hcb/dashboard` | HCB main dashboard |
| `/hcb/organizations` | Organization list |
| `/hcb/organizations/[id]` | Organization detail (transactions, members, cards) |
| `/hcb/transactions` | Transaction history with filters |
| `/hcb/cards` | Card management |
| `/hcb/admin` | Admin panel |
| `/hcb/settings` | User settings |

## API Endpoints

All endpoints are under `/api/hcb/` and return `{ data, error }` envelopes.

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/hcb/organizations` | List / create organizations |
| GET/PATCH/DELETE | `/api/hcb/organizations/[id]` | Get / update / delete org |
| GET/POST | `/api/hcb/transactions` | List / create transactions |
| GET/PATCH | `/api/hcb/transactions/[id]` | Get / update transaction |
| GET/POST | `/api/hcb/cards` | List / issue cards |
| GET/PATCH | `/api/hcb/cards/[id]` | Get / freeze/unfreeze card |
| POST | `/api/hcb/auth/login` | Initiate email login code |
| POST | `/api/hcb/auth/verify` | Verify login code |
