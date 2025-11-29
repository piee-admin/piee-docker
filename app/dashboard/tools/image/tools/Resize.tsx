"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, Link2, Link2Off, Monitor, Smartphone, Instagram, ChevronDown, Loader2 } from 'lucide-react';

interface ResizeToolProps {
  image: string | null;
  file?: File | null;
  onApply: (blob: Blob) => void;
}

export default function ResizeTool({ image, file, onApply }: ResizeToolProps) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  
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

  // Initialize dimensions when image loads
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setOriginalSize({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
    };
  }, [image]);

  // Resize logic - debounced
  useEffect(() => {
    if (!image || width === 0 || height === 0) return;

    const resizeImage = () => {
      setIsProcessing(true);
      const img = new Image();
      img.src = image;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            setResizedBlob(blob);
          }
          setIsProcessing(false);
        }, format, format === 'image/jpeg' ? 0.92 : undefined);
      };
    };

    const timer = setTimeout(resizeImage, 500);
    return () => clearTimeout(timer);
  }, [image, width, height, format]);

  // Input handlers
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

  // Presets
  const applyPreset = (w: number, h?: number) => {
    setWidth(w);
    if (h) {
      setHeight(h);
      setLockAspectRatio(false); // Unlock when using fixed presets
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

  const handleApply = () => {
    if (resizedBlob) {
      onApply(resizedBlob);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatOptions = [
    { value: "image/png", label: "PNG", desc: "Best Quality" },
    { value: "image/jpeg", label: "JPEG", desc: "Small File" },
    { value: "image/webp", label: "WEBP", desc: "Modern Web" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Original Size Info */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Original Size:</span>
          <span className="font-mono text-zinc-900 dark:text-white">{originalSize.w} × {originalSize.h} px</span>
        </div>
      </div>

      {/* Dimensions Control */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Dimensions</label>
          <button 
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-all 
              ${lockAspectRatio 
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'}`}
          >
            {lockAspectRatio ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
            {lockAspectRatio ? 'Locked' : 'Unlocked'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 block pl-1">Width</label>
            <div className="relative">
              <input 
                type="number" 
                value={width || ''} 
                onChange={handleWidthChange}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-3 pl-3 pr-8 text-sm text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">px</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 block pl-1">Height</label>
            <div className="relative">
              <input 
                type="number" 
                value={height || ''} 
                onChange={handleHeightChange}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-3 pl-3 pr-8 text-sm text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">px</span>
            </div>
          </div>
          
          {/* Link Icon in the middle */}
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
        
        {/* Percentage */}
        <div className="flex gap-2 mb-3">
          {[0.25, 0.50, 0.75].map((p) => (
            <button 
              key={p} 
              onClick={() => scalePercentage(p)} 
              className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400 transition-colors font-medium"
            >
              {p * 100}%
            </button>
          ))}
          <button 
            onClick={() => scalePercentage(1)} 
            className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400 transition-colors font-medium"
          >
            Original
          </button>
        </div>

        {/* Social/Standards */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => applyPreset(1920, 1080)} 
            className="flex flex-col items-center gap-1 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg group transition-all"
          >
            <Monitor className="w-4 h-4 text-zinc-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300">HD 1080p</span>
          </button>
          <button 
            onClick={() => applyPreset(1080, 1080)} 
            className="flex flex-col items-center gap-1 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg group transition-all"
          >
            <Instagram className="w-4 h-4 text-zinc-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300">Square</span>
          </button>
          <button 
            onClick={() => applyPreset(1080, 1920)} 
            className="flex flex-col items-center gap-1 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg group transition-all"
          >
            <Smartphone className="w-4 h-4 text-zinc-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300">Story</span>
          </button>
        </div>
      </div>

      {/* Output Format Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Output Format</label>
        
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-lg py-2.5 px-3 text-sm text-zinc-900 dark:text-white transition-colors"
        >
          <span className="uppercase font-medium">{format.split('/')[1]}</span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {formatOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFormat(opt.value as any);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors
                  ${format === opt.value 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-zinc-200'}
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

      {/* Stats */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">New Size:</span>
          <span className="font-mono text-zinc-900 dark:text-white">{width} × {height} px</span>
        </div>
        {resizedBlob && (
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">File Size:</span>
            <span className="font-mono font-bold text-black dark:text-white">{formatBytes(resizedBlob.size)}</span>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <button 
        onClick={handleApply}
        disabled={!resizedBlob || isProcessing}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Check size={16} /> Apply to Canvas
          </>
        )}
      </button>
    </div>
  );
}