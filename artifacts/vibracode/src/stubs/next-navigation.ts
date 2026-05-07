import { useLocation } from "wouter";

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

export function useParams(): Record<string, string> {
  const [location] = useLocation();
  const segments = location.split("/").filter(Boolean);
  const params: Record<string, string> = {};
  const knownRoutes: Array<{ pattern: string[]; paramNames: string[] }> = [
    { pattern: ["session"], paramNames: ["id"] },
    { pattern: ["sessions"], paramNames: [] },
    { pattern: ["blog"], paramNames: ["slug"] },
  ];
  for (const route of knownRoutes) {
    const routeLen = route.pattern.length + route.paramNames.length;
    if (segments.length >= routeLen && route.paramNames.length > 0) {
      const prefix = route.pattern;
      const matches = prefix.every((seg, i) => segments[i] === seg);
      if (matches) {
        route.paramNames.forEach((name, i) => {
          params[name] = segments[prefix.length + i] ?? "";
        });
        return params;
      }
    }
  }
  if (segments.length >= 2) {
    params["id"] = segments[segments.length - 1];
  }
  return params;
}

export function notFound() {
  throw new Error("Not found");
}

export function redirect(url: string) {
  window.location.href = url;
}
