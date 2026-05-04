import React, { useState } from 'react';
import { useApp } from '../context';
import { supabase } from '../supabaseClient';
import { ShieldAlert, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForcePasswordChange: React.FC = () => {
  const { setRequiresPasswordChange, logout } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (p: string) => {
    if (p.length < 8) return "Password minimal 8 karakter";
    if (!/[A-Z]/.test(p)) return "Harus mengandung huruf besar";
    if (!/[a-z]/.test(p)) return "Harus mengandung huruf kecil";
    if (!/[0-9]/.test(p)) return "Harus mengandung angka";
    if (!/[^A-Za-z0-9]/.test(p)) return "Harus mengandung karakter spesial (!@#$%^&*)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (token) {
        const res = await fetch('/api/auth/complete-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Gagal mengupdate status keamanan");
      }

      setRequiresPasswordChange(false);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-rose-500 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Peringatan Keamanan</h2>
          <p className="text-rose-100 mt-2 text-sm">
            Database Anda telah aktif. Anda menggunakan password bawaan yang sangat rentan. 
            Sistem mewajibkan Anda untuk mengganti password sekarang juga.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Minimal 8 karakter, kombinasi huruf & angka"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-900 dark:text-white"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <ul className="text-xs space-y-1 mt-2 text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                {password.length >= 8 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                Minimal 8 karakter
              </li>
              <li className="flex items-center gap-1.5">
                {/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                Mengandung huruf besar, kecil & angka
              </li>
              <li className="flex items-center gap-1.5">
                {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                Mengandung karakter spesial (!@#$%^&*)
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Konfirmasi Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Ketik ulang password baru"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-900 dark:text-white"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => void logout()}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
            >
              Keluar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 px-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Ganti Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};