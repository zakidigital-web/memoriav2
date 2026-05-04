
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Search, Book, GraduationCap, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const GlobalSearch: React.FC = () => {
  const { yearbooks, alumni } = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.length < 2) return { books: [], students: [] };
    
    const lowerQuery = query.toLowerCase();
    
    return {
      books: yearbooks.filter(b => 
        b.title.toLowerCase().includes(lowerQuery) || 
        b.year.toString().includes(lowerQuery)
      ),
      students: alumni.filter(a => 
        a.name.toLowerCase().includes(lowerQuery) || 
        a.class.toLowerCase().includes(lowerQuery) ||
        a.graduationYear.toString().includes(lowerQuery)
      )
    };
  }, [query, yearbooks, alumni]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={24} />
        <input 
          autoFocus
          type="text" 
          placeholder="Cari buku, tahun, atau nama alumni..." 
          className="w-full pl-14 pr-4 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-xl outline-none focus:ring-4 focus:ring-blue-500/10 shadow-xl transition-all"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {query.length > 0 && query.length < 2 && (
        <p className="text-center text-slate-400 dark:text-slate-500">Ketik minimal 2 karakter...</p>
      )}

      {query.length >= 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Books Results */}
          {results.books.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Buku Tahunan</h3>
              <div className="flex flex-col gap-2">
                {results.books.map(book => (
                  <Link 
                    key={book.id} 
                    to={`/buku/${book.id}`}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all group"
                  >
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm">
                       <img src={book.coverImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{book.title}</p>
                       <p className="text-xs text-slate-400 dark:text-slate-500">Angkatan {book.year}</p>
                    </div>
                    <Book size={18} className="text-slate-300 dark:text-slate-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Students Results */}
          {results.students.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Data Lulusan / Alumni</h3>
              <div className="flex flex-col gap-2">
                {results.students.map(student => (
                  <Link 
                    key={student.id} 
                    to={`/angkatan/${student.graduationYear}/${student.class}`}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-50 dark:border-slate-800">
                       <img src={student.photo} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>
                       <p className="text-xs text-slate-400 dark:text-slate-500">{student.class} • {student.graduationYear}</p>
                    </div>
                    <GraduationCap size={18} className="text-slate-300 dark:text-slate-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.books.length === 0 && results.students.length === 0 && (
            <div className="py-20 text-center text-slate-400">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="opacity-20" />
               </div>
               <p className="text-lg font-medium">Tidak ada hasil ditemukan</p>
               <p className="text-sm dark:text-slate-500">Coba kata kunci lain atau periksa ejaan Anda.</p>
            </div>
          )}
        </div>
      )}

      {query.length === 0 && (
        <div className="py-20 text-center">
           <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Search size={40} />
           </div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pencarian Memoria</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-2">Cari nama teman, kelas, atau tahun angkatan Anda dengan cepat di sini.</p>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
