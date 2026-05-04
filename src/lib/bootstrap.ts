import {
  applyResolvedTheme,
  cacheSchoolDefaultTheme,
  getBootstrapThemeState,
  isResolvedTheme,
  readStoredThemePreference,
} from "./theme";

export interface AppBootstrapPayload {
  school?: {
    defaultTheme?: string;
    [key: string]: unknown;
  };
  settings?: unknown;
  teachers?: unknown[];
  alumni?: unknown[];
  yearbooks?: unknown[];
}

declare global {
  interface Window {
    __MEMORIA_BOOTSTRAP__?: AppBootstrapPayload;
  }
}

async function fetchBootstrapWithTimeout(timeoutMs: number): Promise<AppBootstrapPayload | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("/api/bootstrap", {
      method: "GET",
      signal: controller.signal,
    });

    if (!res.ok) return null;
    return (await res.json()) as AppBootstrapPayload;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function preloadBootstrap(timeoutMs = 1500) {
  if (typeof window === "undefined") return;

  const data = await fetchBootstrapWithTimeout(timeoutMs);
  if (!data) return;

  window.__MEMORIA_BOOTSTRAP__ = data;

  const schoolDefaultTheme = data.school?.defaultTheme;
  if (!isResolvedTheme(schoolDefaultTheme)) return;

  cacheSchoolDefaultTheme(window.localStorage, schoolDefaultTheme);

  // Only re-apply the theme eagerly for visitors without an explicit preference.
  if (readStoredThemePreference(window.localStorage) !== null) return;

  const prefersDark =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const state = getBootstrapThemeState(window.localStorage, prefersDark);
  applyResolvedTheme(document.documentElement, state.resolvedTheme);
}
