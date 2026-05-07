import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

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
      "convex/react": path.resolve(import.meta.dirname, "src/stubs/convex.ts"),
      "convex/nextjs": path.resolve(import.meta.dirname, "src/stubs/convex.ts"),
      "@/convex/_generated/api": path.resolve(import.meta.dirname, "src/stubs/convex-api.ts"),
      "@/convex/_generated/dataModel": path.resolve(import.meta.dirname, "src/stubs/convex-data-model.ts"),
      "@clerk/nextjs": path.resolve(import.meta.dirname, "src/stubs/clerk.ts"),
      "@clerk/nextjs/server": path.resolve(import.meta.dirname, "src/stubs/clerk.ts"),
      "@/app/actions/stripe/create-checkout-session": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/app/actions/stripe/create-customer-portal-session": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/app/actions/vibrakit": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/app/actions/github-push": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/app/actions/agents": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/app/actions/sessions/create-convex-project": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/app/actions/featurebase/generate-user-hash": path.resolve(import.meta.dirname, "src/stubs/app-actions.ts"),
      "@/lib/inngest": path.resolve(import.meta.dirname, "src/stubs/inngest.ts"),
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
