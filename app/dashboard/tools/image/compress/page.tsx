"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, MoveHorizontal, Layers, Loader2, CheckCircle2, Calculator } from "lucide-react";

export default function ImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  
  // Settings
  const [quality, setQuality] = useState<number>(0.8); 
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [isCompressing, setIsCompressing] = useState(false);

  // Target Size Logic
  const [targetSizeKB, setTargetSizeKB] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Stats
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // Compare Slider State
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
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setOriginalSize(file.size);
    setCompressedUrl(null);
    setTargetSizeKB(""); // Reset target
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // --- CORE COMPRESSION HELPER ---
  const getCompressedBlob = async (img: HTMLImageElement, q: number, fmt: string): Promise<{ url: string, size: number, blob: Blob }> => {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;
            resolve({
                url: URL.createObjectURL(blob),
                size: blob.size,
                blob: blob
            });
        }, fmt, q);
    });
  };

  // --- ALGORITHM: Binary Search for Target Size ---
  const calculateQualityForSize = async () => {
    const targetBytes = parseFloat(targetSizeKB) * 1024;
    if (!targetBytes || !previewUrl || targetBytes <= 0) return;

    setIsCalculating(true);
    
    const img = new Image();
    img.src = previewUrl;
    await img.decode();

    let min = 0.01;
    let max = 1.0;
    let bestQuality = 0.5;
    let attempts = 0;

    // Try up to 7 times to find the closest quality
    while (attempts < 7) {
        const mid = (min + max) / 2;
        const result = await getCompressedBlob(img, mid, format);
        
        if (Math.abs(result.size - targetBytes) < 5000) { // Within 5KB is "close enough"
            bestQuality = mid;
            break;
        }

        if (result.size > targetBytes) {
            max = mid; // Too big, try lower quality
        } else {
            min = mid; // Too small, try higher quality
            bestQuality = mid; // Keep this as a valid candidate since it fits under the limit
        }
        attempts++;
    }

    setQuality(bestQuality);
    setIsCalculating(false);
  };

  // --- Standard Compression Effect ---
  useEffect(() => {
    if (!imageFile || !previewUrl) return;
    if (isCalculating) return; // Don't auto-compress while searching for size

    const compressImage = async () => {
      setIsCompressing(true);
      
      const img = new Image();
      img.src = previewUrl;
      await img.decode();
      
      const result = await getCompressedBlob(img, quality, format);
      
      setCompressedUrl(result.url);
      setCompressedSize(result.size);
      setIsCompressing(false);
    };

    const debounceTimer = setTimeout(compressImage, 200);
    return () => clearTimeout(debounceTimer);

  }, [imageFile, previewUrl, quality, format, isCalculating]);


  // --- Slider Logic ---
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

  const savings = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;
  const isSaving = savings > 0;

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-white/20">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#09090b] to-[#09090b] pointer-events-none -z-10" />

      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold tracking-tight">Smart Compressor</h1>
        </div>
        <p className="text-white/40 mb-8 ml-11">Optimize images by quality or target file size.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONTROLS ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/20 rounded-xl bg-black/20 cursor-pointer hover:bg-white/5 transition group">
                {!imageFile ? (
                    <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-emerald-400 mb-2 opacity-70 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-white/60">Upload Image</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-4 w-full">
                        <img src={previewUrl!} className="w-14 h-14 rounded bg-black object-contain border border-white/10" />
                        <div className="overflow-hidden text-left flex-1">
                             <p className="text-sm font-medium truncate">{imageFile.name}</p>
                             <p className="text-xs text-white/40">{formatBytes(originalSize)}</p>
                        </div>
                        <div className="text-xs bg-white/10 px-2 py-1 rounded">Change</div>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Settings Card */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-8">
                
                {/* OPTION 1: Manual Quality Slider */}
                <div>
                    <div className="flex justify-between mb-4 items-end">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Manual Quality</label>
                        <span className="text-emerald-400 font-mono text-sm font-bold">{Math.round(quality * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.01" max="1" step="0.01"
                        value={quality}
                        onChange={(e) => {
                            setQuality(parseFloat(e.target.value));
                            setTargetSizeKB(""); // Clear target size if manual slider is moved
                        }}
                        disabled={!imageFile || isCalculating}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30"
                    />
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <span className="relative bg-[#121214] px-2 text-xs text-white/30 uppercase">OR</span>
                </div>

                {/* OPTION 2: Target Size Input */}
                <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">Target File Size</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                placeholder="e.g. 500"
                                value={targetSizeKB}
                                onChange={(e) => setTargetSizeKB(e.target.value)}
                                disabled={!imageFile}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 font-medium">KB</span>
                        </div>
                        <button 
                            onClick={calculateQualityForSize}
                            disabled={!targetSizeKB || !imageFile || isCalculating}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-white/30 text-white px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Calculator className="w-4 h-4" />}
                            Auto
                        </button>
                    </div>
                    {targetSizeKB && quality < 1 && !isCalculating && (
                        <p className="text-[10px] text-emerald-400/70 mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3"/> Optimized to ~{targetSizeKB}KB (Quality: {Math.round(quality * 100)}%)
                        </p>
                    )}
                </div>

                {/* Format Selector */}
                <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">Output Format</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setFormat("image/jpeg")}
                            className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1
                                ${format === "image/jpeg" ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                        >   
                            <span>JPEG</span>
                        </button>
                        <button
                            onClick={() => setFormat("image/webp")}
                            className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1
                                ${format === "image/webp" ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                        >   
                            <span>WEBP</span>
                        </button>
                    </div>
                </div>

                {/* Comparison Stats */}
                {compressedUrl && (
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-white/40 text-xs mb-1">Result Size</p>
                            <p className={`text-xl font-bold font-mono ${isSaving ? 'text-emerald-400' : 'text-white'}`}>{formatBytes(compressedSize)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/40 text-xs mb-1">Saved</p>
                            <p className={`text-xl font-bold font-mono ${isSaving ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isSaving ? `-${savings}%` : '+0%'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* ---------------- RIGHT: CLASSIC COMPARISON PREVIEW ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex-1 flex flex-col shadow-2xl relative">
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                        Quality Comparison
                    </h2>
                    {compressedUrl && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                            <CheckCircle2 className="w-3 h-3" /> Ready to download
                        </div>
                    )}
                </div>

                <div 
                    className="flex-1 relative rounded-xl overflow-hidden bg-[#000] border border-white/5 min-h-[500px] flex items-center justify-center select-none group"
                >
                    {/* Transparency Grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!compressedUrl ? (
                        <div className="text-center opacity-30 z-10 space-y-2">
                             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                <Layers className="w-6 h-6" />
                             </div>
                             <p>Ready to compress</p>
                        </div>
                    ) : (
                        /* CLASSIC SPLIT VIEW SLIDER */
                        <div 
                            ref={compareContainerRef}
                            className="relative w-full h-full max-h-[75vh] cursor-col-resize z-10"
                            onMouseMove={handleMouseMove}
                            onTouchMove={handleTouchMove}
                        >
                            {/* 1. Background (Compressed/Right Side) */}
                            <img 
                                src={compressedUrl} 
                                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" 
                            />
                             <div className="absolute top-4 right-4 bg-emerald-900/90 text-white text-xs px-2 py-1 rounded border border-white/10 shadow-xl">
                                Compressed ({Math.round(quality * 100)}%)
                             </div>

                            {/* 2. Foreground (Original/Left Side) - Clipped */}
                            <div 
                                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none border-r border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                                style={{ width: `${sliderPosition}%` }}
                            >
                                <img 
                                    src={previewUrl!} 
                                    className="absolute top-0 left-0 w-full h-full object-contain max-w-none" 
                                />
                                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded border border-white/10">
                                    Original
                                </div>
                            </div>

                            {/* 3. THE CLASSIC DIVIDER LINE */}
                            <div 
                                className="absolute top-0 bottom-0 w-px bg-white/60 left-[50%] pointer-events-none"
                                style={{ left: `${sliderPosition}%` }}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                                    <MoveHorizontal className="w-4 h-4 text-black" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Loading Overlay */}
                    {(isCompressing || isCalculating) && (
                        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                <span className="text-sm font-medium text-white/80">{isCalculating ? 'Calculating Size...' : 'Compressing...'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Download Bar */}
                {compressedUrl && (
                     <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 animate-in slide-in-from-bottom-2">
                        <div className="text-sm text-white/40 hidden sm:block">
                            Format: <span className="text-white/60 uppercase">{format.split('/')[1]}</span>
                        </div>
                        
                        <a
                            href={compressedUrl}
                            download={`compressed_${imageFile?.name.split('.')[0]}.${format === 'image/jpeg' ? 'jpg' : 'webp'}`}
                            className="w-full sm:w-auto py-3 px-8 bg-white text-black rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                        >
                            <Download className="w-4 h-4" /> 
                            Download {formatBytes(compressedSize)}
                        </a>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}