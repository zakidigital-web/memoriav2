
import React, { useState } from 'react';
import { useApp } from '../context';
import { Search, Filter, Book } from 'lucide-react';
import { Link } from 'react-router-dom';

const Collection: React.FC = () => {
  const { yearbooks } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');

  const filteredBooks = yearbooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'Semua' || 
      (filter === '2020 - 2024' && book.year >= 2020 && book.year <= 2024) ||
      (filter === '2015 - 2019' && book.year >= 2015 && book.year <= 2019);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Koleksi Buku</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari tahun angkatan..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['Semua', '2020 - 2024', '2015 - 2019', 'Sebelumnya'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredBooks.map((book) => (
              <Link 
                key={book.id} 
                to={`/buku/${book.id}`}
                className="group flex flex-col gap-3"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative shadow-sm group-hover:shadow-xl transition-all">
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {book.year === 2024 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                      <Book size={10} /> Baru
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm md:text-base">{book.title}</h4>
                  <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{book.totalStudents} Siswa • {book.totalClasses} Kelas</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Search size={48} strokeWidth={1} className="mb-4" />
            <p className="text-lg">Tidak ada buku yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
