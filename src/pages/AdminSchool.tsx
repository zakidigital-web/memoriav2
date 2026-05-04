
import React, { useState } from 'react';
import { useApp } from '../context';
import { Save, School, History, Target, ListChecks, Building2 } from 'lucide-react';

const AdminSchool: React.FC = () => {
  const { schoolInfo, updateSchoolInfo } = useApp();
  const [data, setData] = useState(schoolInfo);
  const [status, setStatus] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchoolInfo(data);
    setStatus('Berhasil disimpan!');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Sekolah</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola profil dan informasi publik sekolah.</p>
        </div>
        {status && <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold animate-fade-in">{status}</div>}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <School size={16} className="text-blue-500" /> Nama Sekolah
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white"
              value={data.name}
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <History size={16} className="text-blue-500" /> Sejarah Sekolah
            </label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none h-32 resize-none text-slate-900 dark:text-white"
              value={data.history}
              onChange={e => setData({...data, history: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Target size={16} className="text-blue-500" /> Visi
              </label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none h-32 resize-none text-slate-900 dark:text-white"
                value={data.vision}
                onChange={e => setData({...data, vision: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <ListChecks size={16} className="text-blue-500" /> Misi
              </label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none h-32 resize-none text-slate-900 dark:text-white"
                value={data.mission}
                onChange={e => setData({...data, mission: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" /> Fasilitas Pendukung
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white"
              placeholder="Pisahkan dengan koma (contoh: Lab, Perpustakaan, GOR)"
              value={data.facilities}
              onChange={e => setData({...data, facilities: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} /> Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default AdminSchool;
