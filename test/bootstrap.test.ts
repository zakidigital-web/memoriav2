import { afterEach, describe, expect, it, vi } from "vitest";
import { preloadBootstrap } from "../src/lib/bootstrap";

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

function installBrowserStubs(storage = new MemoryStorage()) {
  const added: string[] = [];
  const removed: string[] = [];
  const documentElement = {
    classList: {
      add: (value: string) => added.push(value),
      remove: (value: string) => removed.push(value),
    },
    style: {
      colorScheme: "",
    },
  };

  vi.stubGlobal("window", {
    localStorage: storage,
    setTimeout,
    clearTimeout,
    matchMedia: () => ({ matches: false }),
  });

  vi.stubGlobal("document", { documentElement });

  return { storage, documentElement, added, removed };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("bootstrap preload", () => {
  it("caches and applies school default theme for first visit", async () => {
    const { storage, documentElement, added } = installBrowserStubs();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ school: { defaultTheme: "dark" } }),
      })
    );

    await preloadBootstrap(50);

    expect(storage.getItem("memoria_school_theme_default")).toBe("dark");
    expect(documentElement.style.colorScheme).toBe("dark");
    expect(added).toContain("dark");
  });

  it("does not override explicit user preference while still caching school default", async () => {
    const { storage, documentElement, added, removed } = installBrowserStubs(
      new MemoryStorage({ memoria_theme_mode: "light" })
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ school: { defaultTheme: "dark" } }),
      })
    );

    await preloadBootstrap(50);

    expect(storage.getItem("memoria_school_theme_default")).toBe("dark");
    expect(documentElement.style.colorScheme).toBe("");
    expect(added).toEqual([]);
    expect(removed).toEqual([]);
  });
});
