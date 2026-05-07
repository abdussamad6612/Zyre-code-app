import { Router } from "express";
import crypto from "crypto";

const router = Router();

const sessions = new Map<string, { userId: string; token: string; username: string; expiresAt: number }>();

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

router.get("/auth/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({ error: "GitHub OAuth not configured" });
  }
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${process.env.APP_URL || ""}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo+read:user&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

router.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query as { code: string };
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }
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
    sessions.set(sessionToken, {
      userId: String(user.id),
      token: accessToken,
      username: user.login,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    const frontendUrl = process.env.APP_URL || "";
    res.redirect(`${frontendUrl}/?token=${sessionToken}&username=${user.login}`);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    res.status(500).json({ error: "OAuth callback failed" });
  }
});

router.get("/auth/session", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || (req.query.token as string);
  if (!token) {
    return res.json({ user: null });
  }
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token || "");
    return res.json({ user: null });
  }
  res.json({
    user: {
      id: session.userId,
      username: session.username,
      name: session.username,
    },
  });
});

router.post("/auth/signout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) sessions.delete(token);
  res.json({ success: true });
});

export function getSession(token: string) {
  const s = sessions.get(token);
  if (!s || s.expiresAt < Date.now()) return null;
  return s;
}

export default router;
