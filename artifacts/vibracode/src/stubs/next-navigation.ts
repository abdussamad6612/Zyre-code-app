import { useLocation } from "wouter";
import { useCallback } from "react";

export function useRouter() {
  const [, navigate] = useLocation();
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function usePathname() {
  const [location] = useLocation();
  return location;
}

export function useSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return [params, () => {}] as const;
}

export function useParams() {
  return {};
}

export function notFound() {
  throw new Error("Not found");
}

export function redirect(url: string) {
  window.location.href = url;
}
