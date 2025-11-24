"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Download, Link2, Link2Off, RefreshCw, Image as ImageIcon, Monitor, Smartphone, Instagram, ChevronDown, Check } from "lucide-react";

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

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setResizedUrl(null); 
    };
  };

  // --- RESIZING LOGIC ---
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

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        const output = canvas.toDataURL(format, 0.9);
        setResizedUrl(output);
        setIsResizing(false);
      };
    };

    const timer = setTimeout(resizeImage, 300); 
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

  // Format Options for Dropdown
  const formatOptions = [
    { value: "image/png", label: "PNG", desc: "Best Quality" },
    { value: "image/jpeg", label: "JPEG", desc: "Small File" },
    { value: "image/webp", label: "WEBP", desc: "Modern Web" },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-zinc-800 transition-colors duration-300">
      
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8 text-black dark:text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Image Resizer</h1>
        </div>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 ml-11">Change dimensions pixel-perfectly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONTROLS (1/3) ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload */}
            <div className="p-5 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md transition-colors">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-black/20 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition group">
                {!imageFile ? (
                    <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-gray-400 dark:text-zinc-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Upload Image</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-4 w-full">
                        <img src={previewUrl!} className="w-14 h-14 rounded bg-gray-100 dark:bg-black object-contain border border-gray-200 dark:border-zinc-700" />
                        <div className="overflow-hidden text-left flex-1">
                             <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{imageFile.name}</p>
                             <p className="text-xs text-gray-500 dark:text-zinc-500">{originalSize.w} x {originalSize.h} px</p>
                        </div>
                        <div className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700">Change</div>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Dimensions Controls */}
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md space-y-6 transition-colors">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Dimensions</label>
                    <button 
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-all 
                            ${lockAspectRatio 
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'}`}
                        title="Lock Aspect Ratio"
                    >
                        {lockAspectRatio ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
                        {lockAspectRatio ? 'Locked' : 'Unlocked'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 relative">
                    <div>
                        <label className="text-[10px] text-gray-500 dark:text-zinc-500 mb-1 block pl-1">Width</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={width || ''} 
                                onChange={handleWidthChange}
                                disabled={!imageFile}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-zinc-700 rounded-lg py-3 pl-3 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-zinc-500">px</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 dark:text-zinc-500 mb-1 block pl-1">Height</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={height || ''} 
                                onChange={handleHeightChange}
                                disabled={!imageFile}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-zinc-700 rounded-lg py-3 pl-3 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-zinc-500">px</span>
                        </div>
                    </div>
                    
                    {/* Link Icon in the middle */}
                    {lockAspectRatio && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[-2px] text-gray-400 dark:text-white/20 pointer-events-none">
                            <Link2 className="w-4 h-4 rotate-90" />
                        </div>
                    )}
                </div>

                {/* Quick Presets */}
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3 block">Quick Resizing</label>
                    
                    {/* Percentage */}
                    <div className="flex gap-2 mb-3">
                        {[0.25, 0.50, 0.75].map((p) => (
                            <button key={p} onClick={() => scalePercentage(p)} disabled={!imageFile} className="flex-1 py-2 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded text-xs text-gray-600 dark:text-zinc-400 transition-colors">
                                {p * 100}%
                            </button>
                        ))}
                         <button onClick={() => scalePercentage(1)} disabled={!imageFile} className="flex-1 py-2 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded text-xs text-gray-600 dark:text-zinc-400 transition-colors">
                                Original
                        </button>
                    </div>

                    {/* Social/Standards */}
                    <div className="grid grid-cols-3 gap-2">
                         <button onClick={() => applyPreset(1920, 1080)} disabled={!imageFile} className="flex flex-col items-center gap-1 py-3 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg group transition-all">
                             <Monitor className="w-4 h-4 text-gray-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
                             <span className="text-[10px] text-gray-500 dark:text-zinc-500 group-hover:text-gray-900 dark:group-hover:text-zinc-300">HD 1080p</span>
                         </button>
                         <button onClick={() => applyPreset(1080, 1080)} disabled={!imageFile} className="flex flex-col items-center gap-1 py-3 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg group transition-all">
                             <Instagram className="w-4 h-4 text-gray-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
                             <span className="text-[10px] text-gray-500 dark:text-zinc-500 group-hover:text-gray-900 dark:group-hover:text-zinc-300">Square</span>
                         </button>
                         <button onClick={() => applyPreset(1080, 1920)} disabled={!imageFile} className="flex flex-col items-center gap-1 py-3 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg group transition-all">
                             <Smartphone className="w-4 h-4 text-gray-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
                             <span className="text-[10px] text-gray-500 dark:text-zinc-500 group-hover:text-gray-900 dark:group-hover:text-zinc-300">Story</span>
                         </button>
                    </div>
                </div>

                {/* Output Format - CUSTOM DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3 block">Save Format</label>
                    
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 rounded-lg py-2.5 px-3 text-sm text-gray-900 dark:text-white transition-colors focus:outline-none focus:border-black dark:focus:border-white"
                    >
                        <span className="uppercase">{format.split('/')[1]}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            {formatOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setFormat(opt.value as any);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors
                                        ${format === opt.value 
                                            ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white' 
                                            : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-zinc-200'}
                                    `}
                                >
                                    <div>
                                        <span className="block font-medium">{opt.label}</span>
                                        <span className="block text-[10px] opacity-60">{opt.desc}</span>
                                    </div>
                                    {format === opt.value && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* ---------------- RIGHT: PREVIEW (2/3) ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-2xl backdrop-blur-md flex-1 flex flex-col relative overflow-hidden transition-colors">
                
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                        Preview
                    </h2>
                    {resizedUrl && (
                        <div className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-full text-xs font-mono font-bold border border-transparent dark:border-white/20 shadow-sm">
                            {width} × {height}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-zinc-800 min-h-[500px]">
                    {/* Transparency Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!resizedUrl ? (
                        <div className="text-center opacity-40 z-10 space-y-3">
                             <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mx-auto border border-gray-200 dark:border-zinc-700">
                                <ImageIcon className="w-8 h-8 text-gray-400 dark:text-zinc-400" />
                             </div>
                             <p className="text-gray-500 dark:text-zinc-400">Upload to resize</p>
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
                            className="w-full sm:w-auto py-3 px-8 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
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