"use client";

import React, { useState } from 'react';
import { Scaling, Sparkles, Loader2, Zap } from 'lucide-react';

interface UpscaleToolProps {
  image: string | null;
  onApply: (blob: Blob) => void;
}

export default function UpscaleTool({ image, onApply }: UpscaleToolProps) {
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpscale = async () => {
    if (!image) return;
    setIsProcessing(true);

    // Small delay to allow UI to show loading state before heavy canvas operation
    await new Promise(r => setTimeout(r, 100));

    try {
      const img = new Image();
      img.src = image;
      img.crossOrigin = "anonymous";
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas failed");

      // Set new dimensions
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      // High Quality Scaling Settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image at new size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Export
      canvas.toBlob((blob) => {
        if (blob) onApply(blob);
        setIsProcessing(false);
      }, 'image/png'); // PNG handles upscale data better without artifacts

    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-zinc-300 dark:border-zinc-700">
          <Scaling className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">Smart Upscaler</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Increase resolution while preserving quality.
          </p>
        </div>
      </div>

      {/* Scale Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
          Scale Factor
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                ${scale === s 
                  ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
            >
              <span className="text-xl font-black">{s}x</span>
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                {s === 2 ? 'HD Quality' : 'Ultra HD'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Badge */}
      <div className="p-3 bg-black-50 dark:bg-black-900/20 rounded-lg text-xs text-black-600 dark:text-black-300 flex items-start gap-2 border border-black-100 dark:border-black-900">
        <Sparkles size={14} className="mt-0.5 shrink-0" />
        <span>
          Output will be converted to PNG to prevent compression artifacts during upscaling.
        </span>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleUpscale}
        disabled={isProcessing || !image}
        className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2
          ${isProcessing 
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
            : 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200'
          }`}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Upscaling...
          </>
        ) : (
          <>
            <Zap size={18} className="fill-current" /> Apply Upscale
          </>
        )}
      </button>
    </div>
  );
}