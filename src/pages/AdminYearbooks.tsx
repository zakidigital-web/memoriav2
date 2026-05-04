
import React, { useState } from 'react';
import { useApp } from '../context';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Book, 
  ExternalLink,
  ChevronLeft,
  Filter,
  X,
  Save,
  Music
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Yearbook } from '../types';

const AdminYearbooks: React.FC = () => {
  const { yearbooks, deleteYearbook, updateYearbook } = useApp();
  const [search, setSearch] = useState('');
  const [editingBook, setEditingBook] = useState<Yearbook | null>(null);

  const filtered = yearbooks.filter(y => 
    y.title.toLowerCase().includes(search.toLowerCase()) || 
    y.year.toString().includes(search)
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      await updateYearbook(editingBook.id, editingBook);
      setEditingBook(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Flipbook</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola album kenangan yang telah diunggah</p>
              </div>
           </div>
           <Link 
            to="/admin/flipbook"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
           >
             <Plus size={20} /> Tambah Album
           </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari judul atau tahun..." 
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium">
              <Filter size={18} /> Filter
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map(book => (
             <div key={book.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm group">
                <div className="aspect-[16/9] relative">
                   <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link to={`/buku/${book.id}`} className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform">
                         <ExternalLink size={20} />
                      </Link>
                   </div>
                   <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-blue-600">
                      {book.year}
                   </div>
                </div>
                <div className="p-6">
                   <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                         <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{book.title}</h3>
                         <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{book.totalStudents} Siswa • {book.totalClasses} Kelas</p>
                      </div>
                      <div className="p-2 bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-slate-200 rounded-lg">
                         <Book size={20} />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => setEditingBook(book)}
                        className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                      >
                         <Edit2 size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => { if(confirm('Hapus album ini?')) void deleteYearbook(book.id); }}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                         <Trash2 size={20} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Edit Modal */}
        {editingBook && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <h2 className="text-xl font-bold">Edit Metadata Album</h2>
                   <button onClick={() => setEditingBook(null)} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                   </button>
                </div>
                <form onSubmit={handleUpdate} className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5 col-span-2">
                         <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Judul Album</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                           value={editingBook.title}
                           onChange={e => setEditingBook({...editingBook, title: e.target.value})}
                           required
                         />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tahun</label>
                         <input 
                           type="number" 
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                           value={editingBook.year}
                           onChange={e => setEditingBook({...editingBook, year: parseInt(e.target.value)})}
                         />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Jumlah Siswa</label>
                         <input 
                           type="number" 
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                           value={editingBook.totalStudents}
                           onChange={e => setEditingBook({...editingBook, totalStudents: parseInt(e.target.value)})}
                         />
                      </div>
                      <div className="flex flex-col gap-1.5 col-span-2">
                         <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <Music size={16} className="text-blue-500" /> URL Musik Latar
                         </label>
                         <input 
                           type="text" 
                           placeholder="https://..."
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                           value={editingBook.backgroundMusic || ''}
                           onChange={e => setEditingBook({...editingBook, backgroundMusic: e.target.value})}
                         />
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <button 
                        type="submit" 
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                         <Save size={20} /> Simpan Perubahan
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditingBook(null)}
                        className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                      >
                         Batal
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <Book size={48} className="mx-auto mb-4 stroke-1 opacity-20" />
            <p>Belum ada album yang sesuai kriteria pencarian.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminYearbooks;
