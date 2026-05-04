
import React from 'react';
import { useApp } from '../context';
import { 
  Users, 
  Book, 
  GraduationCap, 
  Settings, 
  ArrowRight,
  School,
  FileUp,
  Files
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { isAdmin, yearbooks, teachers, dbConnected } = useApp();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
        <Link to="/login" className="text-blue-600 hover:underline">Silakan login sebagai admin</Link>
      </div>
    );
  }

  const stats = [
    { label: 'Total Angkatan', value: yearbooks.length.toString(), icon: Files, color: 'bg-blue-50 text-blue-500' },
    { label: 'Guru & Staf', value: teachers.length.toString(), icon: Users, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'Total Siswa', value: '2.4k', icon: GraduationCap, color: 'bg-rose-50 text-rose-500' },
  ];

  const menus = [
    { 
      title: 'Data Sekolah', 
      desc: 'Kelola profil sekolah, sejarah, sambutan kepala sekolah, visi misi, dan fasilitas pendukung yang ada.', 
      icon: School, 
      color: 'bg-blue-50 text-blue-600', 
      actionLabel: 'Kelola Data',
      path: '/admin/sekolah' 
    },
    { 
      title: 'Direktori Guru', 
      desc: 'Tambahkan dan kelola data dewan guru, staf pengajar beserta foto profil dan pesan kesan mereka.', 
      icon: Users, 
      color: 'bg-emerald-50 text-emerald-600', 
      actionLabel: 'Kelola Direktori',
      path: '/admin/guru' 
    },
    { 
      title: 'Daftar Angkatan', 
      desc: 'Buat dan kelola album kenangan digital untuk setiap tahun kelulusan secara terpisah dan rapi.', 
      icon: Book, 
      color: 'bg-orange-50 text-orange-600', 
      actionLabel: 'Kelola Angkatan',
      path: '/admin/alumni' 
    },
    { 
      title: 'Pengaturan Aplikasi', 
      desc: 'Konfigurasi sistem utama, manajemen hak akses admin, dan pengaturan tampilan aplikasi umum.', 
      icon: Settings, 
      color: 'bg-slate-50 text-slate-600', 
      actionLabel: 'Buka Pengaturan',
      path: '/admin/settings' 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Admin</h1>
          {!dbConnected && (
            <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold rounded-full animate-pulse border border-rose-200 dark:border-rose-500/30">
              OFFLINE MODE
            </span>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Selamat datang kembali! Kelola data dan konten untuk aplikasi Memoria.</p>
        {!dbConnected && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Peringatan Mode Offline</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Aplikasi sedang berjalan tanpa koneksi database. Anda menggunakan kredensial darurat (hardcoded). Setiap perubahan data yang Anda lakukan pada sesi ini bersifat sementara dan tidak akan tersimpan secara permanen ke server. Harap pastikan file .env Anda terkonfigurasi dengan benar.</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
            <div className={stat.color + " dark:bg-white/5 dark:text-slate-200 w-16 h-16 rounded-2xl flex items-center justify-center"}>
              <stat.icon size={32} />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400 dark:text-slate-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manajemen Utama</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {menus.map(menu => (
            <div 
              key={menu.title}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className={`w-14 h-14 shrink-0 ${menu.color} dark:bg-white/5 dark:text-slate-200 rounded-2xl flex items-center justify-center`}>
                  <menu.icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{menu.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{menu.desc}</p>
                </div>
              </div>
              <div className="mt-auto">
                <Link to={menu.path} className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all">
                  {menu.actionLabel} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}

          {/* Special Wide Card for Flipbook */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-6">
                <div className="w-14 h-14 shrink-0 bg-purple-50 text-purple-600 dark:bg-white/5 dark:text-slate-200 rounded-2xl flex items-center justify-center">
                  <FileUp size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dokumen Flipbook</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Unggah file dokumen PDF untuk diconversi menjadi format flipbook interaktif pada album angkatan.
                  </p>
                  <Link to="/admin/flipbook" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mt-6 hover:gap-3 transition-all">
                    Unggah File <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
