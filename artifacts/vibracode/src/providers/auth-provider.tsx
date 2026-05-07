import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const SESSION_TOKEN_KEY = "vibracode_session_token";

interface AuthUser {
  id: string;
  name: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: AuthUser | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoaded: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const usernameFromUrl = urlParams.get("username");
    if (tokenFromUrl) {
      localStorage.setItem(SESSION_TOKEN_KEY, tokenFromUrl);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("token");
      newUrl.searchParams.delete("username");
      window.history.replaceState({}, "", newUrl.toString());
    }

    const token = tokenFromUrl || localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      setIsLoaded(true);
      return;
    }

    fetch(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name || data.user.username || "User",
            username: data.user.username,
          });
          setIsSignedIn(true);
        } else {
          localStorage.removeItem(SESSION_TOKEN_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  const signIn = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  const signOut = () => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      fetch(`${API_BASE}/auth/signout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
    setIsSignedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoaded, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}
