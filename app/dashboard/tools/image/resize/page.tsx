
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Download, Link2, Link2Off, RefreshCw, Image as ImageIcon, Monitor, Smartphone, Instagram } from "lucide-react";

export default function ImageResizer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);

  // Dimensions State
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  
  // Settings
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [isResizing, setIsResizing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOriginalSize({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
      setResizedUrl(null); // Clear old result
    };
  };

  // --- RESIZING LOGIC ---
  // We use a debounce effect so it doesn't stutter while typing
  useEffect(() => {
    if (!imageFile || !previewUrl || width === 0 || height === 0) return;

    const resizeImage = () => {
      setIsResizing(true);
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        const output = canvas.toDataURL(format, 0.9); // 0.9 quality for jpeg/webp
        setResizedUrl(output);
        setIsResizing(false);
      };
    };

    const timer = setTimeout(resizeImage, 300); // 300ms delay
    return () => clearTimeout(timer);
  }, [width, height, format, previewUrl]);


  // --- INPUT HANDLERS ---
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setWidth(val);
    if (lockAspectRatio && aspectRatio) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setHeight(val);
    if (lockAspectRatio && aspectRatio) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  // --- PRESETS ---
  const applyPreset = (w: number, h?: number) => {
    setWidth(w);
    if (h) {
      setHeight(h);
    } else if (lockAspectRatio && aspectRatio) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const scalePercentage = (percent: number) => {
    const newW = Math.round(originalSize.w * percent);
    const newH = Math.round(originalSize.h * percent);
    setWidth(newW);
    setHeight(newH);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-white/20">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#09090b] to-[#09090b] pointer-events-none -z-10" />

      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold tracking-tight">Image Resizer</h1>
        </div>
        <p className="text-white/40 mb-8 ml-11">Change dimensions pixel-perfectly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONTROLS (1/3) ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/20 rounded-xl bg-black/20 cursor-pointer hover:bg-white/5 transition group">
                {!imageFile ? (
                    <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-blue-400 mb-2 opacity-70 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-white/60">Upload Image</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-4 w-full">
                        <img src={previewUrl!} className="w-14 h-14 rounded bg-black object-contain border border-white/10" />
                        <div className="overflow-hidden text-left flex-1">
                             <p className="text-sm font-medium truncate">{imageFile.name}</p>
                             <p className="text-xs text-white/40">{originalSize.w} x {originalSize.h} px</p>
                        </div>
                        <div className="text-xs bg-white/10 px-2 py-1 rounded">Change</div>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Dimensions Controls */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-6">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Dimensions</label>
                    <button 
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-all ${lockAspectRatio ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                        title="Lock Aspect Ratio"
                    >
                        {lockAspectRatio ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
                        {lockAspectRatio ? 'Locked' : 'Unlocked'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 relative">
                    <div>
                        <label className="text-[10px] text-white/40 mb-1 block pl-1">Width</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={width || ''} 
                                onChange={handleWidthChange}
                                disabled={!imageFile}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-3 pr-8 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">px</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-white/40 mb-1 block pl-1">Height</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={height || ''} 
                                onChange={handleHeightChange}
                                disabled={!imageFile}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-3 pr-8 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">px</span>
                        </div>
                    </div>
                    
                    {/* Link Icon in the middle */}
                    {lockAspectRatio && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[-2px] text-white/10 pointer-events-none">
                            <Link2 className="w-4 h-4 rotate-90" />
                        </div>
                    )}
                </div>

                {/* Quick Presets */}
                <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">Quick Resizing</label>
                    
                    {/* Percentage */}
                    <div className="flex gap-2 mb-3">
                        {[0.25, 0.50, 0.75].map((p) => (
                            <button key={p} onClick={() => scalePercentage(p)} disabled={!imageFile} className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/60 transition-colors">
                                {p * 100}%
                            </button>
                        ))}
                         <button onClick={() => scalePercentage(1)} disabled={!imageFile} className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/60 transition-colors">
                                Original
                        </button>
                    </div>

                    {/* Social/Standards */}
                    <div className="grid grid-cols-3 gap-2">
                         <button onClick={() => applyPreset(1920, 1080)} disabled={!imageFile} className="flex flex-col items-center gap-1 py-3 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-lg group transition-all">
                             <Monitor className="w-4 h-4 text-white/40 group-hover:text-blue-400" />
                             <span className="text-[10px] text-white/50">HD 1080p</span>
                         </button>
                         <button onClick={() => applyPreset(1080, 1080)} disabled={!imageFile} className="flex flex-col items-center gap-1 py-3 bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/30 rounded-lg group transition-all">
                             <Instagram className="w-4 h-4 text-white/40 group-hover:text-pink-400" />
                             <span className="text-[10px] text-white/50">Square</span>
                         </button>
                         <button onClick={() => applyPreset(1080, 1920)} disabled={!imageFile} className="flex flex-col items-center gap-1 py-3 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-lg group transition-all">
                             <Smartphone className="w-4 h-4 text-white/40 group-hover:text-purple-400" />
                             <span className="text-[10px] text-white/50">Story</span>
                         </button>
                    </div>
                </div>

                {/* Output Format */}
                <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">Save Format</label>
                    <select 
                        value={format}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none"
                    >
                        <option value="image/png">PNG (Best Quality)</option>
                        <option value="image/jpeg">JPEG (Small File)</option>
                        <option value="image/webp">WEBP (Modern Web)</option>
                    </select>
                </div>
            </div>
          </div>

          {/* ---------------- RIGHT: PREVIEW (2/3) ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex-1 flex flex-col shadow-2xl relative">
                
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                        Preview
                    </h2>
                    {resizedUrl && (
                        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs text-blue-400 font-mono">
                            {width} × {height}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#111] rounded-xl border border-white/5 min-h-[500px]">
                    
                    {/* Transparency Grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!resizedUrl ? (
                        <div className="text-center opacity-30 z-10 space-y-3">
                             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                <ImageIcon className="w-8 h-8" />
                             </div>
                             <p>Upload to resize</p>
                        </div>
                    ) : (
                        <img 
                            src={resizedUrl} 
                            className="relative z-10 max-w-full max-h-[600px] object-contain shadow-2xl transition-all duration-200" 
                            style={{ opacity: isResizing ? 0.5 : 1 }}
                        />
                    )}
                </div>

                {/* Download Bar */}
                {resizedUrl && (
                    <div className="mt-6 flex justify-end animate-in slide-in-from-bottom-2">
                        <a
                            href={resizedUrl}
                            download={`resized_${width}x${height}_${imageFile?.name.split('.')[0]}.${format.split('/')[1]}`}
                            className="w-full sm:w-auto py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
                        >
                            <Download className="w-5 h-5" /> 
                            Download Image
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