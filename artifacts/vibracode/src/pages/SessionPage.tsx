import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth, getSessionToken } from "@/providers/auth-provider";
import { LeftSidebar } from "@/components/session/left-sidebar";
import Chat from "@/components/chat";
import Preview from "@/components/preview";
import { cn } from "@/lib/utils";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toConvexSession(data: any): any {
  if (!data) return null;
  return {
    _id: data.id ?? data._id ?? "",
    _creationTime: data._creationTime ?? data.creationTime ?? Date.now(),
    sessionId: data.id ?? data.sessionId ?? "",
    name: data.name ?? "",
    status: data.status ?? "RUNNING",
    statusMessage: data.statusMessage ?? "",
    messages: data.messages ?? [],
    tunnelUrl: data.previewUrl ?? data.tunnelUrl ?? "",
    previewUrl: data.previewUrl ?? data.tunnelUrl ?? "",
    repository: data.repository ?? null,
    githubRepository: data.repository ?? data.githubRepository ?? null,
    githubRepositoryUrl: data.githubRepositoryUrl ?? (data.repository ? `https://github.com/${data.repository}` : null),
    pullRequestUrl: data.pullRequest?.html_url ?? data.pullRequestUrl ?? null,
    pullRequestNumber: data.pullRequest?.number ?? data.pullRequestNumber ?? null,
    envs: data.envs ?? {},
    templateId: data.templateId ?? null,
    createdBy: data.userId ?? "",
    userId: data.userId ?? "",
  };
}

export default function SessionPage({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const { isSignedIn } = useAuth();

  const [session, setSession] = useState<any>(undefined);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const sendMessageRef = useRef<((message: string) => void) | null>(null);
  const addToPromptRef = useRef<((text: string) => void) | null>(null);
  const addImageToChatRef = useRef<((file: File) => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSession = useCallback(async () => {
    const token = getSessionToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSession(toConvexSession(data));
      } else if (res.status === 404) {
        setSession(null);
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetchSession();
    pollRef.current = setInterval(fetchSession, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isSignedIn, fetchSession]);

  const resumeSession = useCallback(async (sessionId: string) => {
    setIsResuming(true);
    setResumeError(null);
    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE}/session/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to resume session");
      }
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Failed to resume session");
      setShowError(true);
    } finally {
      setIsResuming(false);
    }
  }, []);

  useEffect(() => {
    const sessionId = session?.sessionId;
    if (sessionId && !hasMountedRef.current) {
      hasMountedRef.current = true;
      resumeSession(sessionId);
    }
  }, [session?.sessionId, resumeSession]);

  useEffect(() => {
    if (resumeError && hasMountedRef.current && !isResuming) {
      setShowError(true);
    }
  }, [resumeError, isResuming]);

  const handleSidebarExpandedChange = useCallback((expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    if (sendMessageRef.current) sendMessageRef.current(message);
  }, []);

  const handleAddToPrompt = useCallback((text: string) => {
    if (addToPromptRef.current) addToPromptRef.current(text);
  }, []);

  const handleAddImageToChat = useCallback((file: File) => {
    if (addImageToChatRef.current) addImageToChatRef.current(file);
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const newW = ((rect.width - mouseX) / rect.width) * 100;
    const minPct = (400 / rect.width) * 100;
    setPreviewWidth(Math.max(minPct, Math.min(80, newW)));
  }, [isDragging]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (isResuming) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center mt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Resuming session...</p>
        </div>
      </div>
    );
  }

  if (showError && resumeError) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center mt-20">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">Failed to resume session</p>
            <p className="text-sm text-muted-foreground">{resumeError}</p>
          </div>
          <button
            onClick={() => {
              setShowError(false);
              hasMountedRef.current = false;
              if (session?.sessionId) {
                hasMountedRef.current = true;
                resumeSession(session.sessionId);
              }
            }}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200 shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center mt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center mt-20">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">Session not found</p>
            <p className="text-sm text-muted-foreground">
              The session you're looking for doesn't exist or has been deleted.
            </p>
            <p className="text-xs text-muted-foreground/60 font-mono">ID: {id}</p>
          </div>
          <button
            onClick={() => navigate("/sessions")}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200 shadow-sm"
          >
            View All Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-3 p-2 sm:p-4 mt-16 overflow-hidden"
    >
      <LeftSidebar
        session={session}
        onExpandedChange={handleSidebarExpandedChange}
        onSendMessage={handleSendMessage}
        onAddToPrompt={handleAddToPrompt}
        onAddImageToChat={handleAddImageToChat}
      />

      <div
        className={cn(
          "flex-1 min-w-0 max-w-full h-[50%] lg:h-full overflow-x-hidden",
          isSidebarExpanded && "lg:hidden"
        )}
        style={{ width: `${100 - previewWidth}%` }}
      >
        <Chat
          session={session}
          onSendMessageRef={sendMessageRef}
          onAddToPromptRef={addToPromptRef}
          onAddImageToChat={addImageToChatRef}
        />
      </div>

      <div
        className="hidden lg:block w-1 hover:w-2 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex-shrink-0 relative group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      <div
        className="flex-shrink-0 h-[50%] lg:h-full"
        style={{ width: `${previewWidth}%` }}
      >
        <Preview session={session} previewWidth={previewWidth} />
      </div>
    </div>
  );
}
