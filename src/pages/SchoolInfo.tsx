
import React from 'react';
import { useApp } from '../context';
import { History, Target, ListChecks, Building2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SchoolInfo: React.FC = () => {
  const { schoolInfo } = useApp();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Profil Sekolah</h1>
          <p className="text-slate-500 dark:text-slate-400">Mengenal lebih dekat {schoolInfo.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Logo & Name Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
           <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center p-3 mb-6">
              {schoolInfo.logo ? (
                <img src={schoolInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-blue-600 dark:text-blue-400 font-black text-3xl">M</div>
              )}
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">{schoolInfo.name}</h2>
           <div className="w-12 h-1 bg-blue-600 rounded-full mt-4" />
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center gap-3 mb-6 text-blue-600">
              <History size={24} />
              <h3 className="text-xl font-bold">Sejarah Singkat</h3>
           </div>
           <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {schoolInfo.history}
           </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-emerald-600">
                 <Target size={24} />
                 <h3 className="text-xl font-bold">Visi</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic">
                 "{schoolInfo.vision}"
              </p>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-orange-600">
                 <ListChecks size={24} />
                 <h3 className="text-xl font-bold">Misi</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                 {schoolInfo.mission}
              </p>
           </div>
        </div>

        {/* Facilities */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center gap-3 mb-6 text-purple-600">
              <Building2 size={24} />
              <h3 className="text-xl font-bold">Fasilitas Sekolah</h3>
           </div>
           <div className="flex flex-wrap gap-2">
              {schoolInfo.facilities.split(',').map((f: string) => (
                <span key={f} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium">
                   {f.trim()}
                </span>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolInfo;
