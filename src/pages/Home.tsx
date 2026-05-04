
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { Users, GraduationCap, ChevronRight, Plus, BookOpen, School } from 'lucide-react';

const Home: React.FC = () => {
  const { yearbooks, isAlumniVisible } = useApp();

  return (
    <div className="flex flex-col gap-10 pb-12 pt-6">
      {/* Mobile-centric Yearbook Carousel */}
      <section className="flex flex-col gap-5">
        <div className="px-6">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">Koleksi Buku Tahunan</h2>
        </div>
        <div className="flex overflow-x-auto gap-5 px-6 pb-6 scrollbar-hide snap-x">
          {yearbooks.map((book) => (
            <div 
              key={book.id} 
              className="flex-shrink-0 w-[190px] md:w-[210px] snap-start flex flex-col gap-3"
            >
              <div className="aspect-[3/4.2] rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-lg shadow-blue-500/5">
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
                {book.year === 2024 && (
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-full shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse flex items-center justify-center">
                       <Plus size={5} className="text-white" />
                    </div>
                    Terbaru
                  </div>
                )}
              </div>
              <div className="text-center">
                <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{book.title}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{book.totalStudents} Siswa • {book.totalClasses} Kelas</p>
              </div>
              <Link 
                to={`/buku/${book.id}`}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 active:scale-95 transition-transform"
              >
                <BookOpen size={14} /> Baca Flipbook
              </Link>
            </div>
          ))}
          {/* Spacer to fix "mepet" on the right side */}
          <div className="flex-shrink-0 w-2" />
        </div>
      </section>

      {/* Menu Cards Section */}
      <section className="px-5 flex flex-col gap-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lihat Data Sekolah</h2>
        <div className="flex flex-col gap-4">
          <Link to="/sekolah" className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm active:bg-slate-50 dark:active:bg-white/5 transition-colors group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <School size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Data Sekolah</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Lihat profil, sejarah, sambutan kepala sekolah, dan fasilitas.</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors">
              <ChevronRight size={20} />
            </div>
          </Link>

          <Link to="/guru" className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm active:bg-slate-50 dark:active:bg-white/5 transition-colors group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <Users size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Direktori Guru</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Lihat daftar dewan guru, staf, beserta foto dan pesannya.</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
              <ChevronRight size={20} />
            </div>
          </Link>

          {isAlumniVisible && (
            <Link to="/angkatan" className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm active:bg-slate-50 dark:active:bg-white/5 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Daftar Angkatan</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Jelajahi riwayat angkatan dari tahun-tahun sebelumnya.</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-rose-600 transition-colors">
                <ChevronRight size={20} />
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
