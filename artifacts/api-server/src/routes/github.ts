import { Router } from "express";
import { Octokit } from "@octokit/rest";
import { convex } from "../lib/convex";
import { inngest } from "../lib/inngest";
import { getSession } from "./auth";

const router = Router();

const MOBILE_GITHUB_CLIENT_ID = process.env.MOBILE_GITHUB_CLIENT_ID || "";
const MOBILE_GITHUB_CLIENT_SECRET = process.env.MOBILE_GITHUB_CLIENT_SECRET || "";

async function requireAuth(req: any, res: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Authentication required" }); return null; }
  const session = await getSession(token);
  if (!session) { res.status(401).json({ error: "Invalid or expired session" }); return null; }
  return session;
}

router.post("/github/check-connection", async (req, res) => {
  try {
    const authSession = await requireAuth(req, res);
    if (!authSession) return;
    try {
      const octokit = new Octokit({ auth: authSession.token });
      const { data: user } = await octokit.rest.users.getAuthenticated();
      res.json({ isConnected: true, username: user.login });
    } catch {
      res.json({ isConnected: false, error: "GitHub token expired. Please reconnect." });
    }
  } catch (err) {
    console.error("github/check-connection error:", err);
    res.status(500).json({ isConnected: false, error: "Internal server error" });
  }
});

router.post("/github/exchange-token", async (req, res) => {
  try {
    const { code, source } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: "Missing code" });
    }
    const clientId = source === "mobile" ? MOBILE_GITHUB_CLIENT_ID : process.env.GITHUB_CLIENT_ID;
    const clientSecret = source === "mobile" ? MOBILE_GITHUB_CLIENT_SECRET : process.env.GITHUB_CLIENT_SECRET;
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json() as any;
    if (tokenData.error) {
      return res.status(400).json({ success: false, error: tokenData.error_description });
    }
    const accessToken = tokenData.access_token;
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    res.json({ success: true, username: user.login });
  } catch (err) {
    console.error("github/exchange-token error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/github/disconnect", async (req, res) => {
  try {
    const authSession = await requireAuth(req, res);
    if (!authSession) return;
    res.json({ success: true });
  } catch (err) {
    console.error("github/disconnect error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/github/create-and-push", async (req, res) => {
  try {
    const { sessionId, convexId, repoName, isPrivate } = req.body;
    const authSession = await requireAuth(req, res);
    if (!authSession) return;
    if (!sessionId || !repoName) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }
    const octokit = new Octokit({ auth: authSession.token });
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate ?? true,
      auto_init: false,
      description: "Created with VibraCode - AI Mobile App Builder",
    });
    try {
      await inngest.send({
        name: "vibracode/push.github",
        data: { sessionId, convexId, repositoryUrl: repo.clone_url, userId: authSession.userId },
      });
    } catch {
      console.warn("Inngest not configured for push.github");
    }
    res.json({ success: true, repository: repo.full_name, repositoryUrl: repo.html_url });
  } catch (err) {
    console.error("github/create-and-push error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/github/retry-push", async (req, res) => {
  try {
    const { sessionId, convexId } = req.body;
    const authSession = await requireAuth(req, res);
    if (!authSession) return;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }
    try {
      await inngest.send({
        name: "vibracode/push.github",
        data: { sessionId, convexId, userId: authSession.userId, isRetry: true },
      });
    } catch {
      console.warn("Inngest not configured for push.github retry");
    }
    res.json({ success: true });
  } catch (err) {
    console.error("github/retry-push error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/github/status", async (req, res) => {
  try {
    const { sessionId } = req.query as { sessionId: string };
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }
    if (!convex) {
      return res.status(503).json({ error: "Convex not configured" });
    }
    const status = await (convex as any).query("sessions:getGithubStatus", { sessionId }).catch(() => null);
    res.json(status || { status: "unknown" });
  } catch (err) {
    console.error("github/status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/github/create-pull-request", async (req, res) => {
  try {
    const { sessionId, repository, title, body } = req.body;
    if (!sessionId || !repository) {
      return res.status(400).json({ success: false, error: "sessionId and repository are required" });
    }
    const authSession = await requireAuth(req, res);
    if (!authSession) return;

    const { db, appSessionsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const appSession = rows[0];
    if (!appSession) return res.status(404).json({ success: false, error: "Session not found" });
    if (appSession.userId !== authSession.userId) return res.status(403).json({ success: false, error: "Forbidden" });

    const [owner, repo] = repository.split("/");
    if (!owner || !repo) {
      return res.status(400).json({ success: false, error: "repository must be in owner/repo format" });
    }
    const octokit = new Octokit({ auth: authSession.token });
    const repoData = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.data.default_branch;
    const pr = await octokit.rest.pulls.create({
      owner,
      repo,
      title: title || "VibraCode: AI generated changes",
      body: body || "This pull request was created automatically by VibraCode AI.",
      head: "vibracode-changes",
      base: defaultBranch,
    });
    await db.update(appSessionsTable)
      .set({ pullRequestUrl: pr.data.html_url, pullRequestNumber: pr.data.number })
      .where(eq(appSessionsTable.id, sessionId));
    res.json({ success: true, html_url: pr.data.html_url, number: pr.data.number });
  } catch (err: any) {
    console.error("github/create-pull-request error:", err);
    res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

router.post("/github/clear-session", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: "sessionId is required" });
    const authSession = await requireAuth(req, res);
    if (!authSession) return;

    const { db, appSessionsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(appSessionsTable).where(eq(appSessionsTable.id, sessionId));
    const appSession = rows[0];
    if (!appSession) return res.status(404).json({ success: false, error: "Session not found" });
    if (appSession.userId !== authSession.userId) return res.status(403).json({ success: false, error: "Forbidden" });

    await db.update(appSessionsTable)
      .set({ pullRequestUrl: null, pullRequestNumber: null, repository: null })
      .where(eq(appSessionsTable.id, sessionId));
    res.json({ success: true });
  } catch (err) {
    console.error("github/clear-session error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
