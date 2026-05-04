
import React, { useState } from 'react';
import { useApp } from '../context';
import { Search, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AlumniPage: React.FC = () => {
  const { alumni } = useApp();
  const [search, setSearch] = useState('');

  const years = Array.from(new Set(alumni.map(a => a.graduationYear.toString())))
    .filter(y => y.includes(search))
    .sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Daftar Angkatan</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Pilih tahun kelulusan untuk melihat data alumni</p>
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari tahun..." 
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {years.map(year => (
            <Link 
              key={year} 
              to={`/angkatan/${year}`}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
            >
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                 <GraduationCap size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Angkatan {year}</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Lihat Daftar Kelas</p>
            </Link>
          ))}
        </div>

        {years.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <Search size={48} className="mx-auto mb-4 stroke-1 opacity-20" />
            <p>Tahun angkatan tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniPage;
