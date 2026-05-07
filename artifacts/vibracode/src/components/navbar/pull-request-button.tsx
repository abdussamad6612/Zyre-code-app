"use client";

import { useState, useCallback } from "react";
import { Link } from "wouter";
import { GitPullRequest, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PullRequestButtonProps {
  sessionId: string;
  sessionData: {
    sessionId?: string;
    repository?: string;
    pullRequest?: any;
    status: string;
  };
  isHome: boolean;
}

export function PullRequestButton({ sessionId, sessionData, isHome }: PullRequestButtonProps) {
  const [isCreatingPullRequest, setIsCreatingPullRequest] = useState<boolean>(false);

  const handleCreatePullRequest = useCallback(async () => {
    if (!sessionData.sessionId || !sessionData.repository) return;
    setIsCreatingPullRequest(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
    } finally {
      setIsCreatingPullRequest(false);
    }
  }, [sessionData, sessionId]);

  if (sessionData.pullRequest && !isHome) {
    return (
      <a href={sessionData.pullRequest.html_url} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="h-8">
          <GitPullRequest />
          View Pull Request
        </Button>
      </a>
    );
  }

  if (!sessionData.pullRequest && !isHome) {
    return (
      <Button variant="outline" className="h-8" onClick={handleCreatePullRequest} disabled={isCreatingPullRequest || sessionData.status !== "RUNNING"}>
        {isCreatingPullRequest ? <Loader className="animate-spin" /> : <GitPullRequest />}
        Create Pull Request
      </Button>
    );
  }

  return null;
}
