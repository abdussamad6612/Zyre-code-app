import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || "";

if (!convexUrl) {
  console.warn("Convex URL not configured - Convex features disabled");
}

export const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;
