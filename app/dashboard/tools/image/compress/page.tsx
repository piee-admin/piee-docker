"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, MoveHorizontal, Layers, Loader2, CheckCircle2, Calculator, Archive, X } from "lucide-react";
import JSZip from "jszip";

// Type definition
type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number;
  status: "pending" | "compressing" | "done";
};

export default function ImageCompressor() {
  const [items, setItems] = useState<ImageItem[]>([]);
  
  // Settings
  const [quality, setQuality] = useState<number>(0.8); 
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [targetSizeKB, setTargetSizeKB] = useState<string>(""); 
  
  // Processing States
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Compare Slider (Single View)
  const [sliderPosition, setSliderPosition] = useState(50);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      compressedUrl: null,
      originalSize: file.size,
      compressedSize: 0,
      status: "pending",
    }));

    setItems((prev) => [...prev, ...newItems]);
    setTargetSizeKB(""); 
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // --- CORE HELPER: Compress Single File ---
  const compressSingleImage = async (item: ImageItem, q: number, fmt: string): Promise<ImageItem> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = item.previewUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) return;
                resolve({
                    ...item,
                    compressedUrl: URL.createObjectURL(blob),
                    compressedSize: blob.size,
                    status: "done"
                });
            }, fmt, q);
        };
    });
  };

  // --- ALGORITHM: Binary Search for Target Size ---
  const calculateQualityForSize = async () => {
    if (!items[0] || !targetSizeKB) return;
    const targetBytes = parseFloat(targetSizeKB) * 1024;
    if (targetBytes <= 0) return;

    setIsCalculating(true);
    
    const referenceItem = items[0];
    const img = new Image();
    img.src = referenceItem.previewUrl;
    await img.decode();

    const getBlobSize = (q: number): Promise<number> => {
        return new Promise(resolve => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(blob => resolve(blob?.size || 0), format, q);
        });
    };

    let min = 0.01;
    let max = 1.0;
    let bestQuality = 0.5;
    let attempts = 0;

    while (attempts < 7) { 
        const mid = (min + max) / 2;
        const size = await getBlobSize(mid);
        
        if (Math.abs(size - targetBytes) < 5000) { 
            bestQuality = mid;
            break;
        }
        if (size > targetBytes) max = mid;
        else {
            min = mid;
            bestQuality = mid;
        }
        attempts++;
    }

    setQuality(bestQuality);
    setIsCalculating(false);
  };

  // --- EFFECT: Compress All Items ---
  useEffect(() => {
    if (items.length === 0) return;
    if (isCalculating) return; 

    const processQueue = async () => {
      setIsGlobalProcessing(true);
      
      const processed = await Promise.all(
        items.map(async (item) => {
            return await compressSingleImage(item, quality, format);
        })
      );

      setItems(processed);
      setIsGlobalProcessing(false);
    };

    const debounce = setTimeout(processQueue, 400);
    return () => clearTimeout(debounce);
  }, [items.length, quality, format, isCalculating]); 


  // --- ZIP DOWNLOAD ---
  const downloadZip = async () => {
    const zip = new JSZip();
    for (const item of items) {
        if (item.compressedUrl) {
            const response = await fetch(item.compressedUrl);
            const blob = await response.blob();
            const ext = format.split('/')[1];
            zip.file(`compressed_${item.file.name.split('.')[0]}.${ext}`, blob);
        }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "images_bundle.zip";
    link.click();
  };

  // --- Render Helpers ---
  const isBatchMode = items.length > 1;
  const activeItem = items[0];
  const totalSaved = items.reduce((acc, item) => acc + (item.originalSize - item.compressedSize), 0);
  const totalOriginal = items.reduce((acc, item) => acc + item.originalSize, 0);
  const totalPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    // Changed hardcoded black to 'bg-gray-50 dark:bg-[#09090b]'
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans transition-colors duration-300">
      
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-black dark:text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Smart Compressor</h1>
        </div>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 ml-11">Optimize images by quality or target file size.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONTROLS ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="p-5 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md transition-colors">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-black/20 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition group">
                <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-400 dark:text-zinc-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {items.length > 0 ? "Add more images" : "Upload Images"}
                    </p>
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Settings Card */}
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md space-y-8 transition-colors">
                
                {/* 1. Manual Quality Slider */}
                <div>
                    <div className="flex justify-between mb-4 items-end">
                        <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Global Quality</label>
                        <span className="text-black dark:text-white font-mono text-sm font-bold">{Math.round(quality * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.01" max="1" step="0.01"
                        value={quality}
                        onChange={(e) => {
                            setQuality(parseFloat(e.target.value));
                            setTargetSizeKB(""); 
                        }}
                        disabled={items.length === 0 || isCalculating}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white disabled:opacity-30"
                    />
                </div>

                {/* DIVIDER */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-zinc-800"></div></div>
                    <span className="relative bg-white dark:bg-[#09090b] px-2 text-xs text-gray-400 dark:text-zinc-500 uppercase">OR</span>
                </div>

                {/* 2. Target File Size Input */}
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3 block">Target File Size</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                placeholder="e.g. 500"
                                value={targetSizeKB}
                                onChange={(e) => setTargetSizeKB(e.target.value)}
                                disabled={items.length === 0}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-zinc-700 rounded-lg py-2.5 pl-3 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-zinc-500 font-medium">KB</span>
                        </div>
                        <button 
                            onClick={calculateQualityForSize}
                            disabled={!targetSizeKB || items.length === 0 || isCalculating}
                            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-black disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Calculator className="w-4 h-4" />}
                            Auto
                        </button>
                    </div>
                    {targetSizeKB && quality < 1 && !isCalculating && (
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-white"/> Optimized to ~{targetSizeKB}KB (Quality: {Math.round(quality * 100)}%)
                        </p>
                    )}
                </div>

                {/* Format Selector */}
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3 block">Output Format</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setFormat("image/jpeg")}
                            className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1
                                ${format === "image/jpeg" 
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                        >   
                            <span>JPEG</span>
                        </button>
                        <button
                            onClick={() => setFormat("image/webp")}
                            className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1
                                ${format === "image/webp" 
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                        >   
                            <span>WEBP</span>
                        </button>
                    </div>
                </div>

                {/* Stats & ZIP Download */}
                {items.length > 0 && (
                    <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-zinc-400">
                            <span>Total Images:</span>
                            <span className="text-gray-900 dark:text-white">{items.length}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-zinc-400">
                            <span>Total Saved:</span>
                            <span className="text-gray-900 dark:text-white">-{totalPercent}%</span>
                        </div>
                        {isBatchMode && (
                            <button 
                                onClick={downloadZip}
                                disabled={isGlobalProcessing}
                                className="w-full mt-4 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {isGlobalProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Archive className="w-4 h-4"/>}
                                Download All (ZIP)
                            </button>
                        )}
                    </div>
                )}
            </div>
          </div>

          {/* ---------------- RIGHT: PREVIEW ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-2xl backdrop-blur-md flex-1 flex flex-col relative min-h-[600px] transition-colors">
                
                {/* MODE 1: EMPTY STATE */}
                {items.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-40 space-y-3">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto border border-gray-200 dark:border-zinc-700">
                           <Layers className="w-8 h-8 text-gray-400 dark:text-zinc-400" />
                        </div>
                        <p className="text-gray-500 dark:text-zinc-400">Ready to compress</p>
                     </div>
                )}

                {/* MODE 2: SINGLE IMAGE (COMPARISON SLIDER) */}
                {!isBatchMode && activeItem && (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500">Quality Comparison</h2>
                            {activeItem.status === 'done' && (
                                <a
                                    href={activeItem.compressedUrl!}
                                    download={`compressed_${activeItem.file.name}`}
                                    className="flex items-center gap-2 text-xs text-white bg-black dark:text-black dark:bg-white px-3 py-1.5 rounded-full font-bold hover:opacity-80 transition"
                                >
                                    <Download className="w-3 h-3" /> Download
                                </a>
                            )}
                        </div>
                        {/* Preview Container: Lighter gray in light mode, deep black in dark mode */}
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 flex items-center justify-center select-none group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                            
                            {activeItem.compressedUrl ? (
                                <div 
                                    ref={compareContainerRef}
                                    className="relative w-full h-full max-h-[75vh] cursor-col-resize z-10"
                                    onMouseMove={handleMouseMove}
                                    onTouchMove={handleTouchMove}
                                >
                                    <img src={activeItem.compressedUrl} className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                                    <div className="absolute top-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded border border-white/20 shadow-xl backdrop-blur-md">
                                        {formatBytes(activeItem.compressedSize)}
                                    </div>

                                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none border-r border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ width: `${sliderPosition}%` }}>
                                        <img src={activeItem.previewUrl} className="absolute top-0 left-0 w-full h-full object-contain max-w-none" />
                                        <div className="absolute top-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded border border-white/20 backdrop-blur-md">
                                            {formatBytes(activeItem.originalSize)}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 bottom-0 w-px bg-white/80 left-[50%] pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                                            <MoveHorizontal className="w-4 h-4 text-black" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Loader2 className="w-10 h-10 text-gray-900 dark:text-white animate-spin" />
                            )}
                        </div>
                    </div>
                )}

                {/* MODE 3: BATCH LIST VIEW */}
                {isBatchMode && (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500">Batch Queue ({items.length})</h2>
                            <button onClick={() => setItems([])} className="text-xs text-red-500 hover:text-red-600 hover:underline">Clear All</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-900 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 shrink-0 relative">
                                        <img src={item.previewUrl} className="w-full h-full object-cover" />
                                        {item.status === 'compressing' && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">{item.file.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">{formatBytes(item.originalSize)}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-500">→</span>
                                            <span className="text-xs text-black dark:text-white font-bold">
                                                {item.compressedSize > 0 ? formatBytes(item.compressedSize) : "..."}
                                            </span>
                                            {item.compressedSize > 0 && (
                                                <span className="text-[10px] text-gray-600 dark:text-zinc-300 bg-gray-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                                    -{Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.status === 'done' && (
                                            <a href={item.compressedUrl!} download={`compressed_${item.file.name}`} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-gray-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}