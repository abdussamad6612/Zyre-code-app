import { Router } from "express";
import { db, appSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getSession } from "./auth";

const router = Router();

async function requireAuth(req: any, res: any): Promise<{ userId: string; githubToken: string } | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Authentication required" }); return null; }
  const session = await getSession(token);
  if (!session) { res.status(401).json({ error: "Invalid or expired session" }); return null; }
  return { userId: session.userId, githubToken: session.token };
}

// ── Messages ─────────────────────────────────────────────────────────────────

router.get("/messages", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const convexSessionId = req.query.convexSessionId as string;
  if (!convexSessionId) return res.status(400).json({ error: "convexSessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, convexSessionId));
    const s = rows[0];
    if (!s) return res.json([]);
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    const messages = (s.messages as any[]) || [];
    res.json(messages.map((m: any) => ({
      _id: m.id || m._id || String(Math.random()),
      _creationTime: m.createdAt || Date.now(),
      sessionId: convexSessionId,
      role: m.role,
      content: m.content,
      image: m.image || null,
      todos: m.todos || [],
      toolCalls: m.toolCalls || [],
      usage: m.usage || null,
    })));
  } catch (err) {
    console.error("GET /messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages/add", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId, role, content, image, todos } = req.body;
  if (!sessionId || !role || !content) return res.status(400).json({ error: "sessionId, role, content required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    const newMsg = {
      id: crypto.randomUUID(),
      _id: crypto.randomUUID(),
      role,
      content,
      image: image || null,
      todos: todos || [],
      createdAt: Date.now(),
    };
    const updated = [...(s.messages as any[]), newMsg];
    await db.update(appSessionsTable).set({ messages: updated }).where(eq(appSessionsTable.id, sessionId));
    res.json(newMsg._id);
  } catch (err) {
    console.error("POST /messages/add error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages/remove", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { messageId, sessionId } = req.body;
  try {
    if (sessionId) {
      const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
      const s = rows[0];
      if (!s || s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
      const updated = (s.messages as any[]).filter((m: any) => m._id !== messageId && m.id !== messageId);
      await db.update(appSessionsTable).set({ messages: updated }).where(eq(appSessionsTable.id, sessionId));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages/clear", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    await db.update(appSessionsTable).set({ messages: [] }).where(eq(appSessionsTable.id, sessionId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Sessions update / rename ──────────────────────────────────────────────────

router.post("/sessions/update", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { id, status, statusMessage, name } = req.body;
  if (!id) return res.status(400).json({ error: "id required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, id));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    const patch: any = {};
    if (status !== undefined) patch.status = status;
    if (name !== undefined) patch.name = name;
    if (Object.keys(patch).length) {
      await db.update(appSessionsTable).set(patch).where(eq(appSessionsTable.id, id));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions/rename", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: "id and name required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, id));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    await db.update(appSessionsTable).set({ name }).where(eq(appSessionsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Session by sessionId string ───────────────────────────────────────────────

router.get("/session-by-sid", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json(toSessionDto(s));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Session controls ──────────────────────────────────────────────────────────

router.post("/session/resume", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json({ success: true, sessionId, message: "Session resumed" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/session/restart-dev-server", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json({ success: true, message: "Dev server restart initiated" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/session/stop-agent", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    await db.update(appSessionsTable).set({ status: "RUNNING" }).where(eq(appSessionsTable.id, sessionId));
    res.json({ success: true, message: "Agent stopped" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Session environment variables ─────────────────────────────────────────────

router.get("/session/get-envs", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json({ envs: (s as any).envs || {}, sessionId });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/session/add-env", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId, key, value } = req.body;
  if (!sessionId || !key || value === undefined) return res.status(400).json({ error: "sessionId, key, value required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    const envs = { ...((s as any).envs || {}), [key]: value };
    await db.update(appSessionsTable).set({ envs } as any).where(eq(appSessionsTable.id, sessionId));
    res.json({ success: true, synced: false });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/session/remove-env", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId, key } = req.body;
  if (!sessionId || !key) return res.status(400).json({ error: "sessionId and key required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    const envs = { ...((s as any).envs || {}) };
    delete envs[key];
    await db.update(appSessionsTable).set({ envs } as any).where(eq(appSessionsTable.id, sessionId));
    res.json({ success: true, synced: false });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Filesystem / Files ────────────────────────────────────────────────────────

router.post("/filesystem/read", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId, path } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json({ content: "", path: path || "/", sessionId });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/files/list", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json({ files: [], sessionId });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/files/read", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { sessionId, path } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const s = rows[0];
    if (!s) return res.status(404).json({ error: "Session not found" });
    if (s.userId !== user.userId) return res.status(403).json({ error: "Forbidden" });
    res.json({ content: "", path: path || "/", sessionId });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Usage / Credits ───────────────────────────────────────────────────────────

router.get("/usage", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  try {
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, user.userId));
    res.json({
      userId: user.userId,
      messagesUsed: 0,
      messagesLimit: 100,
      isPro: false,
      remainingMessages: 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/usage/create-user", async (req, res) => {
  res.json({ success: true });
});

router.post("/usage/update-profile", async (req, res) => {
  res.json({ success: true });
});

// ── Media stubs (images/audios/videos/storage) ────────────────────────────────

router.get("/images", async (req, res) => { res.json([]); });
router.post("/images/create", async (req, res) => { res.json({ _id: crypto.randomUUID() }); });
router.post("/images/start-generation", async (req, res) => { res.json({ success: true }); });
router.post("/images/delete", async (req, res) => { res.json({ success: true }); });

router.get("/audios", async (req, res) => { res.json([]); });
router.post("/audios/create", async (req, res) => { res.json({ _id: crypto.randomUUID() }); });
router.post("/audios/delete", async (req, res) => { res.json({ success: true }); });

router.get("/videos", async (req, res) => { res.json([]); });
router.post("/videos/create", async (req, res) => { res.json({ _id: crypto.randomUUID() }); });
router.post("/videos/delete", async (req, res) => { res.json({ success: true }); });

router.get("/storage-url", async (req, res) => { res.json({ url: null }); });

// ── Upload stubs ──────────────────────────────────────────────────────────────

router.post("/upload-image", async (req, res) => {
  res.json({ path: "/tmp/uploaded-image.jpg", storageId: crypto.randomUUID() });
});

router.post("/upload-audio", async (req, res) => {
  res.json({ path: "/tmp/uploaded-audio.mp3", storageId: crypto.randomUUID() });
});

router.post("/upload-video", async (req, res) => {
  res.json({ path: "/tmp/uploaded-video.mp4", storageId: crypto.randomUUID() });
});

// ── Misc ──────────────────────────────────────────────────────────────────────

router.post("/generate-audio", async (req, res) => {
  res.json({ success: true, message: "Audio generation not configured" });
});

router.post("/steal-app", async (req, res) => {
  res.json({ success: true });
});

function toSessionDto(s: typeof appSessionsTable.$inferSelect) {
  return {
    _id: s.id,
    id: s.id,
    sessionId: s.id,
    name: s.name,
    userId: s.userId,
    status: s.status,
    _creationTime: Number(s.creationTime),
    creationTime: Number(s.creationTime),
    messages: s.messages,
    previewUrl: s.previewUrl,
    tunnelUrl: s.previewUrl,
    repository: s.repository,
    githubRepository: s.repository,
    githubRepositoryUrl: s.repository ? `https://github.com/${s.repository}` : null,
    pullRequestUrl: s.pullRequestUrl,
    pullRequestNumber: s.pullRequestNumber,
    envs: (s as any).envs || {},
    templateId: s.templateId,
  };
}

export default router;
