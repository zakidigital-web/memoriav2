import { describe, expect, it } from "vitest";
import {
  applyResolvedTheme,
  getBootstrapThemeState,
  getEffectiveThemeMode,
  mergeThemePreference,
  readStoredSchoolDefaultTheme,
  readStoredThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from "../src/lib/theme";

class MemoryStorage {
  private values = new Map<string, string>();

  constructor(seed?: Record<string, string>) {
    if (seed) {
      Object.entries(seed).forEach(([key, value]) => this.values.set(key, value));
    }
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("theme utilities", () => {
  it("returns null when no explicit user preference exists", () => {
    const storage = new MemoryStorage();
    expect(readStoredThemePreference(storage)).toBeNull();
  });

  it("migrates legacy resolved theme to an explicit preference", () => {
    const storage = new MemoryStorage({ memoria_theme: "dark" });
    expect(readStoredThemePreference(storage)).toBe("dark");
  });

  it("reads cached school default theme separately from user preference", () => {
    const storage = new MemoryStorage({ memoria_school_theme_default: "dark" });
    expect(readStoredSchoolDefaultTheme(storage)).toBe("dark");
    expect(readStoredThemePreference(storage)).toBeNull();
  });

  it("uses school default only when user preference does not exist", () => {
    expect(getEffectiveThemeMode(null, "dark")).toBe("dark");
    expect(getEffectiveThemeMode("system", "dark")).toBe("system");
  });

  it("resolves system mode from browser preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("preserves local preference when remote preference is missing", () => {
    const localPreference: ThemePreference = "dark";
    expect(mergeThemePreference(localPreference, null)).toBe("dark");
    expect(mergeThemePreference(localPreference, undefined)).toBe("dark");
    expect(mergeThemePreference(localPreference, "system")).toBe("system");
  });

  it("removes persisted preference when there is no explicit override", () => {
    const storage = new MemoryStorage({ memoria_theme_mode: "light" });
    writeThemePreference(storage, null);
    expect(storage.getItem("memoria_theme_mode")).toBeNull();
  });
});

describe("theme flow integration", () => {
  it("applies cached school default for new visitors before React mounts", () => {
    const storage = new MemoryStorage({ memoria_school_theme_default: "dark" });
    const state = getBootstrapThemeState(storage, false);
    expect(state.themePreference).toBeNull();
    expect(state.themeMode).toBe("dark");
    expect(state.resolvedTheme).toBe("dark");
  });

  it("keeps explicit system mode independent from school default", () => {
    const storage = new MemoryStorage({
      memoria_theme_mode: "system",
      memoria_school_theme_default: "dark",
    });
    const state = getBootstrapThemeState(storage, false);
    expect(state.themeMode).toBe("system");
    expect(state.resolvedTheme).toBe("light");
  });

  it("applies resolved theme to the document root", () => {
    const added: string[] = [];
    const removed: string[] = [];
    const root = {
      classList: {
        add: (value: string) => added.push(value),
        remove: (value: string) => removed.push(value),
      },
      style: {
        colorScheme: "",
      },
    } as any;

    applyResolvedTheme(root, "dark");
    expect(added).toContain("dark");
    expect(root.style.colorScheme).toBe("dark");

    applyResolvedTheme(root, "light");
    expect(removed).toContain("dark");
    expect(root.style.colorScheme).toBe("light");
  });
});
