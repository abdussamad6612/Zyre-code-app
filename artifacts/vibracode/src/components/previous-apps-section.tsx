"use client";

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectHighlightCard from "@/components/ui/project-highlight-card";
import { useAuth } from "@/providers/auth-provider";

function AppCard({
  session,
  onSelect,
}: {
  session: {
    id: string;
    name: string;
    status: string;
    _creationTime: number;
    templateId?: string;
  };
  onSelect: (id: string) => void;
}) {
  return (
    <ProjectHighlightCard
      title={session.name}
      templateId={session.templateId}
      createdAt={session._creationTime}
      onClick={() => onSelect(session.id)}
    />
  );
}

export function PreviousAppsSection() {
  const { isSignedIn } = useAuth();
  const [, navigate] = useLocation();

  const sessions: any[] = [];

  if (!isSignedIn) return null;
  if (!sessions || sessions.length === 0) return null;

  const handleSelect = (id: string) => {
    navigate(`/session/${id}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Previous Apps</h2>
        <p className="text-sm text-muted-foreground">Continue where you left off</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sessions.slice(0, 6).map((session: any) => (
          <AppCard key={session.id} session={session} onSelect={handleSelect} />
        ))}
      </div>
      {sessions.length > 6 && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => navigate("/sessions")}>
            View All Sessions
          </Button>
        </div>
      )}
    </div>
  );
}
