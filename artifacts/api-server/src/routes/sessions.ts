import { Router } from "express";
import { inngest } from "../lib/inngest";

const router = Router();

router.post("/create-session", async (req, res) => {
  try {
    const { sessionId, message, templateId, repository, userId, token } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: "sessionId and userId are required" });
    }

    const template = getTemplate(templateId);
    if (!template) {
      return res.status(400).json({ error: `Template "${templateId}" not found` });
    }

    await inngest.send({
      name: "vibracode/create.session",
      data: {
        sessionId,
        message,
        repository,
        token: token || "",
        template,
      },
    });

    res.json({ success: true, sessionId, message: "Session creation started" });
  } catch (err) {
    console.error("create-session error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/run-agent", async (req, res) => {
  try {
    const { sessionId, id, message, templateId, repository, token, model } = req.body;

    if (!sessionId || !id || !message) {
      return res.status(400).json({ error: "sessionId, id, and message are required" });
    }

    const template = getTemplate(templateId) || getTemplate("expo");
    if (!template) {
      return res.status(400).json({ error: "No template found" });
    }

    await inngest.send({
      name: "vibracode/run.agent",
      data: {
        sessionId,
        id,
        message,
        template,
        repository,
        token: token || "",
        model,
      },
    });

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
    await inngest.send({
      name: "vibracode/steal.app",
      data: { sessionId, input, inputType },
    });
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
    await inngest.send({
      name: "vibracode/generate.video",
      data: { videoId, prompt },
    });
    res.json({ success: true, message: "Video generation started" });
  } catch (err) {
    console.error("generate-video error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/generate-image", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", quality = "auto", background = "transparent", outputFormat = "png" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const apiUrl = process.env.OPENAI_PROXY_URL || "https://api.openai.com";
    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      return res.status(503).json({ error: "OpenAI API key not configured" });
    }
    const response = await fetch(`${apiUrl}/v1/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "chatgpt-image-latest", prompt, n: 1, size, quality }),
    });
    const data = await response.json() as any;
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Image generation failed" });
    }
    res.json(data);
  } catch (err) {
    console.error("generate-image error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/check-url", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
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
  if (!url) {
    return res.status(400).json({ error: "URL parameter required" });
  }
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }
  const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
  if (blocked.includes(targetUrl.hostname)) {
    return res.status(403).json({ error: "URL not allowed" });
  }
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

function getTemplate(templateId?: string) {
  const templates = [
    { id: "expo", name: "Expo App", description: "React Native with Expo" },
    { id: "react-native", name: "React Native", description: "React Native bare" },
    { id: "expo-web", name: "Expo Web", description: "Expo with web support" },
  ];
  return templates.find((t) => t.id === templateId) || null;
}

export default router;
