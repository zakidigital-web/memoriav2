
import React, { useState } from 'react';
import { useApp } from '../context';
import { Plus, Search, Edit2, Trash2, X, Save } from 'lucide-react';
import { Teacher } from '../types';

const AdminTeachers: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    position: '',
    message: '',
    photo: '',
    category: 'Guru Kelas'
  });

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateTeacher(editingId, formData as Teacher);
    } else {
      await addTeacher(formData as Teacher);
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openEdit = (t: Teacher) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Direktori Guru & Staf</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola data dewan guru dan staf pengajar.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ category: 'Guru Kelas', name: '', position: '', message: '', photo: '' }); setIsModalOpen(true); }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Tambah Guru
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama guru..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <img src={t.photo} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
              <button onClick={() => void deleteTeacher(t.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Jabatan</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Kategori</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="Pimpinan">Pimpinan</option>
                    <option value="Guru Kelas">Guru Kelas</option>
                    <option value="Staf TU">Staf TU</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">URL Foto</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  value={formData.photo}
                  onChange={e => setFormData({...formData, photo: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Pesan / Kesan</label>
                <textarea 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none h-24 resize-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                <Save size={20} /> Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
