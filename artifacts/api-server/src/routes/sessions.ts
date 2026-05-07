import { Router } from "express";
import { inngest } from "../lib/inngest";
import { getSession } from "./auth";
import { db, appSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function requireAuth(req: any, res: any): Promise<{ userId: string; githubToken: string } | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Authentication required" }); return null; }
  const session = await getSession(token);
  if (!session) { res.status(401).json({ error: "Invalid or expired session" }); return null; }
  return { userId: session.userId, githubToken: session.token };
}

router.post("/create-session", async (req, res) => {
  try {
    const { sessionId, message, templateId, repository } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const caller = await requireAuth(req, res);
    if (!caller) return;
    const userId = caller.userId;

    const template = getTemplate(templateId);
    if (!template) {
      return res.status(400).json({ error: `Template "${templateId}" not found` });
    }

    await db.insert(appSessionsTable).values({
      id: sessionId,
      name: message ? message.slice(0, 60) : `Session ${sessionId.slice(0, 8)}`,
      userId,
      status: "creating",
      creationTime: Date.now(),
      messages: [],
      repository: repository || null,
      templateId: templateId || null,
    }).onConflictDoNothing();

    try {
      await inngest.send({
        name: "vibracode/create.session",
        data: { sessionId, message, repository, template },
      });
      await db.update(appSessionsTable)
        .set({ status: "active" })
        .where(eq(appSessionsTable.id, sessionId));
    } catch {
      await db.update(appSessionsTable)
        .set({ status: "active" })
        .where(eq(appSessionsTable.id, sessionId));
    }

    res.json({ success: true, sessionId, message: "Session creation started" });
  } catch (err) {
    console.error("create-session error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  try {
    const rows = await db.select().from(appSessionsTable)
      .where(eq(appSessionsTable.userId, user.userId));
    const sessions = rows
      .sort((a, b) => Number(b.creationTime) - Number(a.creationTime))
      .map(toSessionDto);
    res.json({ sessions });
  } catch (err) {
    console.error("GET /sessions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions/:id", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { id } = req.params;
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, id));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json(toSessionDto(s));
  } catch (err) {
    console.error("GET /sessions/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/run-agent", async (req, res) => {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { sessionId, id, message, templateId, repository, model } = req.body;

    if (!sessionId || !id || !message) {
      return res.status(400).json({ error: "sessionId, id, and message are required" });
    }

    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });

    const template = getTemplate(templateId) || getTemplate("expo")!;
    const updatedMessages = [...(s.messages as any[]), { id, role: "user", content: message, createdAt: Date.now() }];
    await db.update(appSessionsTable)
      .set({ messages: updatedMessages })
      .where(eq(appSessionsTable.id, sessionId));

    try {
      await inngest.send({
        name: "vibracode/run.agent",
        data: { sessionId, id, message, template, repository, token: user.githubToken, model },
      });
    } catch {
      console.warn("Inngest not configured for run-agent");
    }

    res.json({ success: true, sessionId, message: "Agent started" });
  } catch (err) {
    console.error("run-agent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/steal-app", async (req, res) => {
  try {
    const { sessionId, input, inputType } = req.body;
    if (!sessionId || !input || !inputType) {
      return res.status(400).json({ error: "sessionId, input, and inputType are required" });
    }
    try {
      await inngest.send({ name: "vibracode/steal.app", data: { sessionId, input, inputType } });
    } catch { }
    res.json({ success: true });
  } catch (err) {
    console.error("steal-app error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/generate-video", async (req, res) => {
  try {
    const { videoId, prompt } = req.body;
    if (!videoId || !prompt) {
      return res.status(400).json({ error: "videoId and prompt are required" });
    }
    try {
      await inngest.send({ name: "vibracode/generate.video", data: { videoId, prompt } });
    } catch { }
    res.json({ success: true, message: "Video generation started" });
  } catch (err) {
    console.error("generate-video error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/generate-image", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", quality = "auto" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) return res.status(503).json({ error: "OpenAI API key not configured" });
    const apiUrl = process.env.OPENAI_PROXY_URL || "https://api.openai.com";
    const response = await fetch(`${apiUrl}/v1/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "chatgpt-image-latest", prompt, n: 1, size, quality }),
    });
    const data = await response.json() as any;
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Image generation failed" });
    res.json(data);
  } catch (err) {
    console.error("generate-image error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/check-url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  let validUrl: string;
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (url.includes("-") && url.includes("6532622b")) {
        validUrl = `https://3000-${url}.e2b.dev`;
      } else {
        return res.status(400).json({ available: false, error: "Invalid URL format" });
      }
    } else {
      validUrl = url;
    }
    const parsed = new URL(validUrl);
    const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
    if (blocked.includes(parsed.hostname)) {
      return res.status(403).json({ available: false, error: "URL not allowed" });
    }
  } catch {
    return res.status(400).json({ available: false, error: "Invalid URL format" });
  }
  try {
    const response = await fetch(validUrl, { signal: AbortSignal.timeout(10000) });
    res.json({ available: response.ok, status: response.status });
  } catch (err) {
    res.json({ available: false, error: String(err) });
  }
});

router.get("/preview-proxy", async (req, res) => {
  const { url } = req.query as { url: string };
  if (!url) return res.status(400).json({ error: "URL parameter required" });
  let targetUrl: URL;
  try { targetUrl = new URL(url); } catch { return res.status(400).json({ error: "Invalid URL" }); }
  const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
  if (blocked.includes(targetUrl.hostname)) return res.status(403).json({ error: "URL not allowed" });
  const allowedPatterns = [/\.e2b\.dev$/, /\.northflank\.app$/];
  if (!allowedPatterns.some((p) => p.test(targetUrl.hostname))) {
    return res.status(403).json({ error: "URL not in allowlist" });
  }
  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
      signal: AbortSignal.timeout(10000),
    });
    const text = await upstream.text();
    res.set("Content-Type", upstream.headers.get("content-type") || "text/html");
    res.set("X-Frame-Options", "");
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

function toSessionDto(s: typeof appSessionsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    userId: s.userId,
    status: s.status,
    _creationTime: Number(s.creationTime),
    messages: s.messages,
    previewUrl: s.previewUrl,
    repository: s.repository,
    pullRequest: s.pullRequestUrl
      ? { html_url: s.pullRequestUrl, number: s.pullRequestNumber }
      : null,
  };
}

function getTemplate(templateId?: string) {
  const templates = [
    { id: "expo", name: "Expo App", description: "React Native with Expo" },
    { id: "react-native", name: "React Native", description: "React Native bare" },
    { id: "expo-web", name: "Expo Web", description: "Expo with web support" },
  ];
  return templates.find((t) => t.id === templateId) || null;
}

export default router;
