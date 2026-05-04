
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context';
import { ChevronRight, ChevronLeft, Users, X, MapPin, ExternalLink as Instagram } from 'lucide-react';

export const ClassList: React.FC = () => {
  const { year } = useParams();
  const { alumni } = useApp();
  
  // Ambil kelas unik untuk tahun tersebut
  const classes = Array.from(new Set(
    alumni
      .filter(a => a.graduationYear.toString() === year)
      .map(a => a.class)
  )).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/angkatan" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daftar Kelas</h1>
          <p className="text-slate-500 dark:text-slate-400">Angkatan Tahun {year}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {classes.length > 0 ? classes.map(cls => (
          <Link 
            key={cls}
            to={`/angkatan/${year}/${cls}`}
            className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{cls}</span>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </Link>
        )) : (
          <div className="py-20 text-center text-slate-400">
             <p>Belum ada data kelas untuk tahun ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const StudentList: React.FC = () => {
  const { year, className } = useParams();
  const { alumni } = useApp();
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  
  const students = alumni.filter(a => 
    a.graduationYear.toString() === year && a.class === className
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/angkatan/${year}`} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{className}</h1>
          <p className="text-slate-500 dark:text-slate-400">Daftar Siswa Angkatan {year}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {students.map(student => (
          <button 
            key={student.id} 
            onClick={() => setSelectedStudent(student)}
            className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 text-left active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
               {student.photo ? (
                 <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
               ) : (
                 <Users className="text-slate-300 dark:text-slate-600" size={32} />
               )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate">{student.name}</h3>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase mt-1">Lihat Profil</p>
            </div>
          </button>
        ))}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <div className="relative aspect-square">
                 <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                 <button 
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>
              <div className="p-8">
                 <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedStudent.name}</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                       <MapPin size={14} /> {selectedStudent.ttl}
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                       "{selectedStudent.message}"
                    </p>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider">
                       {selectedStudent.class}
                    </div>
                    <div className="flex gap-3">
                       {selectedStudent.socialMedia.instagram && (
                         <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <Instagram size={18} />
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
