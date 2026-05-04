import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alumni, Teacher, Yearbook } from "./types";
import { supabase } from "./supabaseClient";
import type { AppBootstrapPayload } from "./lib/bootstrap";
import {
  applyResolvedTheme,
  cacheSchoolDefaultTheme,
  getEffectiveThemeMode,
  mergeThemePreference,
  readStoredSchoolDefaultTheme,
  readStoredThemePreference,
  resolveTheme,
  writeResolvedTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemeMode,
  type ThemePreference,
} from "./lib/theme";

interface AppContextType {
  alumni: Alumni[];
  teachers: Teacher[];
  yearbooks: Yearbook[];
  isAdmin: boolean;
  user: { id: string; email: string | null; username: string | null } | null;
  authReady: boolean;
  dataReady: boolean;
  dbConnected: boolean;
  requiresPasswordChange: boolean;
  setRequiresPasswordChange: (val: boolean) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; offline?: boolean }>;
  logout: () => Promise<void>;
  addAlumni: (data: Alumni) => Promise<void>;
  updateAlumni: (id: string, data: Alumni) => Promise<void>;
  deleteAlumni: (id: string) => Promise<void>;
  addTeacher: (data: Teacher) => Promise<void>;
  updateTeacher: (id: string, data: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addYearbook: (data: Yearbook & { pdfUrl?: string }) => Promise<void>;
  updateYearbook: (id: string, data: Partial<Yearbook & { pdfUrl?: string }>) => Promise<void>;
  deleteYearbook: (id: string) => Promise<void>;
  fetchYearbook: (id: string) => Promise<Yearbook | null>;
  schoolInfo: any;
  updateSchoolInfo: (data: any) => Promise<void>;
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setTheme: (theme: "light" | "dark") => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  yearbookSettings: any;
  updateYearbookSettings: (data: any) => Promise<void>;
  primaryColor: string;
  setPrimaryColor: (color: string) => Promise<void>;
  isAlumniVisible: boolean;
  setIsAlumniVisible: (visible: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [yearbooks, setYearbooks] = useState<Yearbook[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string | null; username: string | null } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState<any>({
    name: "SMP Negeri 1 Jakarta",
    logo: "",
    favicon: "",
    tagline: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    defaultTheme:
      typeof window !== "undefined" ? readStoredSchoolDefaultTheme(window.localStorage) ?? "light" : "light",
    history: "Didirikan pada tahun 1950...",
    vision: "Menjadi sekolah unggulan dalam IPTEK dan IMTAK.",
    mission: "1. Meningkatkan kualitas pembelajaran...",
    facilities: "Lab Komputer, Perpustakaan Digital, GOR.",
  });

  const [yearbookSettings, setYearbookSettings] = useState<any>({
    sortBy: "year-desc",
    gridColumns: 4,
    showStudentCount: true,
  });

  const [primaryColorValue, setPrimaryColorValue] = useState<string>("#2563eb");
  const [isAlumniVisibleValue, setIsAlumniVisibleValue] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(() =>
    typeof window !== "undefined" ? readStoredThemePreference(window.localStorage) : null
  );
  const [schoolDefaultTheme, setSchoolDefaultTheme] = useState<ResolvedTheme | null>(() =>
    typeof window !== "undefined" ? readStoredSchoolDefaultTheme(window.localStorage) : null
  );
  const [theme, setTheme] = useState<ResolvedTheme>(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return "light";
  });
  const hasAppliedThemeOnceRef = useRef(false);
  const themeMode = useMemo(
    () => getEffectiveThemeMode(themePreference, schoolDefaultTheme),
    [themePreference, schoolDefaultTheme]
  );

  const api = useMemo(() => {
    const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const res = await fetch(path, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as any)?.error || `Request failed (${res.status})`);
      }
      return data as T;
    };
    return { request };
  }, [accessToken]);

  const applyBootstrapData = (data: AppBootstrapPayload | null | undefined) => {
    if (!data) return false;
    setAlumni((data.alumni as Alumni[] | undefined) ?? []);
    setTeachers((data.teachers as Teacher[] | undefined) ?? []);
    setYearbooks(((data.yearbooks as any[] | undefined) ?? []).map((y: any) => ({ ...y, pages: [] })));
    if (data.school) {
      setSchoolInfo(data.school);
    }

    const settings = (data.settings as any) ?? {};
    setPrimaryColorValue(settings.primaryColor ?? "#2563eb");
    setIsAlumniVisibleValue(settings.isAlumniVisible ?? true);
    setYearbookSettings(settings.yearbookSettings ?? yearbookSettings);
    setDataReady(true);
    return true;
  };

  const loadBootstrap = async () => {
    if (typeof window !== "undefined" && applyBootstrapData(window.__MEMORIA_BOOTSTRAP__)) {
      return;
    }

    const data = await api.request<any>("/api/bootstrap", { method: "GET" });
    applyBootstrapData(data);
  };

  const syncAdminStatus = async (token?: string | null) => {
    try {
      const data = await api.request<{ isAuthenticated: boolean; isAdmin: boolean; user: any; requiresPasswordChange?: boolean }>("/api/auth/me", {
        method: "GET",
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      setIsAdmin(Boolean(data.isAdmin));
      setUser(data.user ?? null);
      setRequiresPasswordChange(Boolean(data.requiresPasswordChange));
    } catch {
      setIsAdmin(false);
      setUser(null);
    }
    setAuthReady(true);
  };

  useEffect(() => {
    void loadBootstrap().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // Cek koneksi backend DB terlebih dahulu
      let connected = true;
      try {
        const health = await fetch("/api/health").then(r => r.json());
        connected = health?.dbConnected ?? false;
      } catch {
        connected = false;
      }
      if (!cancelled) setDbConnected(connected);

      if (!connected) {
        // Offline Mode / Fallback DB down
        const isOfflineAdmin = sessionStorage.getItem("offline_admin") === "true";
        if (!cancelled) {
          if (isOfflineAdmin) {
            setIsAdmin(true);
            setUser({ id: "offline", email: null, username: "admin" });
          }
          setAuthReady(true);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const token = data.session?.access_token ?? null;
      setAccessToken(token);
      await syncAdminStatus(token).catch(() => {});
      if (token) {
        const pref = await api
          .request<{ themeMode: ThemePreference }>("/api/user/preferences", {
            method: "GET",
            headers: { authorization: `Bearer ${token}` },
          })
          .catch(() => null);
        if (!cancelled) {
          setThemePreference((current) => mergeThemePreference(current, pref?.themeMode));
        }
      }
    };

    const sub = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const token = session?.access_token ?? null;
      setAccessToken(token);
      await syncAdminStatus(token).catch(() => {});
      if (token) {
        const pref = await api
          .request<{ themeMode: ThemePreference }>("/api/user/preferences", {
            method: "GET",
            headers: { authorization: `Bearer ${token}` },
          })
          .catch(() => null);
        if (!cancelled) {
          setThemePreference((current) => mergeThemePreference(current, pref?.themeMode));
        }
      }
    });

    void init().catch(() => {});

    return () => {
      cancelled = true;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColorValue);
  }, [primaryColorValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    writeThemePreference(window.localStorage, themePreference);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => resolveTheme(themeMode, media.matches);

    const apply = (resolved: ResolvedTheme) => {
      const root = document.documentElement;
      if (hasAppliedThemeOnceRef.current) {
        root.classList.add("theme-transition");
        window.setTimeout(() => root.classList.remove("theme-transition"), 220);
      }
      applyResolvedTheme(root, resolved);
      setTheme(resolved);
      writeResolvedTheme(window.localStorage, resolved);
      hasAppliedThemeOnceRef.current = true;
    };

    apply(resolve());

    const onChange = () => {
      if (themeMode !== "system") return;
      apply(resolve());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [themeMode, themePreference]);

  useEffect(() => {
    if (schoolInfo.defaultTheme !== "light" && schoolInfo.defaultTheme !== "dark") return;
    setSchoolDefaultTheme(schoolInfo.defaultTheme);
    if (typeof window !== "undefined") {
      cacheSchoolDefaultTheme(window.localStorage, schoolInfo.defaultTheme);
    }
  }, [schoolInfo.defaultTheme]);

  const login = async (username: string, password: string) => {
    if (!dbConnected) {
      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('offline_admin', 'true');
        setIsAdmin(true);
        setUser({ id: "offline", email: null, username: "admin" });
        return { success: true, offline: true };
      }
      return { success: false, error: "Database offline. Kredensial default hardcoded salah." };
    }

    try {
      const email = `${username}@admin.memoria.local`;
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes("Missing Supabase configuration")) {
           if (username === 'admin' && password === 'admin123') {
             sessionStorage.setItem('offline_admin', 'true');
             setIsAdmin(true);
             setUser({ id: "offline", email: null, username: "admin" });
             return { success: true, offline: true };
           }
        }
        return { success: false, error: error.message };
      }

      // Log aktivitas login sukses
      const token = data.session?.access_token;
      if (token) {
        fetch('/api/system/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: "LOGIN", target: "auth", details: { method: "supabase" } })
        }).catch(() => {});
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Unknown error occurred" };
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('offline_admin');
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  const addTeacher = async (data: Teacher) => {
    if (!dbConnected) {
      setTeachers((prev) => [...prev, { ...data, id: Date.now().toString() }].sort((a, b) => a.name.localeCompare(b.name)));
      return;
    }
    const created = await api.request<Teacher>("/api/teachers", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        position: data.position,
        message: data.message,
        photoUrl: data.photo,
        category: data.category,
      }),
    });
    setTeachers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateTeacher = async (id: string, data: Teacher) => {
    if (!dbConnected) {
      setTeachers((prev) =>
        prev
          .map((t) => (t.id === id ? { ...t, ...data, id } : t))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return;
    }
    await api.request(`/api/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        position: data.position,
        message: data.message,
        photoUrl: data.photo,
        category: data.category,
      }),
    });
    setTeachers((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...data, id } : t))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const deleteTeacher = async (id: string) => {
    if (!dbConnected) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    await api.request(`/api/teachers/${id}`, { method: "DELETE" });
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addAlumni = async (data: Alumni) => {
    if (!dbConnected) {
      setAlumni((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now().toString(),
          socialMedia: {
            instagram: data.socialMedia?.instagram,
            twitter: data.socialMedia?.twitter,
            linkedin: data.socialMedia?.linkedin,
          },
        },
      ]);
      return;
    }
    const created = await api.request<{ ok: true; id: string }>("/api/alumni", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        ttl: data.ttl,
        message: data.message,
        photoUrl: data.photo,
        graduationYear: data.graduationYear,
        className: data.class,
        instagram: data.socialMedia?.instagram ?? "",
        twitter: data.socialMedia?.twitter ?? "",
        linkedin: data.socialMedia?.linkedin ?? "",
      }),
    });
    setAlumni((prev) => [
      ...prev,
      {
        ...data,
        id: created.id,
        socialMedia: {
          instagram: data.socialMedia?.instagram,
          twitter: data.socialMedia?.twitter,
          linkedin: data.socialMedia?.linkedin,
        },
      },
    ]);
  };

  const updateAlumni = async (id: string, data: Alumni) => {
    if (!dbConnected) {
      setAlumni((prev) => prev.map((a) => (a.id === id ? { ...data, id } : a)));
      return;
    }
    await api.request(`/api/alumni/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        ttl: data.ttl,
        message: data.message,
        photoUrl: data.photo,
        graduationYear: data.graduationYear,
        className: data.class,
        instagram: data.socialMedia?.instagram ?? "",
        twitter: data.socialMedia?.twitter ?? "",
        linkedin: data.socialMedia?.linkedin ?? "",
      }),
    });
    setAlumni((prev) => prev.map((a) => (a.id === id ? { ...data, id } : a)));
  };

  const deleteAlumni = async (id: string) => {
    if (!dbConnected) {
      setAlumni((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    await api.request(`/api/alumni/${id}`, { method: "DELETE" });
    setAlumni((prev) => prev.filter((a) => a.id !== id));
  };

  const addYearbook = async (data: Yearbook & { pdfUrl?: string }) => {
    if (!dbConnected) {
      setYearbooks((prev) =>
        [
          ...prev,
          {
            ...data,
            id: Date.now().toString(),
            pages: [],
            pageCount: (data.pages?.length ?? 0) + 2,
          },
        ].sort((a, b) => b.year - a.year)
      );
      return;
    }
    const created = await api.request<{ ok: true; id: string }>("/api/yearbooks", {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        year: data.year,
        totalStudents: data.totalStudents,
        totalClasses: data.totalClasses,
        backgroundMusicUrl: data.backgroundMusic ?? "",
        pdfUrl: data.pdfUrl ?? "",
        coverImageUrl: data.coverImage ?? "",
        pageImageUrls: data.pages ?? [],
      }),
    });
    setYearbooks((prev) =>
      [
        ...prev,
        {
          ...data,
          id: created.id,
          pages: [],
          pageCount: (data.pages?.length ?? 0) + 2,
        },
      ].sort((a, b) => b.year - a.year)
    );
  };

  const updateYearbook = async (id: string, data: Partial<Yearbook & { pdfUrl?: string }>) => {
    if (!dbConnected) {
      setYearbooks((prev) =>
        prev
          .map((y) =>
            y.id === id
              ? {
                  ...y,
                  ...data,
                  id,
                }
              : y
          )
          .sort((a, b) => b.year - a.year)
      );
      return;
    }
    await api.request(`/api/yearbooks/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: data.title,
        year: data.year,
        totalStudents: data.totalStudents,
        totalClasses: data.totalClasses,
        backgroundMusicUrl: data.backgroundMusic ?? "",
        coverImageUrl: data.coverImage ?? "",
      }),
    });
    setYearbooks((prev) =>
      prev
        .map((y) =>
          y.id === id
            ? {
                ...y,
                ...data,
                id,
              }
            : y
        )
        .sort((a, b) => b.year - a.year)
    );
  };

  const deleteYearbook = async (id: string) => {
    if (!dbConnected) {
      setYearbooks((prev) => prev.filter((y) => y.id !== id));
      return;
    }
    await api.request(`/api/yearbooks/${id}`, { method: "DELETE" });
    setYearbooks((prev) => prev.filter((y) => y.id !== id));
  };

  const fetchYearbook = async (id: string): Promise<Yearbook | null> => {
    try {
      const y = await api.request<any>(`/api/yearbooks/${id}`, { method: "GET" });
      return {
        id: y.id,
        year: y.year,
        title: y.title,
        coverImage: y.coverImage ?? "",
        totalStudents: y.totalStudents ?? 0,
        totalClasses: y.totalClasses ?? 0,
        pages: y.pages ?? [],
        backgroundMusic: y.backgroundMusic ?? "",
      };
    } catch {
      return null;
    }
  };

  const updateSchoolInfo = async (data: any) => {
    const isThemeChanged = data.defaultTheme !== schoolInfo.defaultTheme;
    setSchoolInfo(data);
    
    if (isThemeChanged) {
      setThemePreference(null);
      void persistThemeMode("system");
    }

    if (!dbConnected) return;
    await api.request("/api/school", {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        logoUrl: data.logo ?? "",
        faviconUrl: data.favicon ?? "",
        tagline: data.tagline ?? "",
        contactEmail: data.contactEmail ?? "",
        contactPhone: data.contactPhone ?? "",
        contactAddress: data.contactAddress ?? "",
        history: data.history ?? "",
        vision: data.vision ?? "",
        mission: data.mission ?? "",
        facilities: data.facilities ?? "",
        defaultTheme: data.defaultTheme ?? "light",
      }),
    });
  };

  const updateYearbookSettings = async (data: any) => {
    setYearbookSettings(data);
    if (!dbConnected) return;
    await api.request("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        primaryColor: primaryColorValue,
        isAlumniVisible: isAlumniVisibleValue,
        yearbookSettings: data,
      }),
    });
  };

  const setPrimaryColor = async (color: string) => {
    setPrimaryColorValue(color);
    if (!dbConnected) return;
    await api.request("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        primaryColor: color,
        isAlumniVisible: isAlumniVisibleValue,
        yearbookSettings,
      }),
    });
  };

  const setIsAlumniVisible = async (visible: boolean) => {
    setIsAlumniVisibleValue(visible);
    if (!dbConnected) return;
    await api.request("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        primaryColor: primaryColorValue,
        isAlumniVisible: visible,
        yearbookSettings,
      }),
    });
  };

  const persistThemeMode = async (mode: ThemeMode) => {
    if (!accessToken) return;
    await api
      .request("/api/user/preferences", {
        method: "PUT",
        body: JSON.stringify({ themeMode: mode }),
      })
      .catch(() => {});
  };

  const toggleTheme = () => {
    const resolved = theme;
    const next = resolved === "dark" ? "light" : "dark";
    setThemePreference(next);
    void persistThemeMode(next);
  };

  const setThemeExplicit = (t: "light" | "dark") => {
    setThemePreference(t);
    void persistThemeMode(t);
  };

  const setThemeModeExplicit = (mode: ThemeMode) => {
    setThemePreference(mode);
    void persistThemeMode(mode);
  };

  return (
    <AppContext.Provider
      value={{
        alumni,
        teachers,
        yearbooks,
        isAdmin,
        user,
        authReady,
        dataReady,
        dbConnected,
        requiresPasswordChange,
        setRequiresPasswordChange,
        login,
        logout,
        addAlumni,
        updateAlumni,
        deleteAlumni,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addYearbook,
        updateYearbook,
        deleteYearbook,
        fetchYearbook,
        schoolInfo,
        updateSchoolInfo,
        theme,
        themeMode,
        setTheme: setThemeExplicit,
        setThemeMode: setThemeModeExplicit,
        toggleTheme,
        yearbookSettings,
        updateYearbookSettings,
        primaryColor: primaryColorValue,
        setPrimaryColor,
        isAlumniVisible: isAlumniVisibleValue,
        setIsAlumniVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
