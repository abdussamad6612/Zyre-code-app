import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function SessionPage({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [previewWidth, setPreviewWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    const newPreviewWidth = ((containerWidth - mouseX) / containerWidth) * 100;
    const minPreviewWidthPx = 400;
    const minPreviewWidthPercent = (minPreviewWidthPx / containerWidth) * 100;
    const clampedWidth = Math.max(minPreviewWidthPercent, Math.min(80, newPreviewWidth));
    setPreviewWidth(clampedWidth);
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

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-3 p-2 sm:p-4 mt-16 overflow-hidden">
      {/* Chat panel */}
      <div
        className="flex-1 min-w-0 max-w-full h-[50%] lg:h-full overflow-x-hidden flex flex-col border border-border rounded-lg bg-card"
        style={{ width: `${100 - previewWidth}%` }}
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground">Session: {id}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
          <div>
            <p className="font-medium mb-2">Session Active</p>
            <p className="text-xs">Connect your Convex backend to see messages here.</p>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="hidden lg:block w-1 hover:w-2 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex-shrink-0 relative group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Preview panel */}
      <div
        className="flex-shrink-0 h-[50%] lg:h-full border border-border rounded-lg bg-card flex items-center justify-center"
        style={{ width: `${previewWidth}%` }}
      >
        <div className="text-center text-muted-foreground text-sm p-4">
          <div className="w-16 h-16 rounded-full border-2 border-muted mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <p className="font-medium">App Preview</p>
          <p className="text-xs mt-1">Your generated app will appear here</p>
        </div>
      </div>
    </div>
  );
}
