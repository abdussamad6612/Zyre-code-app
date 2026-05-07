const API_BASE = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || "/api";

function getToken(): string | null {
  try { return localStorage.getItem("vibracode_session_token"); } catch { return null; }
}
function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string;
  default_branch?: string;
}

export async function listRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(`${API_BASE}/github/repos`, { headers: authHeaders() });
    if (res.ok) return res.json();
  } catch {}
  return [];
}

export async function checkGitHubConnection(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/github/check-connection`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    return res.json();
  } catch {
    return { connected: false };
  }
}
