const API_BASE = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || "/api";

function getSessionToken(): string | null {
  try { return localStorage.getItem("vibracode_session_token"); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createStripeCheckoutSessionAction(planId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ planId }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error || "Failed to create checkout session");
}

export async function createStripeCustomerPortalSessionAction(): Promise<void> {
  const res = await fetch(`${API_BASE}/billing/portal`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error || "Failed to create portal session");
}

export async function runAgentAction(params: {
  sessionId: string;
  id: string;
  message: string;
  template?: any;
  repository?: any;
  token?: string;
  model?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/run-agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to run agent");
  }
}

export async function createPullRequestAction(..._args: any[]): Promise<null> {
  console.warn("createPullRequestAction: not implemented");
  return null;
}

export async function createSessionAction(params: {
  sessionId: string;
  message: string;
  templateId?: string;
  repository?: any;
  userId: string;
  token?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create session");
  }
}

export async function generateFeaturebaseUserHash(..._args: any[]): Promise<string> {
  return "";
}

export async function checkGitHubConnection(clerkId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/github/check-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ clerkId }),
  });
  return res.json();
}

export async function createAndPushToGitHub(params: {
  sessionId: string;
  convexId?: string;
  repoName: string;
  isPrivate?: boolean;
  clerkId: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/github/create-and-push`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function generateRepoName(prompt: string): Promise<string> {
  const words = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).slice(0, 3);
  return words.join("-") + "-app";
}

export async function retryGitHubPush(params: { sessionId: string; convexId?: string; clerkId: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/github/retry-push`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function disconnectGitHub(clerkId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/github/disconnect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ clerkId }),
  });
  return res.json();
}

export async function clearSessionGitHub(..._args: any[]): Promise<null> {
  console.warn("clearSessionGitHub: not implemented");
  return null;
}
