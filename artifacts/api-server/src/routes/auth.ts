import { Router } from "express";
import crypto from "crypto";
import { db, authSessionsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

const router = Router();

const oauthStates = new Map<string, number>();

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function cleanExpiredStates() {
  const now = Date.now();
  for (const [state, ts] of oauthStates.entries()) {
    if (now - ts > 10 * 60 * 1000) oauthStates.delete(state);
  }
}

async function cleanExpiredSessions() {
  try {
    await db.delete(authSessionsTable).where(lt(authSessionsTable.expiresAt, Date.now()));
  } catch { }
}

router.get("/auth/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({ error: "GitHub OAuth not configured" });
  }
  cleanExpiredStates();
  const state = crypto.randomBytes(16).toString("hex");
  oauthStates.set(state, Date.now());
  const redirectUri = `${process.env.APP_URL || ""}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo+read:user&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

router.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query as { code: string; state: string };
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }
  if (!state || !oauthStates.has(state)) {
    return res.status(400).json({ error: "Invalid or expired OAuth state" });
  }
  oauthStates.delete(state);
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json() as any;
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }
    const accessToken = tokenData.access_token;
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json() as any;
    const sessionToken = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await db.insert(authSessionsTable).values({
      token: sessionToken,
      userId: String(user.id),
      githubToken: accessToken,
      username: user.login,
      expiresAt,
    }).onConflictDoUpdate({
      target: authSessionsTable.token,
      set: { userId: String(user.id), githubToken: accessToken, username: user.login, expiresAt },
    });
    cleanExpiredSessions().catch(() => { });
    const frontendUrl = process.env.APP_URL || "";
    res.redirect(`${frontendUrl}/?token=${sessionToken}&username=${user.login}`);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    res.status(500).json({ error: "OAuth callback failed" });
  }
});

router.get("/auth/session", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || (req.query.token as string);
  if (!token) {
    return res.json({ user: null });
  }
  try {
    const rows = await db.select().from(authSessionsTable).where(eq(authSessionsTable.token, token));
    const session = rows[0];
    if (!session || session.expiresAt < Date.now()) {
      if (session) await db.delete(authSessionsTable).where(eq(authSessionsTable.token, token)).catch(() => { });
      return res.json({ user: null });
    }
    res.json({
      user: {
        id: session.userId,
        username: session.username,
        name: session.username,
      },
    });
  } catch (err) {
    console.error("auth/session error:", err);
    res.status(500).json({ user: null });
  }
});

router.post("/auth/signout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    await db.delete(authSessionsTable).where(eq(authSessionsTable.token, token)).catch(() => { });
  }
  res.json({ success: true });
});

export async function getSession(token: string) {
  try {
    const rows = await db.select().from(authSessionsTable).where(eq(authSessionsTable.token, token));
    const s = rows[0];
    if (!s || s.expiresAt < Date.now()) return null;
    return { userId: s.userId, token: s.githubToken, username: s.username, expiresAt: s.expiresAt };
  } catch {
    return null;
  }
}

export default router;
