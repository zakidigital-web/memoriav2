export type ThemeMode = "system" | "light" | "dark";
export type ThemePreference = ThemeMode | null;
export type ResolvedTheme = "light" | "dark";

export const THEME_MODE_STORAGE_KEY = "memoria_theme_mode";
export const LEGACY_THEME_STORAGE_KEY = "memoria_theme";
export const SCHOOL_DEFAULT_THEME_STORAGE_KEY = "memoria_school_theme_default";

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem" | "removeItem">;

export function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === "light" || value === "dark";
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || isResolvedTheme(value);
}

export function readStoredThemePreference(storage?: StorageReader | null): ThemePreference {
  if (!storage) return null;
  try {
    const storedMode = storage.getItem(THEME_MODE_STORAGE_KEY);
    if (isThemeMode(storedMode)) return storedMode;

    const legacyTheme = storage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (isResolvedTheme(legacyTheme)) return legacyTheme;
  } catch {
    return null;
  }
  return null;
}

export function readStoredSchoolDefaultTheme(storage?: StorageReader | null): ResolvedTheme | null {
  if (!storage) return null;
  try {
    const storedTheme = storage.getItem(SCHOOL_DEFAULT_THEME_STORAGE_KEY);
    return isResolvedTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

export function getEffectiveThemeMode(
  themePreference: ThemePreference,
  schoolDefaultTheme: ResolvedTheme | null
): ThemeMode {
  return themePreference ?? schoolDefaultTheme ?? "system";
}

export function mergeThemePreference(
  localPreference: ThemePreference,
  remotePreference: ThemePreference | undefined
): ThemePreference {
  if (remotePreference == null) return localPreference;
  return remotePreference;
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }
  return mode;
}

export function getBootstrapThemeState(storage: StorageReader | null | undefined, prefersDark: boolean) {
  const themePreference = readStoredThemePreference(storage);
  const schoolDefaultTheme = readStoredSchoolDefaultTheme(storage);
  const themeMode = getEffectiveThemeMode(themePreference, schoolDefaultTheme);
  return {
    themePreference,
    schoolDefaultTheme,
    themeMode,
    resolvedTheme: resolveTheme(themeMode, prefersDark),
  };
}

export function writeThemePreference(storage: StorageWriter | null | undefined, themePreference: ThemePreference) {
  if (!storage) return;
  try {
    if (themePreference) {
      storage.setItem(THEME_MODE_STORAGE_KEY, themePreference);
      return;
    }
    storage.removeItem(THEME_MODE_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to write theme preference to storage", error);
  }
}

export function writeResolvedTheme(storage: Pick<Storage, "setItem"> | null | undefined, theme: ResolvedTheme) {
  if (!storage) return;
  try {
    storage.setItem(LEGACY_THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to write resolved theme to storage", error);
  }
}

export function cacheSchoolDefaultTheme(
  storage: Pick<Storage, "setItem"> | null | undefined,
  theme: ResolvedTheme
) {
  if (!storage) return;
  try {
    storage.setItem(SCHOOL_DEFAULT_THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to write school default theme to storage", error);
  }
}

export function applyResolvedTheme(
  root: Pick<HTMLElement, "classList" | "style">,
  resolvedTheme: ResolvedTheme
) {
  if (resolvedTheme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    return;
  }

  root.classList.remove("dark");
  root.style.colorScheme = "light";
}
