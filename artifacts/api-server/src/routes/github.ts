import { Router } from "express";
import { Octokit } from "@octokit/rest";
import { convex } from "../lib/convex";
import { inngest } from "../lib/inngest";

const router = Router();

const MOBILE_GITHUB_CLIENT_ID = process.env.MOBILE_GITHUB_CLIENT_ID || "";
const MOBILE_GITHUB_CLIENT_SECRET = process.env.MOBILE_GITHUB_CLIENT_SECRET || "";

router.post("/github/check-connection", async (req, res) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) {
      return res.status(400).json({ isConnected: false, error: "Missing clerkId" });
    }
    if (!convex) {
      return res.status(503).json({ isConnected: false, error: "Convex not configured" });
    }
    const creds = await (convex as any).query("github:getByClerkId", { clerkId }).catch(() => null);
    if (!creds?.accessToken) {
      return res.json({ isConnected: false });
    }
    try {
      const octokit = new Octokit({ auth: creds.accessToken });
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
    const { code, clerkId, source } = req.body;
    if (!code || !clerkId) {
      return res.status(400).json({ success: false, error: "Missing code or clerkId" });
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
    if (convex) {
      try {
        await (convex as any).mutation("github:store", { clerkId, accessToken, username: user.login });
      } catch (e) {
        console.warn("Failed to store GitHub credentials in Convex:", e);
      }
    }
    res.json({ success: true, username: user.login });
  } catch (err) {
    console.error("github/exchange-token error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/github/disconnect", async (req, res) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) {
      return res.status(400).json({ success: false, error: "Missing clerkId" });
    }
    if (convex) {
      try {
        await (convex as any).mutation("github:remove", { clerkId });
      } catch (e) {
        console.warn("Failed to remove GitHub credentials from Convex:", e);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error("github/disconnect error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/github/create-and-push", async (req, res) => {
  try {
    const { sessionId, convexId, repoName, isPrivate, clerkId } = req.body;
    if (!sessionId || !repoName || !clerkId) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }
    if (!convex) {
      return res.status(503).json({ success: false, error: "Convex not configured" });
    }
    const creds = await (convex as any).query("github:getByClerkId", { clerkId }).catch(() => null);
    if (!creds?.accessToken) {
      return res.json({ success: false, error: "GitHub not connected. Please connect your GitHub account." });
    }
    const octokit = new Octokit({ auth: creds.accessToken });
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate ?? true,
      auto_init: false,
      description: "Created with VibraCoder - AI Mobile App Builder",
    });
    await inngest.send({
      name: "vibracode/push.github",
      data: { sessionId, convexId, repositoryUrl: repo.clone_url, clerkId },
    });
    res.json({ success: true, repository: repo.full_name, repositoryUrl: repo.html_url });
  } catch (err) {
    console.error("github/create-and-push error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/github/retry-push", async (req, res) => {
  try {
    const { sessionId, convexId, clerkId } = req.body;
    if (!sessionId || !clerkId) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }
    await inngest.send({
      name: "vibracode/push.github",
      data: { sessionId, convexId, clerkId, isRetry: true },
    });
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

export default router;
