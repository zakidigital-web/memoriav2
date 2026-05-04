
import React, { useState } from 'react';
import { useApp } from '../context';
import { Search } from 'lucide-react';

const Directory: React.FC = () => {
  const { teachers } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                         t.position.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Direktori Guru & Staf</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Mengenal lebih dekat para pendidik dan tenaga kependidikan</p>
          </div>
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau jabatan..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['Semua', 'Pimpinan', 'Guru Kelas', 'Staf TU'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="flex gap-4">
                <img src={teacher.photo} alt={teacher.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{teacher.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{teacher.position}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded uppercase font-bold tracking-wider">{teacher.category}</span>
                </div>
              </div>
              <div className="relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                 <div className="absolute top-0 left-4 -translate-y-1/2 text-blue-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C11.1216 16 12.017 16.8954 12.017 18V21C12.017 22.1046 11.1216 23 10.017 23H7.017C5.91243 23 5.017 22.1046 5.017 21ZM14.017 11V1C14.017 0.447715 14.4647 0 15.017 0H21.017C21.5693 0 22.017 0.447715 22.017 1V11C22.017 11.5523 21.5693 12 21.017 12H15.017C14.4647 12 14.017 11.5523 14.017 11ZM5.017 11V1C5.017 0.447715 5.46472 0 6.017 0H12.017C12.5693 0 13.017 0.447715 13.017 1V11C13.017 11.5523 12.5693 12 12.017 12H6.017C5.46472 12 5.017 11.5523 5.017 11Z" /></svg>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{teacher.message}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Directory;
