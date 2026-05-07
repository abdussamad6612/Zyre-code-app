import React, { useState, useMemo, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Search, Code } from 'lucide-react';
import { FeatureCard } from '@/components/ui/grid-feature-cards';
import { CustomLoader } from '@/components/ui/custom-loader';
import { useLocation } from 'wouter';
import { useAuth, getSessionToken } from '@/providers/auth-provider';

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

interface Session {
  id: string;
  name: string;
  _creationTime: number;
  status?: string;
  templateId?: string;
}

type ViewAnimationProps = {
  delay?: number;
  className?: React.ComponentProps<typeof motion.div>['className'];
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function SessionsPage() {
  const { isSignedIn, user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const token = getSessionToken();
    if (!token) return;

    setIsLoading(true);
    fetch(`${API_BASE}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : { sessions: [] })
      .then(data => {
        if (Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        } else if (Array.isArray(data)) {
          setSessions(data);
        }
      })
      .catch(() => setSessions([]))
      .finally(() => setIsLoading(false));
  }, [isSignedIn, user]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) =>
      session.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  const handleSessionClick = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <CustomLoader text="Loading" className="h-full" />
      </div>
    );
  }

  return (
    <section className="py-16 md:py-32 pt-20">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold">
            Your Sessions
          </h2>
          <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
            Manage and access your development sessions
          </p>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
        >
          {filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FeatureCard
                feature={{
                  title: session.name || `Session ${session.id.slice(0, 8)}`,
                  icon: Code,
                  description: `Created: ${formatDate(session._creationTime)}`
                }}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSessionClick(session.id)}
              />
            </motion.div>
          ))}
        </AnimatedContainer>

        {filteredSessions.length === 0 && (
          <AnimatedContainer delay={0.6} className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No sessions found matching your search."
                : isSignedIn
                  ? "No sessions yet. Create your first app from the home page!"
                  : "Sign in to view your sessions."}
            </p>
            {!isSignedIn && (
              <motion.a
                href="/"
                className="mt-4 inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Go Home
              </motion.a>
            )}
          </AnimatedContainer>
        )}
      </div>
    </section>
  );
}
