import React, { createContext, useContext, useState } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
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
  isLoaded: true,
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = () => {
    setIsSignedIn(true);
    setUser({ id: "demo-user", name: "Demo User", email: "demo@example.com" });
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoaded: true, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
