import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { upload } from "@vercel/blob/client";
import { Upload, FileText, CheckCircle2, X, ArrowRight, Loader2, Music } from "lucide-react";
import { useApp } from "../context";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { supabase } from "../supabaseClient";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_PDF_BYTES = 30 * 1024 * 1024;
const MAX_PAGE_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_PAGES = 50;

const AdminFlipbook: React.FC = () => {
  const { addYearbook } = useApp();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [progressText, setProgressText] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    year: 2024,
    students: 120,
    classes: 3,
    musicUrl: "",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0] ?? null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const fileToJpegBlob = async (canvas: HTMLCanvasElement, maxBytes: number) => {
    const attempts = [
      { quality: 0.82, scale: 1.15 },
      { quality: 0.72, scale: 1.0 },
      { quality: 0.62, scale: 0.92 },
      { quality: 0.5, scale: 0.85 },
    ];

    const sourceCanvas = canvas;
    for (const a of attempts) {
      const outCanvas = document.createElement("canvas");
      outCanvas.width = Math.max(1, Math.floor(sourceCanvas.width * a.scale));
      outCanvas.height = Math.max(1, Math.floor(sourceCanvas.height * a.scale));
      const ctx = outCanvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(sourceCanvas, 0, 0, outCanvas.width, outCanvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        outCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar halaman"))),
          "image/jpeg",
          a.quality
        );
      });

      if (blob.size <= maxBytes) return blob;
    }

    throw new Error("Ukuran halaman terlalu besar setelah kompresi");
  };

  const convertPdfToPageBlobs = async (pdfFile: File) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true, disableFontFace: false });
    const pdf = await loadingTask.promise;
    const pageCount = Math.min(pdf.numPages, MAX_PAGES);

    const blobs: Blob[] = [];
    for (let i = 1; i <= pageCount; i++) {
      setProgressText(`Mengonversi halaman ${i}/${pageCount}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) continue;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // @ts-ignore
      await page.render({ canvasContext: context, viewport }).promise;
      const blob = await fileToJpegBlob(canvas, MAX_PAGE_IMAGE_BYTES);
      blobs.push(blob);

      canvas.width = 0;
      canvas.height = 0;
    }

    await pdf.destroy?.();
    return blobs;
  };

  const handleUpload = async () => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang didukung.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      alert(`Ukuran file terlalu besar. Maksimal ${(MAX_PDF_BYTES / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }

    setIsUploading(true);
    setProgressText("Mengunggah PDF...");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        alert("Silakan login terlebih dahulu.");
        return;
      }

      const pdfBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: JSON.stringify({ kind: "yearbook-pdf" }),
        headers: { authorization: `Bearer ${token}` },
      });

      const pageBlobs = await convertPdfToPageBlobs(file);

      const pageUrls: string[] = [];
      for (let i = 0; i < pageBlobs.length; i++) {
        setProgressText(`Mengunggah halaman ${i + 1}/${pageBlobs.length}...`);
        const pageUpload = await upload(`page-${i + 1}.jpg`, pageBlobs[i], {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({ kind: "yearbook-page-image" }),
          headers: { authorization: `Bearer ${token}` },
        });
        pageUrls.push(pageUpload.url);
      }

      const coverImage = pageUrls[0] ?? "";
      await addYearbook({
        id: "",
        title: formData.title,
        year: formData.year,
        totalStudents: formData.students,
        totalClasses: formData.classes,
        backgroundMusic: formData.musicUrl,
        coverImage,
        pages: pageUrls,
        pdfUrl: pdfBlob.url,
      } as any);

      setStep(3);
    } catch (error: any) {
      alert(`Gagal memproses: ${error.message || "Terjadi kesalahan saat upload"}`);
    } finally {
      setIsUploading(false);
      setProgressText("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Flipbook</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Konversi dokumen PDF menjadi buku tahunan digital.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {s === 3 && step === 3 ? <CheckCircle2 size={20} /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Judul Album</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Angkatan 2024"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Tahun Kelulusan</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Total Siswa</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    value={formData.students}
                    onChange={e => setFormData({...formData, students: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Total Kelas</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    value={formData.classes}
                    onChange={e => setFormData({...formData, classes: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Music size={16} className="text-blue-600" /> Musik Latar (opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Tempel link MP3 di sini..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={formData.musicUrl}
                    onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
                  />
                </div>
             </div>
             <button 
                disabled={!formData.title}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
                Lanjutkan <ArrowRight size={20} />
             </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             {!file ? (
               <div 
                {...getRootProps()} 
                className={`border-4 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200'}`}
               >
                  <input {...getInputProps()} />
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                     <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pilih File Dokumen</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                    Tarik dan lepaskan file PDF di sini, atau klik untuk memilih file dari komputer Anda.
                  </p>
                  <p className="text-xs text-slate-400 mt-6 uppercase font-bold tracking-widest">Maksimal 30MB</p>
               </div>
             ) : (
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl flex items-center justify-between border border-blue-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                        <FileText size={24} />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Siap diunggah</p>
                     </div>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-red-500"><X size={20} /></button>
               </div>
             )}

             <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Kembali
                </button>
                <button 
                  disabled={!file || isUploading}
                  onClick={handleUpload}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> {progressText || "Memproses..."}
                    </>
                  ) : (
                    "Mulai Proses Unggah"
                  )}
                </button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8 space-y-6 animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Album Berhasil Dibuat!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Buku tahunan digital Anda sekarang sudah tersedia untuk dilihat oleh publik.</p>
             </div>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/koleksi')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Lihat Hasil Flipbook
                </button>
                <button 
                  onClick={() => { setStep(1); setFile(null); setFormData({ title: '', year: 2024, students: 120, classes: 3, musicUrl: '' }); }}
                  className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Upload Album Lain
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlipbook;
