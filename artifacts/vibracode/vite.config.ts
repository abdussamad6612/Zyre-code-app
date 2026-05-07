import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5173;

const basePath = process.env.BASE_PATH || "/";

const stubs = path.resolve(import.meta.dirname, "src/stubs");

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),

      // Convex
      "convex/react": `${stubs}/convex.ts`,
      "convex/nextjs": `${stubs}/convex.ts`,
      "@/convex/_generated/api": `${stubs}/convex-api.ts`,
      "@/convex/_generated/dataModel": `${stubs}/convex-data-model.ts`,

      // Clerk
      "@clerk/nextjs": `${stubs}/clerk.ts`,
      "@clerk/nextjs/server": `${stubs}/clerk.ts`,

      // Next.js navigation
      "next/navigation": `${stubs}/next-navigation.ts`,
      "next/server": `${stubs}/next-server.ts`,
      "next/headers": `${stubs}/next-server.ts`,

      // App actions — all map to unified stubs
      "@/app/actions/stripe/create-checkout-session": `${stubs}/app-actions.ts`,
      "@/app/actions/stripe/create-customer-portal-session": `${stubs}/app-actions.ts`,
      "@/app/actions/vibrakit": `${stubs}/app-actions.ts`,
      "@/app/actions/github-push": `${stubs}/app-actions.ts`,
      "@/app/actions/agents": `${stubs}/app-actions.ts`,
      "@/app/actions/sessions/create-convex-project": `${stubs}/app-actions.ts`,
      "@/app/actions/featurebase/generate-user-hash": `${stubs}/app-actions.ts`,
      "@/app/actions/session": `${stubs}/app-actions.ts`,
      "@/app/actions/github": `${stubs}/github.ts`,

      // Inngest
      "@/lib/inngest": `${stubs}/inngest.ts`,
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
