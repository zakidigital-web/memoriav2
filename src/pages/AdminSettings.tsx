
import React, { useEffect, useState } from 'react';
import { useApp } from '../context';
import { supabase } from '../supabaseClient';
import { 
  Shield, 
  Lock, 
  User, 
  Palette, 
  Globe, 
  Save, 
  Image as ImageIcon,
  BookOpen,
  LayoutGrid,
  Moon,
  Sun,
  GraduationCap
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { schoolInfo, updateSchoolInfo, yearbookSettings, updateYearbookSettings, primaryColor, setPrimaryColor, isAlumniVisible, setIsAlumniVisible, user } = useApp();
  const [activeTab, setActiveTab] = useState('Akun');
  const [status, setStatus] = useState('');
  
  const [localSchool, setLocalSchool] = useState(schoolInfo);
  const [localYB, setLocalYB] = useState(yearbookSettings);

  const [username, setUsername] = useState(user?.username || 'admin');
  const [password, setPassword] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'Statistik') {
      supabase.auth.getSession().then(({ data }) => {
        const token = data.session?.access_token;
        if (token) {
          fetch('/api/analytics/dashboard?range=7days', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json()).then(data => {
            if (!data.error) setAnalytics(data);
          });
        }
      });
    }
  }, [activeTab]);
  useEffect(() => {
    setLocalSchool(schoolInfo);
  }, [schoolInfo]);

  useEffect(() => {
    setLocalYB(yearbookSettings);
  }, [yearbookSettings]);

  const tabs = [
    { name: 'Akun', icon: Shield },
    { name: 'Sekolah', icon: ImageIcon },
    { name: 'Flipbook', icon: BookOpen },
    { name: 'Tampilan', icon: Palette },
    { name: 'Database', icon: Save },
    { name: 'Statistik', icon: LayoutGrid },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'Akun') {
        if (username !== user?.username) {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;
          
          if (token) {
            const res = await fetch('/api/auth/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ username })
            });
            if (!res.ok) throw new Error('Gagal memperbarui username. Mungkin sudah dipakai.');
            
            const newEmail = `${username}@admin.memoria.local`;
            await supabase.auth.updateUser({ email: newEmail });
          }
        }
        if (password) {
          await supabase.auth.updateUser({ password });
          setPassword('');
        }
      } else {
        await updateSchoolInfo(localSchool);
        await updateYearbookSettings(localYB);
      }
      setStatus('Pengaturan diperbarui!');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pengaturan Aplikasi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Konfigurasi keamanan, logo, dan preferensi sistem.</p>
        </div>
        {status && <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">{status}</div>}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-white hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white'}`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
            {activeTab === 'Akun' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Username Admin</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Sekolah' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Logo Sekolah</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center p-2 shadow-sm border border-slate-100 dark:border-slate-800">
                       <img src={localSchool.logo} alt="School Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan URL logo sekolah (Format PNG/JPG disarankan)</p>
                       <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={localSchool.logo}
                        onChange={e => setLocalSchool({...localSchool, logo: e.target.value})}
                       />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nama Sekolah</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      value={localSchool.name}
                      onChange={e => setLocalSchool({...localSchool, name: e.target.value})}
                    />
                 </div>
                 <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Favicon</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center p-2 shadow-sm border border-slate-100 dark:border-slate-800">
                       {localSchool.favicon ? (
                         <img src={localSchool.favicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
                       ) : (
                         <Globe className="text-slate-300" size={20} />
                       )}
                    </div>
                    <div className="flex-1 space-y-2">
                       <p className="text-xs text-slate-500 dark:text-slate-400">URL Favicon (Ikon di tab browser)</p>
                       <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={localSchool.favicon}
                        onChange={e => setLocalSchool({...localSchool, favicon: e.target.value})}
                       />
                    </div>
                  </div>
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Slogan / Tagline</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      value={localSchool.tagline}
                      onChange={e => setLocalSchool({...localSchool, tagline: e.target.value})}
                      placeholder="Mencetak generasi unggul..."
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Email Kontak</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                        value={localSchool.contactEmail}
                        onChange={e => setLocalSchool({...localSchool, contactEmail: e.target.value})}
                      />
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Telepon Kontak</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                        value={localSchool.contactPhone}
                        onChange={e => setLocalSchool({...localSchool, contactPhone: e.target.value})}
                      />
                   </div>
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Alamat</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white min-h-[80px]"
                      value={localSchool.contactAddress}
                      onChange={e => setLocalSchool({...localSchool, contactAddress: e.target.value})}
                    />
                 </div>
              </div>
            )}

            {activeTab === 'Flipbook' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Urutkan Berdasarkan</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      value={localYB.sortBy}
                      onChange={e => setLocalYB({...localYB, sortBy: e.target.value})}
                    >
                      <option value="year-desc">Tahun Terbaru</option>
                      <option value="year-asc">Tahun Terlama</option>
                      <option value="title-asc">Judul (A-Z)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Kolom Grid (Desktop)</label>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      {[3, 4, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setLocalYB({...localYB, gridColumns: num})}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${localYB.gridColumns === num ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                          {num} Kolom
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <LayoutGrid className="text-blue-500" size={20} />
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Tampilkan Jumlah Siswa</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Tampilkan info jumlah siswa di kartu buku</p>
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setLocalYB({...localYB, showStudentCount: !localYB.showStudentCount})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${localYB.showStudentCount ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localYB.showStudentCount ? 'right-1' : 'left-1'}`} />
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
                          <GraduationCap size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Menu Angkatan / Alumni</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Aktifkan atau nonaktifkan fitur daftar angkatan publik</p>
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => void setIsAlumniVisible(!isAlumniVisible)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isAlumniVisible ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAlumniVisible ? 'right-1' : 'left-1'}`} />
                    </button>
                 </div>
              </div>
            )}

            {activeTab === 'Tampilan' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <div className="flex flex-col gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Warna Identitas Aplikasi</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Pilih warna utama yang akan digunakan di seluruh aplikasi.</p>
                    <div className="grid grid-cols-5 gap-4">
                       {['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                         <button
                           key={color}
                           type="button"
                           onClick={() => void setPrimaryColor(color)}
                           className={`w-full aspect-square rounded-2xl border-4 transition-all ${primaryColor === color ? 'border-slate-900 shadow-lg scale-110' : 'border-transparent'}`}
                           style={{ backgroundColor: color }}
                         />
                       ))}
                       <div className="col-span-5 flex items-center gap-4 mt-2">
                          <input 
                            type="color" 
                            value={primaryColor} 
                            onChange={(e) => void setPrimaryColor(e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1"
                          />
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-300 uppercase">{primaryColor}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Tema Default Aplikasi</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tentukan tampilan awal untuk pengunjung baru.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <button
                        type="button"
                        onClick={async () => {
                           const newSchool = {...localSchool, defaultTheme: 'light'};
                           setLocalSchool(newSchool);
                           await updateSchoolInfo(newSchool);
                        }}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${localSchool.defaultTheme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}
                       >
                          <Sun size={24} />
                          <span className="text-xs font-bold">Default: Terang</span>
                       </button>
                       <button
                        type="button"
                        onClick={async () => {
                           const newSchool = {...localSchool, defaultTheme: 'dark'};
                           setLocalSchool(newSchool);
                           await updateSchoolInfo(newSchool);
                        }}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${localSchool.defaultTheme === 'dark' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}
                       >
                          <Moon size={24} />
                          <span className="text-xs font-bold">Default: Gelap</span>
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'Database' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <div className="flex flex-col gap-4 p-6 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/20">
                    <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Danger Zone: Reset Database</h3>
                    <p className="text-sm text-rose-600 dark:text-rose-300">
                      Tindakan ini akan menghapus data yang dipilih secara permanen. Pastikan Anda memiliki backup sebelum melanjutkan.
                    </p>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (confirm('Anda yakin ingin mereset seluruh database? Tindakan ini tidak bisa dibatalkan.')) {
                          const { data: sessionData } = await supabase.auth.getSession();
                          const token = sessionData.session?.access_token;
                          if (token) {
                            fetch('/api/system/reset', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ tables: [] })
                            }).then(res => {
                              if (res.ok) alert('Database berhasil direset.');
                              else alert('Gagal mereset database.');
                            });
                          }
                        }
                      }}
                      className="mt-2 w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
                    >
                      Reset Seluruh Database
                    </button>
                 </div>
                 
                 <div className="flex flex-col gap-4 p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                    <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">Pengisian Data Dummy</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Isi database dengan data contoh untuk keperluan testing (Siswa, Guru, Alumni, dll).
                    </p>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (confirm('Isi database dengan data dummy?')) {
                          const { data: sessionData } = await supabase.auth.getSession();
                          const token = sessionData.session?.access_token;
                          if (token) {
                            fetch('/api/system/dummy', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                            }).then(res => {
                              if (res.ok) {
                                alert('Data dummy berhasil ditambahkan.');
                                window.location.reload();
                              }
                              else alert('Gagal menambahkan data dummy.');
                            });
                          }
                        }
                      }}
                      className="mt-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      Generate Data Dummy
                    </button>
                 </div>

                 <div className="flex flex-col gap-4 p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Ekspor Data (Backup)</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300">
                      Unduh seluruh data database dalam format JSON sebagai backup.
                    </p>
                    <button 
                      type="button"
                      onClick={async () => {
                        const { data: sessionData } = await supabase.auth.getSession();
                        const token = sessionData.session?.access_token;
                        if (token) {
                          window.open(`/api/system/export?token=${token}`, '_blank');
                        }
                      }}
                      className="mt-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Unduh Backup JSON
                    </button>
                 </div>
              </div>
            )}

            {activeTab === 'Statistik' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                     <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Total Pengunjung (7 Hari)</p>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{analytics ? analytics.totalVisits : '...'}</p>
                   </div>
                   <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                     <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Rata-rata Durasi</p>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{analytics ? `${analytics.avgDuration} detik` : '...'}</p>
                   </div>
                 </div>

                 {analytics && analytics.dailyPattern && analytics.dailyPattern.length > 0 && (
                   <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Grafik Kunjungan Harian</h3>
                     <div className="h-48 flex items-end gap-2">
                       {analytics.dailyPattern.map((d: any, i: number) => {
                         const max = Math.max(...analytics.dailyPattern.map((x: any) => parseInt(x.visitors)));
                         const h = max === 0 ? 0 : (parseInt(d.visitors) / max) * 100;
                         return (
                           <div key={i} className="flex-1 flex flex-col justify-end group relative">
                             <div className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-400" style={{ height: `${h}%`, minHeight: h > 0 ? '4px' : '0' }}></div>
                             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                               {d.visitors} visit<br/>{new Date(d.date).toLocaleDateString('id-ID')}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}

                 {analytics && analytics.sources && analytics.sources.length > 0 && (
                   <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Sumber Traffic</h3>
                     <div className="space-y-3">
                       {analytics.sources.map((s: any, i: number) => (
                         <div key={i} className="flex items-center justify-between">
                           <span className="text-sm text-slate-600 dark:text-slate-400 truncate w-2/3">{s.source || 'Direct / Bookmark'}</span>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">{s.count}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Save size={20} /> Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
