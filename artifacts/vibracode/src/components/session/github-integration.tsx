"use client";

import { useState } from "react";
import { Github, ExternalLink, Check, Loader2, Plus, RotateCcw, Lock, Globe, ChevronDown, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GitHubIntegrationProps {
  session: any;
}

export function GitHubIntegration({ session }: GitHubIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const handleConnect = async () => {
    toast.info("GitHub integration requires Clerk authentication to be configured.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
          <Github className="h-3.5 w-3.5" />
          GitHub
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-4 bg-[#1a1a1a] border border-white/10" align="end">
        <DropdownMenuLabel className="text-white font-medium mb-2">GitHub Integration</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10 mb-3" />
        <p className="text-xs text-gray-400 mb-3">Connect your session to a GitHub repository to push your code.</p>
        <div className="space-y-2">
          <Input
            placeholder="repository-name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="bg-white/5 border-white/20 text-white text-xs"
          />
          <Button onClick={handleConnect} disabled={isLoading} className="w-full text-xs" size="sm">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
            Connect Repository
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
