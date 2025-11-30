"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link2, Link2Off, Monitor, Smartphone, Instagram } from 'lucide-react';

interface ResizeToolProps {
  image: string | null;
  file?: File | null;
  onApply: (blob: Blob) => void;
}

export default function ResizeTool({ image, file, onApply }: ResizeToolProps) {
  // --- STATE ---
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number>(0);

  // --- REFS ---
  // Stores the high-quality snapshot of the image when tool was opened
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  // Prevents re-initialization if the parent component updates
  const isInitialized = useRef(false);

  // --- INITIALIZATION (THE FIX) ---
  useEffect(() => {
    // If we have already loaded the source image, STOP. 
    // Do not reload even if 'image' or 'file' props change.
    if (isInitialized.current || !image) return;

    const img = new Image();
    img.src = image;
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // 1. Save this image as the Source of Truth
      sourceImageRef.current = img;
      
      // 2. Set dimensions based on this source
      setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      
      // 3. Mark as initialized so we don't overwrite this with a low-res version later
      isInitialized.current = true;
    };
  }, [image]); // We depend on 'image' just to catch the first load, but the 'isInitialized' check blocks loops.

  // --- RESIZE LOGIC ---
  useEffect(() => {
    // Only run if we have a valid source image and dimensions
    if (!sourceImageRef.current || width <= 0 || height <= 0) return;

    const resizeAndApply = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // ALWAYS draw from sourceImageRef (the high quality snapshot)
      // NEVER draw from the 'image' prop (which might be the low-res preview)
      ctx.drawImage(sourceImageRef.current!, 0, 0, width, height);

      const outputFormat = file?.type || 'image/png';
      const quality = outputFormat === 'image/jpeg' ? 0.95 : undefined;

      canvas.toBlob((blob) => {
        if (blob) {
          onApply(blob);
        }
      }, outputFormat, quality);
    };

    const timer = setTimeout(resizeAndApply, 400); // 400ms delay for performance
    return () => clearTimeout(timer);
  }, [width, height, file, onApply]); // Removed 'image' from dependencies completely

  // --- HANDLERS ---
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

  const applyPreset = (w: number, h?: number) => {
    setWidth(w);
    if (h) {
      setHeight(h);
      setLockAspectRatio(false);
    } else if (lockAspectRatio && aspectRatio) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const scalePercentage = (percent: number) => {
    // Always calculate math based on the ORIGINAL dimensions found on mount
    const newW = Math.round(originalDims.w * percent);
    const newH = Math.round(originalDims.h * percent);
    setWidth(newW);
    setHeight(newH);
  };

  if (!isInitialized) return <div className="p-4 text-xs text-zinc-500">Initializing...</div>;

  return (
    <div className="space-y-6">
      {/* Original Size Info */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Original Size:</span>
          {/* Display originalDims, which never changes during this session */}
          <span className="font-mono text-zinc-900 dark:text-white">{originalDims.w} × {originalDims.h} px</span>
        </div>
      </div>

      {/* Dimensions Control */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Dimensions</label>
          <button 
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border transition-all 
              ${lockAspectRatio 
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white' 
                : 'bg-transparent border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
          >
            {lockAspectRatio ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
            {lockAspectRatio ? 'Locked' : 'Unlocked'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1.5 block pl-1 uppercase tracking-wider">Width</label>
            <div className="relative">
              <input 
                type="number" 
                value={width || ''} 
                onChange={handleWidthChange}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2.5 pl-3 pr-9 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500">px</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1.5 block pl-1 uppercase tracking-wider">Height</label>
            <div className="relative">
              <input 
                type="number" 
                value={height || ''} 
                onChange={handleHeightChange}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2.5 pl-3 pr-9 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500">px</span>
            </div>
          </div>
          
          {lockAspectRatio && (
            <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 pointer-events-none">
              <Link2 className="w-4 h-4 rotate-90" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">Quick Resize</label>
        
        <div className="flex gap-2 mb-3">
          {[0.25, 0.50, 0.75].map((p) => (
            <button 
              key={p} 
              onClick={() => scalePercentage(p)} 
              className="flex-1 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 transition-all font-medium"
            >
              {p * 100}%
            </button>
          ))}
          <button 
            onClick={() => scalePercentage(1)} 
            className="flex-1 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 transition-all font-medium"
          >
            100%
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => applyPreset(1920, 1080)} 
            className="flex flex-col items-center gap-1.5 py-3 bg-transparent border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg group transition-all"
          >
            <Monitor className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">HD 1080p</span>
          </button>
          <button 
            onClick={() => applyPreset(1080, 1080)} 
            className="flex flex-col items-center gap-1.5 py-3 bg-transparent border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg group transition-all"
          >
            <Instagram className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Square</span>
          </button>
          <button 
            onClick={() => applyPreset(1080, 1920)} 
            className="flex flex-col items-center gap-1.5 py-3 bg-transparent border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg group transition-all"
          >
            <Smartphone className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Story</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Live Preview:</span>
          <span className="font-mono text-zinc-900 dark:text-white">{width} × {height} px</span>
        </div>
      </div>
    </div>
  );
}