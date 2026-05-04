
import React, { useState } from 'react';
import { useApp } from '../context';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Alumni } from '../types';
import { Link } from 'react-router-dom';

const AdminAlumni: React.FC = () => {
  const { alumni, addAlumni, updateAlumni, deleteAlumni, isAdmin } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Alumni>>({
    name: '',
    ttl: '',
    message: '',
    photo: '',
    class: '',
    graduationYear: 2024,
    socialMedia: { instagram: '' }
  });

  if (!isAdmin) return <div className="p-20 text-center font-bold text-slate-900 dark:text-white">Akses Ditolak</div>;

  const filteredAlumni = alumni.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.class.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (student: Alumni) => {
    setEditingId(student.id);
    setFormData(student);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateAlumni(editingId, formData as Alumni);
    } else {
      await addAlumni(formData as Alumni);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      ttl: '',
      message: '',
      photo: '',
      class: '',
      graduationYear: 2024,
      socialMedia: { instagram: '' }
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(alumni.map(a => ({
      Nama: a.name,
      'Tempat Tanggal Lahir': a.ttl,
      Kelas: a.class,
      Angkatan: a.graduationYear,
      Pesan: a.message,
      Instagram: a.socialMedia.instagram,
      'Link Foto': a.photo
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumni');
    XLSX.writeFile(wb, 'data_alumni_memoria.xlsx');
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      for (const item of data) {
        await addAlumni({
          id: "",
          name: item.Nama || item.name || "No Name",
          ttl: item["Tempat Tanggal Lahir"] || item.ttl || "-",
          class: item.Kelas || item.class || "-",
          graduationYear: parseInt(item.Angkatan || item.graduationYear) || 2024,
          message: item.Pesan || item.message || "",
          photo:
            item["Link Foto"] ||
            item.photo ||
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
          socialMedia: { instagram: item.Instagram || item.instagram || "" },
        } as Alumni);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
             <Link to="/admin" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
             <ChevronLeft size={20} />
           </Link>
           <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Alumni</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Tambah, edit, atau hapus data siswa & alumni</p>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
           <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama atau kelas..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors"
              >
                <Download size={18} /> Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                <Upload size={18} /> Import
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={importFromExcel} />
              </label>
              <button 
                onClick={() => { setEditingId(null); setFormData({ graduationYear: 2024, socialMedia: { instagram: '' } }); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} /> Tambah Data
              </button>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Siswa</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kelas & Angkatan</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">TTL</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredAlumni.map(student => (
                       <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                   <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                                   <div className="text-xs text-slate-400">{student.socialMedia.instagram || '-'}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{student.class}</div>
                             <div className="text-xs text-slate-400">Angkatan {student.graduationYear}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{student.ttl}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEdit(student)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                   <Edit2 size={18} />
                                </button>
                                <button onClick={() => void deleteAlumni(student.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <h2 className="text-xl font-bold">{editingId ? 'Edit Data Alumni' : 'Tambah Data Alumni'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Tempat Tanggal Lahir</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Jakarta, 1 Januari 2006"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                      value={formData.ttl}
                      onChange={e => setFormData({...formData, ttl: e.target.value})}
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Kelas</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: XII IPA 1"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                      value={formData.class}
                      onChange={e => setFormData({...formData, class: e.target.value})}
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Tahun Kelulusan</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                      value={formData.graduationYear}
                      onChange={e => setFormData({...formData, graduationYear: parseInt(e.target.value)})}
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Instagram</label>
                    <input 
                      type="text" 
                      placeholder="@username"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                      value={formData.socialMedia?.instagram}
                      onChange={e => setFormData({...formData, socialMedia: {...formData.socialMedia, instagram: e.target.value}})}
                    />
                 </div>
                 <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">URL Foto (Upload/Google Drive)</label>
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        placeholder="https://..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                        value={formData.photo}
                        onChange={e => setFormData({...formData, photo: e.target.value})}
                       />
                       {formData.photo && (
                         <a href={formData.photo} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
                           <ExternalLink size={20} />
                         </a>
                       )}
                    </div>
                 </div>
                 <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Kata Mutiara / Perpisahan</label>
                    <textarea 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none text-slate-900 dark:text-white"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                 </div>

                 <div className="md:col-span-2 mt-4 flex gap-3">
                    <button 
                      type="submit" 
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                       <Save size={18} /> Simpan Data
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                    >
                       Batal
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlumni;
