# Jira Executive Reporting Platform

An executive-facing operational intelligence dashboard for IT service desk data. It ingests support tickets and presents them as leadership-ready briefings: KPIs, SLA compliance trends, application health scores, engineer and team performance, and AI-generated incident summaries.

Built for briefing upper management and contractor chiefs — the emphasis is on at-a-glance status, drill-down on demand, and exportable/printable output.

## Features

- **Executive dashboard** — ticket volume and SLA compliance trends over 6 months, KPI tiles, distribution by application/priority/status
- **Tickets** — searchable and filterable ticket list with drill-down detail, full comment history, and SLA tracking
- **AI incident summaries** — for resolved tickets: root cause, remediation, business impact, and recommended preventative actions
- **Applications** — health scores (0–100) sorted worst-first, with the ticket volume, SLA breaches, and critical incident counts behind each score
- **Engineers** — per-engineer workload and performance, plus a team-level rollup table sorted by SLA compliance
- **Reports** — generate a period report from live ticket data; print to PDF or export CSV
- **Briefing output** — print view renders a clean standalone document with no app chrome
- **Light / dark mode** — follows OS preference or set explicitly

## Requirements

- Node.js >= 20
- npm >= 10

## Quick start

```bash
npm install --workspaces --include-workspace-root
npm run db:generate    # generate the Prisma client
npm run db:seed        # seed demo data
npm run dev            # starts backend :3001 and frontend :5173
```

Open http://localhost:5173.

### Seeding

`npm run db:seed` is destructive — it clears and regenerates all demo data. It produces 7 applications, 8 engineers, 29 tickets with realistic comment threads, AI analyses for resolved tickets, and 6 months of trend history. All derived metrics (workload, health scores, performance) are computed from the generated tickets, so every figure in the UI is internally consistent.

The SQLite path in `DATABASE_URL` is resolved relative to `packages/backend/prisma/`, so the seed writes to the same database the API reads regardless of the directory you run it from.

## Architecture

npm workspaces monorepo:

| Package | Purpose |
|---|---|
| `packages/backend` | Express + Prisma REST API (SQLite by default) |
| `packages/frontend` | React 18 + TypeScript + MUI + Vite |
| `packages/synthetic-data` | Demo data generator |
| `packages/shared` | Shared type definitions (currently unused by both apps) |

The frontend calls the API at a **relative** `/api` path. In development Vite proxies this to the backend; in production, serve the built frontend behind the same origin as the API. Set `VITE_API_URL` only if the backend genuinely lives on a different origin.

## Configuration

Backend (`packages/backend/.env`):

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Prisma connection string |
| `PORT` | `3001` | API port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |

Frontend:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | Override only for a cross-origin backend |
| `VITE_PROXY_TARGET` | `http://localhost:3001` | Dev proxy target |

## Remote / VM hosting

The Vite dev server binds all interfaces (`host: true`), so a forwarded port on a remote VM works without extra flags. Because the client uses a relative API path proxied through Vite, no absolute backend URL needs to be baked in.

For anything beyond a demo, build and serve statically instead of exposing the dev server:

```bash
npm run build --workspace=packages/frontend
npm run preview --workspace=packages/frontend   # or serve packages/frontend/dist/ behind your web server
```

`vite preview` serves the built assets but does **not** proxy `/api`. Put the frontend and backend behind one origin with your web server (or set `VITE_API_URL` at build time) so the relative API path resolves.

## Deployment notes

- **No external CDN dependencies.** Fonts are system-stack only and all assets are bundled, so the app renders correctly on networks that block outbound requests.
- **Secrets are never sent to the browser.** `GET /api/settings` redacts stored credentials and reports only whether each key is configured.
- **Baseline hardening** is in place: Helmet security headers, a CORS allowlist, rate limiting (300 req/min), a 1 MB request body cap, and a central error handler that does not leak stack traces.

> **Authentication is not implemented.** The app auto-logs-in as the first seeded user for demonstration purposes. Before any real deployment, implement authentication and authorization, and place the application behind your organization's access controls. The `User` model already carries `passwordHash`, `role`, and `permissions` fields to build on, and an `AuditLog` model exists for activity tracking.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run backend and frontend together |
| `npm run build` | Build all workspaces |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run tests across workspaces |

## Data model

Core entities: `Ticket` (with `SLAInfo`, `TicketComment`, `AIAnalysis`, `ReopenHistory`), `Application` (with `ApplicationHealthScore`), `Engineer` (with `EngineerWorkload`, `EngineerPerformance`), and `MonthlyReport`. Reporting support exists for `RecurringIssue`, `OperationalRisk`, `ActionItem`, and `TrendHistory`.

SQLite has no native JSON or array columns, so list/object fields are stored as JSON strings and parsed at the boundary.
