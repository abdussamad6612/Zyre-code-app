import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth, getSessionToken } from "@/providers/auth-provider";
import { runAgentAction } from "@/stubs/app-actions";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface SessionData {
  id: string;
  name?: string;
  status?: string;
  previewUrl?: string;
}

export default function SessionPage({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const { user, isSignedIn } = useAuth();
  const [previewWidth, setPreviewWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const token = getSessionToken();
    if (!token) return;

    fetch(`${API_BASE}/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSessionData(data);
          if (data.previewUrl) setPreviewUrl(data.previewUrl);
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      })
      .catch(() => {});
  }, [id, isSignedIn]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const newPreviewWidth = ((containerRect.width - mouseX) / containerRect.width) * 100;
    const minPx = 400;
    const minPct = (minPx / containerRect.width) * 100;
    setPreviewWidth(Math.max(minPct, Math.min(80, newPreviewWidth)));
  }, [isDragging]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !user) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      createdAt: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);
    try {
      await runAgentAction({
        sessionId: id,
        id: userMsg.id,
        message: userMsg.content,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row h-[calc(100vh-64px)] gap-2 p-2 mt-16 overflow-hidden">
      {/* Chat panel */}
      <div
        className="flex-1 min-w-0 h-[50%] lg:h-full flex flex-col border border-border rounded-lg bg-card overflow-hidden"
        style={{ width: `${100 - previewWidth}%` }}
      >
        <div className="p-3 border-b border-border flex items-center gap-2">
          <button onClick={() => navigate("/sessions")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Sessions</button>
          <span className="text-xs text-muted-foreground">|</span>
          <h2 className="text-xs font-medium text-muted-foreground truncate">
            {sessionData?.name || `Session ${id.slice(0, 8)}`}
          </h2>
          {sessionData?.status && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {sessionData.status}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center p-4">
              <div>
                <p className="font-medium mb-1">Session started</p>
                <p className="text-xs">Send a message to start building your app</p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Building...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a change or feature..."
              className="flex-1 text-sm"
              disabled={isSending}
            />
            <Button size="sm" onClick={handleSend} disabled={isSending || !inputValue.trim()}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="hidden lg:block w-1 hover:w-2 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex-shrink-0 relative"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Preview panel */}
      <div
        className="flex-shrink-0 h-[50%] lg:h-full border border-border rounded-lg bg-card overflow-hidden"
        style={{ width: `${previewWidth}%` }}
      >
        {previewUrl ? (
          <iframe
            src={`${API_BASE}/preview-proxy?url=${encodeURIComponent(previewUrl)}`}
            className="w-full h-full border-0"
            title="App Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground text-sm p-4">
            <div>
              <div className="w-16 h-16 rounded-full border-2 border-muted mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <p className="font-medium">App Preview</p>
              <p className="text-xs mt-1">Your generated app will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
