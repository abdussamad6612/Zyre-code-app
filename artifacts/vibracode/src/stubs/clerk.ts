import { useContext, createContext } from "react";

// Re-export the auth context so useUser() returns real data from AuthProvider
// This file is aliased for @clerk/nextjs and @clerk/nextjs/server

// We read the same context key used by AuthProvider
const AUTH_STORAGE_KEY = "vibracode_session_token";

// Lazy context bridge — reads from window.__vibra_auth if set by AuthProvider
function getAuthState() {
  try {
    const w = window as any;
    return w.__vibra_auth || { user: null, isSignedIn: false, isLoaded: true };
  } catch {
    return { user: null, isSignedIn: false, isLoaded: true };
  }
}

import { useState, useEffect } from "react";

export function useUser() {
  const [state, setState] = useState(getAuthState);

  useEffect(() => {
    const handler = () => setState(getAuthState());
    window.addEventListener("vibra_auth_change", handler);
    return () => window.removeEventListener("vibra_auth_change", handler);
  }, []);

  const authUser = state.user;
  const clerkUser = authUser
    ? {
        id: authUser.id,
        username: authUser.username,
        fullName: authUser.name,
        firstName: authUser.name?.split(" ")[0] || authUser.username,
        imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${authUser.username}`,
        emailAddresses: authUser.email
          ? [{ emailAddress: authUser.email }]
          : [],
      }
    : null;

  return {
    user: clerkUser,
    isLoaded: state.isLoaded,
    isSignedIn: state.isSignedIn,
  };
}

export function useSignIn() { return { signIn: null, isLoaded: true }; }
export function useSignUp() { return { signUp: null, isLoaded: true }; }
export function UserButton({ ...props }: any) { return null; }
export function SignInButton({ children, ...props }: any) { return children; }
export function ClerkProvider({ children }: { children: any }) { return children; }
export function useAuth() {
  const { isSignedIn, isLoaded } = useUser();
  return { isSignedIn, isLoaded, userId: null };
}
