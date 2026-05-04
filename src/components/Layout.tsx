
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Book, Users, UserCog, Search, LogOut, Sun, Moon, Settings, School, Monitor } from 'lucide-react';
import { useApp } from '../context';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, logout, schoolInfo, theme, themeMode, setThemeMode, toggleTheme, isAlumniVisible } = useApp();

  const navItems = [
    { label: 'Beranda', icon: Home, path: '/' },
    { label: 'Sekolah', icon: School, path: '/sekolah' },
    { label: 'Koleksi', icon: Book, path: '/koleksi' },
    { label: 'Direktori Guru', icon: Users, path: '/guru' },
    ...(isAlumniVisible ? [{ label: 'Angkatan', icon: UserCog, path: '/angkatan' }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Desktop & Tablet Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-slate-700 transition-transform group-hover:rotate-6 overflow-hidden">
              {schoolInfo.logo ? (
                <img src={schoolInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-blue-600 dark:text-blue-400 font-black text-xl">M</div>
              )}
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
              Memoria
            </span>
          </Link>

          {/* Navigation (Always visible on SM screens and up) */}
          <nav className="hidden sm:flex items-center gap-4 lg:gap-6">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                )}
              >
                {item.label}
              </NavLink>
            ))}
            
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setThemeMode("system")}
                aria-pressed={themeMode === "system"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  themeMode === "system"
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                    : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Monitor size={14} />
                Auto
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"}
                className="relative w-12 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-colors flex items-center p-0.5"
              >
                <span className="absolute inset-0 flex items-center justify-between px-1.5 text-slate-500 dark:text-slate-300 pointer-events-none">
                  <Sun size={14} className={theme === "dark" ? "opacity-40" : "opacity-90"} />
                  <Moon size={14} className={theme === "dark" ? "opacity-90" : "opacity-40"} />
                </span>
                <span
                  className={`h-5 w-5 rounded-full bg-white dark:bg-slate-900 shadow-sm transition-transform z-10 ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Link to="/admin" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">Admin</Link>
                  <button onClick={() => void logout()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Login Admin
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Theme Toggle Only (Visible when bottom nav handles actual nav) */}
          <div className="sm:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setThemeMode("system")}
                aria-label="Gunakan tema otomatis"
                aria-pressed={themeMode === "system"}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  themeMode === "system"
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                )}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"}
                className="relative w-12 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-colors flex items-center p-0.5"
              >
                <span className="absolute inset-0 flex items-center justify-between px-1.5 text-slate-500 dark:text-slate-300 pointer-events-none">
                  <Sun size={14} className={theme === "dark" ? "opacity-40" : "opacity-90"} />
                  <Moon size={14} className={theme === "dark" ? "opacity-90" : "opacity-40"} />
                </span>
                <span
                  className={`h-5 w-5 rounded-full bg-white dark:bg-slate-900 shadow-sm transition-transform z-10 ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 sm:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Visible ONLY on SM-hidden / Mobile screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:hidden flex items-center justify-around h-20 pb-4 px-2">
        <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center gap-1.5 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")}>
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span className="text-[11px] font-semibold">Koleksi</span>
        </NavLink>
        <NavLink to="/cari" className={({ isActive }) => cn("flex flex-col items-center gap-1.5 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")}>
          <Search size={22} />
          <span className="text-[11px] font-semibold">Cari</span>
        </NavLink>
        <NavLink to="/koleksi" className={({ isActive }) => cn("flex flex-col items-center gap-1.5 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")}>
          <Book size={22} />
          <span className="text-[11px] font-semibold">Buku</span>
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => cn("flex flex-col items-center gap-1.5 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")}>
          <Settings size={22} />
          <span className="text-[11px] font-semibold">Pengaturan</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
