
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  Book, 
  Settings, 
  LogOut,
  UserCog,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useApp } from '../context';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, schoolInfo, theme, themeMode, setThemeMode, toggleTheme, dbConnected } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { section: 'MAIN MENU', items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { label: 'Manajemen Flipbook', icon: Book, path: '/admin/manage-books' },
      { label: 'Data Sekolah', icon: School, path: '/admin/sekolah' },
      { label: 'Direktori Guru', icon: Users, path: '/admin/guru' },
      { label: 'Manajemen Siswa', icon: UserCog, path: '/admin/alumni' },
    ]},
    { section: 'SYSTEM', items: [
      { label: 'Pengaturan', icon: Settings, path: '/admin/settings' },
    ]}
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
             {schoolInfo.logo ? (
                <img src={schoolInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
             ) : (
                <div className="text-blue-600 dark:text-blue-400 font-black text-xl">M</div>
             )}
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white truncate">{schoolInfo.name.split(' ')[0]}</span>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-8">
          {menuItems.map((group) => (
            <div key={group.section} className="flex flex-col gap-2">
              <span className="px-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                {group.section}
              </span>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
              alt="Admin" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Overview</span>
            {dbConnected ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DB Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-500/20" title="Aplikasi berjalan dalam mode offline. Data yang Anda ubah tidak akan tersimpan secara permanen.">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                DB Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
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
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
