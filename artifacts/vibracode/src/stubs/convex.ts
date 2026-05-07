import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || "/api";

function getToken(): string | null {
  try { return localStorage.getItem("vibracode_session_token"); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

// ── useQuery ─────────────────────────────────────────────────────────────────
// Maps Convex query keys to REST endpoints + polling

function resolveQueryUrl(queryKey: string, args: any): string | null {
  if (!queryKey || queryKey === "skip") return null;

  const k = String(queryKey);

  if (k.includes("messages.getBySession")) {
    const sessionId = args?.sessionId;
    if (!sessionId) return null;
    return `${API_BASE}/messages?convexSessionId=${encodeURIComponent(sessionId)}`;
  }
  if (k.includes("sessions.getById")) {
    const id = args?.id;
    if (!id) return null;
    return `${API_BASE}/sessions/${encodeURIComponent(id)}`;
  }
  if (k.includes("sessions.getBySessionId")) {
    const sessionId = args?.sessionId;
    if (!sessionId) return null;
    return `${API_BASE}/session-by-sid?sessionId=${encodeURIComponent(sessionId)}`;
  }
  if (k.includes("usage.getByUserId") || k.includes("usage.get")) {
    return `${API_BASE}/usage`;
  }
  if (k.includes("images.getBySession")) {
    const sessionId = args?.sessionId;
    if (!sessionId) return null;
    return `${API_BASE}/images?sessionId=${encodeURIComponent(sessionId)}`;
  }
  if (k.includes("audios.getBySession") || k.includes("audios.list")) {
    const sessionId = args?.sessionId;
    if (!sessionId) return null;
    return `${API_BASE}/audios?sessionId=${encodeURIComponent(sessionId)}`;
  }
  if (k.includes("videos.getBySession") || k.includes("videos.list")) {
    const sessionId = args?.sessionId;
    if (!sessionId) return null;
    return `${API_BASE}/videos?sessionId=${encodeURIComponent(sessionId)}`;
  }
  if (k.includes("storage.getUrl") || k.includes("getUrl")) {
    const storageId = args?.storageId;
    if (!storageId) return null;
    return `${API_BASE}/storage-url?storageId=${encodeURIComponent(storageId)}`;
  }
  return null;
}

export function useQuery(queryFn: any, args?: any): any {
  const queryKey = String(queryFn ?? "");
  const argsKey = JSON.stringify(args);
  const [data, setData] = useState<any>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetch_ = useCallback(async () => {
    if (args === "skip") return;
    const url = resolveQueryUrl(queryKey, args);
    if (!url) return;
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok && mountedRef.current) {
        const json = await res.json();
        setData(json);
      }
    } catch { /* ignore */ }
  }, [queryKey, argsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetch_();
    timerRef.current = setInterval(fetch_, 3000);
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch_]);

  return data;
}

// ── useMutation ───────────────────────────────────────────────────────────────
// Maps Convex mutation keys to REST POST endpoints

function resolveMutationUrl(mutationKey: string): string | null {
  const k = String(mutationKey);
  if (k.includes("messages.add")) return `${API_BASE}/messages/add`;
  if (k.includes("messages.remove") || k.includes("messages.delete")) return `${API_BASE}/messages/remove`;
  if (k.includes("messages.clearBySession")) return `${API_BASE}/messages/clear`;
  if (k.includes("sessions.update")) return `${API_BASE}/sessions/update`;
  if (k.includes("images.create")) return `${API_BASE}/images/create`;
  if (k.includes("images.startGeneration")) return `${API_BASE}/images/start-generation`;
  if (k.includes("images.deleteImage") || k.includes("images.delete")) return `${API_BASE}/images/delete`;
  if (k.includes("audios.create")) return `${API_BASE}/audios/create`;
  if (k.includes("audios.deleteAudio") || k.includes("audios.delete")) return `${API_BASE}/audios/delete`;
  if (k.includes("videos.create")) return `${API_BASE}/videos/create`;
  if (k.includes("videos.deleteVideo") || k.includes("videos.delete")) return `${API_BASE}/videos/delete`;
  if (k.includes("usage.createUser")) return `${API_BASE}/usage/create-user`;
  if (k.includes("usage.updateUserProfile")) return `${API_BASE}/usage/update-profile`;
  if (k.includes("sessions.rename") || k.includes("sessions.updateName")) return `${API_BASE}/sessions/rename`;
  return null;
}

export function useMutation(mutationFn: any): (args?: any) => Promise<any> {
  const mutationKey = String(mutationFn ?? "");
  return useCallback(async (args?: any) => {
    const url = resolveMutationUrl(mutationKey);
    if (!url) return null;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(args ?? {}),
      });
      if (res.ok) return res.json();
    } catch { /* ignore */ }
    return null;
  }, [mutationKey]);
}

export function useAction(actionFn: any): (args?: any) => Promise<any> {
  return useCallback(async (_args?: any) => null, []);
}

export function usePaginatedQuery(_queryFn: any, _args?: any, _opts?: any) {
  return { results: [], status: "Exhausted" as const, loadMore: () => {} };
}
