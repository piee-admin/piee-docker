"use client";

import React, { useState, useEffect } from 'react';
import { Check, Loader2, Calculator } from 'lucide-react';

interface CompressToolProps {
  image: string | null;
  file?: File | null;
  onApply: (blob: Blob) => void;
}

export default function CompressTool({ image, file, onApply }: CompressToolProps) {
  const [quality, setQuality] = useState<number>(0.8);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [targetSizeKB, setTargetSizeKB] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize original size - UPDATE when file or image changes
  useEffect(() => {
    if (file) {
      setOriginalSize(file.size);
    } else if (image) {
      fetch(image).then(r => r.blob()).then(b => setOriginalSize(b.size));
    }
  }, [file, image]); // This now triggers when image updates after Apply

  // Compression Logic
  useEffect(() => {
    if (!image) return;
    
    const compress = async () => {
      setIsProcessing(true);
      const img = new Image();
      img.src = image;
      await new Promise(r => img.onload = r);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setCompressedBlob(blob);
          setCompressedSize(blob.size);
        }
        setIsProcessing(false);
      }, format, quality);
    };

    const timer = setTimeout(compress, 500); 
    return () => clearTimeout(timer);
  }, [image, quality, format]);

  // Auto Calculation (Binary Search)
  const calculateQualityForSize = async () => {
    if (!image || !targetSizeKB) return;
    const targetBytes = parseFloat(targetSizeKB) * 1024;
    if (targetBytes <= 0) return;

    setIsCalculating(true);

    const img = new Image();
    img.src = image;
    await new Promise(r => img.onload = r);

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

    while (attempts < 5) {
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

  const handleApply = () => {
    if (compressedBlob) {
      onApply(compressedBlob);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const percentSaved = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Quality Control */}
      <div>
        <div className="flex justify-between mb-2 items-end">
             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quality</label>
             <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">{Math.round(quality * 100)}%</span>
        </div>
        <input 
             type="range" min="0.01" max="1" step="0.01"
             value={quality}
             onChange={(e) => {
                 setQuality(parseFloat(e.target.value));
                 setTargetSizeKB("");
             }}
             disabled={isCalculating}
             className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
        />
      </div>

      <div className="relative flex items-center justify-center py-2">
         <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div></div>
         <span className="relative bg-white dark:bg-zinc-900 px-2 text-[10px] text-zinc-400 font-bold uppercase">OR</span>
      </div>

      {/* 2. Target Size */}
      <div>
         <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Target Size (KB)</label>
         <div className="flex gap-2">
             <div className="relative flex-1">
                 <input 
                    type="number" 
                    placeholder="e.g. 500"
                    value={targetSizeKB}
                    onChange={(e) => setTargetSizeKB(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 pl-3 pr-8 text-sm text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-400"
                 />
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">KB</span>
             </div>
             <button 
                onClick={calculateQualityForSize}
                disabled={!targetSizeKB || isCalculating}
                className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 px-3 rounded-lg text-xs font-bold flex items-center gap-1"
             >
                {isCalculating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Calculator className="w-3 h-3" />}
                Auto
             </button>
         </div>
      </div>

      {/* 3. Format */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Output Format</label>
        <div className="grid grid-cols-2 gap-2">
           <button
             onClick={() => setFormat("image/jpeg")}
             className={`py-2 rounded-lg text-xs font-bold border transition-colors ${format === "image/jpeg" ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black' : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
           >
             JPEG
           </button>
           <button
             onClick={() => setFormat("image/webp")}
             className={`py-2 rounded-lg text-xs font-bold border transition-colors ${format === "image/webp" ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black' : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
           >
             WEBP
           </button>
        </div>
      </div>

      {/* 4. Stats Card */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Original:</span>
          <span className="font-mono text-zinc-900 dark:text-white">{formatBytes(originalSize)}</span>
        </div>
        <div className="flex justify-between text-xs items-center">
          <span className="text-zinc-500">Compressed:</span>
          <span className="font-mono font-bold text-black dark:text-white flex items-center gap-2">
             {isProcessing ? (
                <span className="flex items-center gap-1 text-zinc-400"><Loader2 className="w-3 h-3 animate-spin"/> Calculating...</span>
             ) : (
                <>
                  {formatBytes(compressedSize)}
                  {percentSaved > 0 && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded">-{percentSaved}%</span>}
                </>
             )}
          </span>
        </div>
      </div>

      <button 
        onClick={handleApply}
        disabled={!compressedBlob || isProcessing}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check size={16} /> Apply to Canvas
      </button>
    </div>
  );
}