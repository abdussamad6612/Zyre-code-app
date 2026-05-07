"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { HeroWave } from "@/components/ui/ai-input-hero";
import { Footer } from "@/components/ui/footer";
import { templates } from "@/config";
import { useAuth } from "@/providers/auth-provider";

const PENDING_PROMPT_KEY = "vibra_pending_prompt";

// Stub for Repo type
interface Repo {
  full_name: string;
}

export default function HomePage() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [, navigate] = useLocation();
  const hasCheckedPendingPrompt = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasCheckedPendingPrompt.current) {
      hasCheckedPendingPrompt.current = true;
      const pendingPrompt = localStorage.getItem(PENDING_PROMPT_KEY);
      if (pendingPrompt) {
        setInitialPrompt(pendingPrompt);
        localStorage.removeItem(PENDING_PROMPT_KEY);
      }
    }
  }, [isLoaded, isSignedIn]);

  const sampleTestimonials: Testimonial[] = [
    {
      avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
      name: "Sarah Chen",
      handle: "@sarahdigital",
      text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
      name: "Marcus Johnson",
      handle: "@marcustech",
      text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "David Martinez",
      handle: "@davidcreates",
      text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
    },
  ];

  const handleChatSubmit = useCallback(async (message: string, repository?: Repo, imageData?: any, templateId?: string) => {
    if (!isSignedIn) {
      localStorage.setItem(PENDING_PROMPT_KEY, message);
      setIsSignInOpen(true);
      return;
    }
    // Navigate to a placeholder session page (real backend would create session)
    navigate("/sessions");
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <SignInPage
        testimonials={sampleTestimonials}
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
      <div className="flex-1">
        <HeroWave
          title="Create your next mobile masterpiece"
          subtitle="The AI Mobile App Builder. Create iOS and Android apps instantly"
          placeholder="Describe the mobile app you want to create..."
          buttonText="Build Mobile App"
          onPromptSubmit={handleChatSubmit}
          initialPrompt={initialPrompt}
        />
      </div>
      <Footer />
    </div>
  );
}
