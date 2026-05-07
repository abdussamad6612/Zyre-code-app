# VibraCode - AI Mobile App Builder

A marketing and product site for VibraCode, an AI-powered mobile app builder that lets users create iOS and Android apps by describing them in natural language.

## Run & Operate

- `pnpm --filter @workspace/vibracode run dev` — run the frontend (port set by `PORT` env var)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, wouter routing
- UI: shadcn/ui components, Radix UI primitives
- Animations: motion/react (Framer Motion), GSAP, Three.js (WebGL wave hero)
- Particles: @tsparticles/react + @tsparticles/slim
- Icons: lucide-react
- DB: PostgreSQL + Drizzle ORM (API server)
- Build: Vite (frontend), esbuild CJS (API)

## Where things live

- `artifacts/vibracode/` — React+Vite frontend artifact
  - `src/App.tsx` — main router (wouter, 12 pages)
  - `src/pages/` — page components (HomePage, BillingPage, FAQPage, BlogPage, etc.)
  - `src/pages/SessionPage.tsx` — full workspace: LeftSidebar + Chat + Preview
  - `src/components/` — shared UI components (navbar, hero, pricing, footer…)
  - `src/components/session/left-sidebar.tsx` — 11-tab sidebar (code/db/envs/logs/etc)
  - `src/components/chat/` — Chat, ChatForm, Message, ModelSelector, etc.
  - `src/components/preview/` — Preview + MobilePreview with polling
  - `src/providers/` — AuthProvider (broadcasts to window.__vibra_auth for Clerk stub)
  - `src/stubs/` — stub modules for Convex, Clerk, Inngest, Next.js navigation/server
  - `src/convex/_generated/` — real stub files (api.ts, dataModel.ts)
  - `src/app/actions/` — real stub files (vibrakit.ts, github.ts, session.ts)
  - `src/lib/plans.ts` — pricing plan definitions
  - `src/config.ts` — app templates config
  - `vite.config.ts` — Vite aliases for all stub modules

- `artifacts/api-server/` — Express API server (port 8080)
  - `src/routes/sessions.ts` — session CRUD, create, run-agent, check-url, preview-proxy
  - `src/routes/extras.ts` — messages, usage, session controls, filesystem, media stubs
  - `src/routes/auth.ts` — GitHub OAuth, session management
  - `src/routes/github.ts` — GitHub integration routes
  - `src/routes/billing.ts` — Stripe billing routes
  - `lib/db/src/schema/index.ts` — auth_sessions + app_sessions tables

## Architecture decisions

- **Stub strategy**: Convex, Clerk, Inngest, and Next.js APIs are stubbed at two levels:
  1. Vite `resolve.alias` maps package names → `src/stubs/*.ts`
  2. Real files at `src/convex/_generated/` and `src/app/actions/` for `@/`-prefixed imports
     (Vite expands `@/` to `src/` before string alias matching — real files are required)
- **Convex stub**: `useQuery` polls REST endpoints every 3s keyed by query name;
  `useMutation` maps mutation keys to REST POST endpoints.
- **Clerk stub**: `useUser()` reads from `window.__vibra_auth`, broadcast by `AuthProvider`
  on auth state changes so all `useUser()` callers get real user data.
- **WebGL graceful fallback**: The hero wave animation (Three.js) checks WebGL availability;
  degrades gracefully in sandboxed environments.
- **wouter routing**: Replaces Next.js App Router; `useParams()` stub parses Wouter location.
- **Dark theme forced**: `forcedTheme="dark"` via next-themes/ThemeProvider.

## Product

Pages: Home (hero + footer), Billing/Pricing, FAQ, Blog, Contact, Privacy, Terms, Refund, Sessions, Session detail, Billing success/cancel.

Session workspace (/session/:id): LeftSidebar (11 tabs) + Chat (with agent running indicator) + Preview (mobile mockup with QR code).

## Known stub limitations

- `filesystem/read` and `files/list` return empty stubs — no E2B sandbox integration.
- `session/restart-dev-server` and `session/stop-agent` update DB status but don't connect to E2B.
- Image/audio/video studio tabs render UI but generation requires OpenAI/ElevenLabs keys in env.
- `useParams()` stub parses location string — works for `/session/:id` pattern, may need updating for other dynamic routes.
- Media storage (`/api/storage-url`) returns null — Convex file storage not wired.
- Usage/credits always returns free tier values — no real quota tracking yet.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- THREE.js WebGL won't render in Replit sandbox (no GPU), hero shows plain dark background.
- `motion/react` package is an alias for Framer Motion — installed as `motion` (not `framer-motion`).
- `@tsparticles/engine` has ignored build scripts — run `pnpm approve-builds` if particle effects break.
- Pricing is at `/billing` (not `/pricing`).
- API server runs at port 8080 (set by PORT env var), not 5000.
- DB schema: auth_sessions (token, userId, githubToken, username, expiresAt) + app_sessions.
- The `envs` column is stored as JSONB on app_sessions but not in the current schema — add if needed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
