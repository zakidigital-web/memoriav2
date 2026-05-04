
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { useApp } from '../context';
import { Yearbook } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut, 
  MoreVertical, 
  List, 
  Share2,
  ArrowLeft,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

const BookViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { yearbooks, fetchYearbook } = useApp();
  const [book, setBook] = useState<Yearbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const flipBook = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [page, setPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      const existing = yearbooks.find((b) => b.id === id) ?? null;
      if (existing && existing.pages && existing.pages.length > 0) {
        if (!cancelled) setBook(existing);
        if (!cancelled) setIsLoading(false);
        return;
      }
      if (!id) {
        if (!cancelled) setBook(null);
        if (!cancelled) setIsLoading(false);
        return;
      }
      const fetched = await fetchYearbook(id);
      if (!cancelled) setBook(fetched);
      if (!cancelled) setIsLoading(false);
    };
    void run().catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, yearbooks, fetchYearbook]);

  if (isLoading) return <div className="p-20 text-center">Memuat...</div>;
  if (!book) return <div className="p-20 text-center">Buku tidak ditemukan</div>;

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const onPage = (e: any) => {
    setPage(e.data);
  };

  const nextButtonClick = () => {
    const inst = flipBook.current?.pageFlip?.();
    inst?.flipNext?.();
  };

  const prevButtonClick = () => {
    const inst = flipBook.current?.pageFlip?.();
    inst?.flipPrev?.();
  };

  const jumpToPage = (index: number) => {
    const inst = flipBook.current?.pageFlip?.();
    inst?.turnToPage?.(index);
    setIsTocOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 text-white z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="hidden md:block">
            <h1 className="font-bold">{book.title}</h1>
            <p className="text-[10px] text-slate-400">Flipbook Digital Memoria</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {book.backgroundMusic && (
             <button 
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${isMuted ? 'text-red-400 bg-red-500/10' : 'text-blue-400 bg-blue-500/10'}`}
             >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>
          )}
          <div className="w-px h-4 bg-white/20 mx-2" />
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))} className="p-2 hover:bg-white/10 rounded-full"><ZoomOut size={18} /></button>
          <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 hover:bg-white/10 rounded-full"><ZoomIn size={18} /></button>
          <div className="w-px h-4 bg-white/20 mx-2" />
          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Background Music Player */}
      {book.backgroundMusic && (
        <audio 
          ref={audioRef}
          src={book.backgroundMusic} 
          autoPlay 
          loop 
          className="hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-auto">
        <div 
          className="transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* @ts-ignore */}
          <HTMLFlipBook
            width={400}
            height={550}
            size="stretch"
            minWidth={315}
            maxWidth={600}
            minHeight={400}
            maxHeight={800}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="shadow-2xl"
            ref={flipBook}
            usePortrait={window.innerWidth < 768}
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            style={{}}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {/* Pages */}
            <div className="page bg-white">
              <img src={book.coverImage} className="w-full h-full object-cover" alt="Cover" />
            </div>
            
            {book.pages.map((img, i) => (
              <div key={i} className="page bg-white border-l border-slate-200">
                <img src={img} className="w-full h-full object-cover" alt={`Page ${i + 1}`} />
              </div>
            ))}

            <div className="page bg-slate-100 text-slate-900 flex items-center justify-center p-8 text-center border-l border-slate-200">
              <div>
                <h3 className="text-xl font-bold mb-4">Terimakasih</h3>
                <p className="text-sm text-slate-600 italic">Sampai jumpa di angkatan selanjutnya.</p>
                <div className="mt-8 w-12 h-1 bg-blue-600 mx-auto rounded-full" />
              </div>
            </div>
          </HTMLFlipBook>
        </div>

        {/* Floating Navigation */}
        <button 
          onClick={prevButtonClick}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10 hidden md:flex"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextButtonClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10 hidden md:flex"
        >
          <ChevronRight size={24} />
        </button>

        {/* Proportional Control Menu */}
        <div className="absolute bottom-6 left-4 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 flex flex-col items-center gap-4 z-20">
           {/* Progress Slider (New) */}
           <div className="w-full md:w-80 px-4">
              <input 
                type="range" 
                min="0" 
                max={book.pages.length + 1} 
                value={page}
                onChange={(e) => jumpToPage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
           </div>

           <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center justify-between md:justify-center gap-6 text-white text-sm w-full md:w-auto shadow-2xl border border-white/10">
              <button 
                onClick={() => setIsTocOpen(true)}
                className="flex flex-col md:flex-row items-center gap-1.5 hover:text-blue-400 transition-colors"
              >
                  <List size={20} />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Isi</span>
              </button>
              
              <div className="w-px h-6 bg-white/20 hidden md:block" />

              <div className="flex items-center gap-4">
                <button onClick={prevButtonClick} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden">
                   <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Halaman</span>
                    <span className="font-mono text-base font-bold">{page + 1} <span className="text-slate-300 text-xs font-normal">/ {book.pages.length + 2}</span></span>
                </div>
                <button onClick={nextButtonClick} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden">
                   <ChevronRight size={20} />
                </button>
              </div>

              <div className="w-px h-6 bg-white/20 hidden md:block" />

              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: book.title,
                      text: `Lihat buku tahunan digital ${book.title} di Memoria!`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Tautan berhasil disalin ke clipboard!');
                  }
                }}
                className="flex flex-col md:flex-row items-center gap-1.5 hover:text-blue-400 transition-colors"
              >
                  <Share2 size={20} />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Share</span>
              </button>
           </div>
        </div>

        {/* Table of Contents Modal */}
        {isTocOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-end animate-in fade-in duration-300">
             <div className="w-full max-w-sm h-full bg-slate-900 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                   <div>
                      <h2 className="text-xl font-black text-white">Daftar Isi</h2>
                      <p className="text-xs text-slate-300 mt-1">{book.title}</p>
                   </div>
                   <button onClick={() => setIsTocOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl">
                      <X size={24} />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                   {/* Cover */}
                   <button 
                    onClick={() => jumpToPage(0)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${page === 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                   >
                      <div className="w-12 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                        <img src={book.coverImage} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm uppercase">Sampul Depan</p>
                        <p className="text-[10px] opacity-60">Halaman 1</p>
                      </div>
                   </button>

                   {/* Pages */}
                   {book.pages.map((img, i) => (
                      <button 
                        key={i}
                        onClick={() => jumpToPage(i + 1)}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        <div className="w-12 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm uppercase">Halaman {i + 2}</p>
                          <p className="text-[10px] opacity-60">Dokumentasi Angkatan</p>
                        </div>
                      </button>
                   ))}

                   {/* Closing */}
                   <button 
                    onClick={() => jumpToPage(book.pages.length + 1)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${page === book.pages.length + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                   >
                      <div className="w-12 h-16 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-white/10 italic font-black text-blue-500">
                        End
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm uppercase">Halaman Akhir</p>
                        <p className="text-[10px] opacity-60">Halaman {book.pages.length + 2}</p>
                      </div>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
      
      {/* Scroll indicator for mobile */}
      <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
         <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-xs">
            <span className="animate-pulse">👈</span> Geser untuk membaca <span className="animate-pulse">👉</span>
         </div>
      </div>
    </div>
  );
};

export default BookViewer;
