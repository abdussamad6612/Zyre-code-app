# VibraCode - AI Mobile App Builder

A marketing and product site for VibraCode, an AI-powered mobile app builder that lets users create iOS and Android apps by describing them in natural language.

## Run & Operate

- `pnpm --filter @workspace/vibracode run dev` — run the frontend (port set by `PORT` env var)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
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
  - `src/components/` — shared UI components (navbar, hero, pricing, footer…)
  - `src/providers/` — AuthProvider stub, ThemeProvider
  - `src/stubs/` — stub modules for Convex, Clerk, Inngest, Next.js server actions
  - `src/lib/plans.ts` — pricing plan definitions
  - `src/config.ts` — app templates config
  - `vite.config.ts` — Vite aliases for stub modules

## Architecture decisions

- **Stub strategy**: Convex, Clerk, Inngest, and Next.js server actions are stubbed via Vite `resolve.alias` — the UI renders without these SaaS backends.
- **WebGL graceful fallback**: The hero wave animation (Three.js) checks WebGL availability before initializing; degrades gracefully in sandboxed environments.
- **wouter routing**: Replaces Next.js App Router; uses `base={import.meta.env.BASE_URL}` for Replit proxy compatibility.
- **Dark theme forced**: `forcedTheme="dark"` via next-themes/ThemeProvider.
- **Auth stub**: `AuthProvider` at `src/providers/auth-provider.tsx` provides `isSignedIn/user/signIn/signOut` context with no real backend.

## Product

Pages: Home (hero + footer), Billing/Pricing, FAQ, Blog, Contact, Privacy, Terms, Refund, Sessions, Session detail, Billing success/cancel.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- THREE.js WebGL won't render in Replit sandbox (no GPU), hero shows plain dark background.
- `motion/react` package is an alias for Framer Motion — installed as `motion` (not `framer-motion`).
- `@tsparticles/engine` has ignored build scripts — run `pnpm approve-builds` if particle effects break.
- Pricing is at `/billing` (not `/pricing`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
