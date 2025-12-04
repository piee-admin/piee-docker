"use client";

import React, { useState } from 'react';
import { Eraser, Zap, Loader2, AlertCircle } from 'lucide-react';
import { removeBackground, Config } from "@imgly/background-removal";

interface RemoveBgToolProps {
  image: string | null;
  onApply: (blob: Blob) => void;
}

// Define the exact types the library expects
type ModelType = 'isnet' | 'isnet_fp16';

export default function RemoveBgTool({ image, onApply }: RemoveBgToolProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState<string>("");
  
  // Settings
  const [model, setModel] = useState<ModelType>('isnet'); 
  const [bgColor, setBgColor] = useState<'transparent' | 'white' | 'black'>('transparent');

  const handleRemoveBackground = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);
    setProgressText("Initializing AI...");

    try {
      const config: Config = {
        model: model,
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgressText(`Loading model: ${percent}%`);
        },
      };

      const imageBlob = await removeBackground(image, config);

      if (bgColor === 'transparent') {
        onApply(imageBlob);
      } 
      else {
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error("Canvas context failed");

        ctx.fillStyle = bgColor === 'white' ? '#ffffff' : '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((finalBlob) => {
          if (finalBlob) onApply(finalBlob);
        }, 'image/png');
      }

    } catch (err) {
      console.error(err);
      setError("Failed to process image. Browser might be blocking the model download.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  return (
    <div className="space-y-6 pt-2">
      
      {/* --- ICON HEADER --- */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-zinc-300 dark:border-zinc-700">
          <Eraser className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">AI Background Removal</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Processing runs locally in your browser.
          </p>
        </div>
      </div>

      {/* --- OPTIONS --- */}
      <div className="space-y-4">
        
        {/* Quality Selector */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
            Model Quality
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setModel('isnet_fp16')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all
                ${model === 'isnet_fp16' 
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-sm' 
                  : 'text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
            >
              Speed (Fast)
            </button>
            <button
              onClick={() => setModel('isnet')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all
                ${model === 'isnet' 
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-sm' 
                  : 'text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
            >
              Quality (Best)
            </button>
          </div>
        </div>

        {/* Background Color Selector */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
            Replacement Background
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setBgColor('transparent')}
              className={`flex-1 h-10 rounded-lg border flex items-center justify-center gap-2 transition-all relative overflow-hidden
                ${bgColor === 'transparent' 
                  ? 'border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
            >
              <div className="absolute inset-0 opacity-20" 
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
              </div>
              <span className={`relative text-xs font-bold z-10 ${bgColor === 'transparent' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                None
              </span>
            </button>

            <button
              onClick={() => setBgColor('white')}
              className={`flex-1 h-10 rounded-lg border bg-white flex items-center justify-center gap-2 transition-all
                ${bgColor === 'white' 
                  ? 'border-zinc-900 ring-1 ring-zinc-900' 
                  : 'border-zinc-200'}`}
            >
              <div className="w-3 h-3 rounded-full border border-zinc-300 bg-white"></div>
            </button>

            <button
              onClick={() => setBgColor('black')}
              className={`flex-1 h-10 rounded-lg border bg-black flex items-center justify-center gap-2 transition-all
                ${bgColor === 'black' 
                  ? 'border-white ring-1 ring-white' 
                  : 'border-zinc-800'}`}
            >
              <div className="w-3 h-3 rounded-full border border-zinc-600 bg-zinc-900"></div>
            </button>
          </div>
        </div>
      </div>

      {/* --- ERROR MESSAGE --- */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* --- ACTION BUTTON --- */}
      <button 
        onClick={handleRemoveBackground}
        disabled={isProcessing || !image}
        className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2
          ${isProcessing 
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
            : 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200'
          }`}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Zap size={18} className="fill-current" /> Remove Background
          </>
        )}
      </button>

      {isProcessing && (
         <p className="text-[10px] text-center text-zinc-400 font-mono">
           {progressText || "Initializing..."}
         </p>
      )}
    </div>
  );
}