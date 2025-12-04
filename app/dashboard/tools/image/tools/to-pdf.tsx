"use client";

import React, { useState } from 'react';
import { FileText, Check, File, Maximize, LayoutTemplate, Loader2 } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ToPdfToolProps {
  image: string | null;
  file?: File | null;
  editState: any; 
  onApply: (blob: Blob) => void;
}

export default function ToPdfTool({ image, file, editState, onApply }: ToPdfToolProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // PDF Settings
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'original'>('a4');
  const [orientation, setOrientation] = useState<'p' | 'l' | 'auto'>('auto');
  const [margin, setMargin] = useState<number>(20); // Pixels

  const handleApply = async () => {
    if (!image) return;
    setIsGenerating(true);

    try {
      // 1. Prepare the Source Image (Bake filters first)
      const img = new Image();
      img.src = image;
      img.crossOrigin = "anonymous";
      await new Promise((resolve) => { img.onload = resolve; });

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = img.naturalWidth;
      sourceCanvas.height = img.naturalHeight;
      const sourceCtx = sourceCanvas.getContext('2d');
      if (!sourceCtx) throw new Error("Canvas failed");

      // Apply Filters to source
      const filterString = `brightness(${editState.brightness}%) contrast(${editState.contrast}%) saturate(${editState.saturate}%) grayscale(${editState.grayscale}%) sepia(${editState.sepia}%) hue-rotate(${editState.hueRotate}deg) blur(${editState.blur}px)`;
      sourceCtx.filter = filterString;
      sourceCtx.drawImage(img, 0, 0);

      // 2. Setup Page Dimensions
      let finalOrientation = orientation;
      if (orientation === 'auto') {
        finalOrientation = sourceCanvas.width > sourceCanvas.height ? 'l' : 'p';
      }

      // Calculate base dimensions using jsPDF (approx 96 DPI units)
      const doc = new jsPDF({
        orientation: finalOrientation === 'auto' ? 'p' : finalOrientation,
        unit: 'px',
        format: pageSize === 'original' ? [sourceCanvas.width, sourceCanvas.height] : pageSize
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- QUALITY FIX: High Resolution Scale ---
      // We multiply the canvas size by 3 to simulate ~300 DPI print quality
      // If we use 'original' size, we stick to 1:1 to avoid upscaling artifacts
      const scaleFactor = pageSize === 'original' ? 1 : 3;

      // 3. Create the "Page Canvas"
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = pageWidth * scaleFactor;
      pageCanvas.height = pageHeight * scaleFactor;
      const pageCtx = pageCanvas.getContext('2d');
      if (!pageCtx) throw new Error("Page Canvas failed");

      // Scale the context so our standard measurements draw at high resolution
      pageCtx.scale(scaleFactor, scaleFactor);

      // Fill Page Background (White)
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageWidth, pageHeight);

      // 4. Calculate Image Position & Scale (using unscaled units)
      let targetW = pageWidth - (margin * 2);
      let targetH = pageHeight - (margin * 2);

      if (pageSize === 'original') {
        targetW = pageWidth;
        targetH = pageHeight;
      }

      const imgRatio = sourceCanvas.width / sourceCanvas.height;
      const pageRatio = targetW / targetH;

      let finalW, finalH;

      // Fit logic
      if (pageSize === 'original') {
         finalW = pageWidth;
         finalH = pageHeight;
      } else {
        if (imgRatio > pageRatio) {
          finalW = targetW;
          finalH = targetW / imgRatio;
        } else {
          finalH = targetH;
          finalW = targetH * imgRatio;
        }
      }

      // Center the image
      const x = (pageWidth - finalW) / 2;
      const y = (pageHeight - finalH) / 2;

      // Draw the filtered source onto the white page
      pageCtx.drawImage(sourceCanvas, x, y, finalW, finalH);
      
      // 5. Export as PNG (Lossless) to preserve quality for the main canvas
      pageCanvas.toBlob((blob) => {
        if (blob) {
          onApply(blob);
        }
      }, 'image/png');

    } catch (err) {
      console.error(err);
      alert("Failed to render PDF preview");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="p-2 bg-black-100 dark:bg-black-900/30 text-black-600 dark:text-black-400 rounded-lg">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">PDF Builder</h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Convert image to document</p>
        </div>
      </div>

      {/* --- SETTINGS --- */}
      <div className="space-y-4">
        
        {/* Page Size */}
        <div>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
            Page Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'a4', label: 'A4' },
              { id: 'letter', label: 'Letter' },
              { id: 'original', label: 'Fit Image' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPageSize(opt.id as any)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all
                  ${pageSize === opt.id 
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white' 
                    : 'text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div className={pageSize === 'original' ? 'opacity-50 pointer-events-none' : ''}>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
            Orientation
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'auto', label: 'Auto', icon: Maximize },
              { id: 'p', label: 'Portrait', icon: File },
              { id: 'l', label: 'Landscape', icon: LayoutTemplate },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setOrientation(opt.id as any)}
                className={`py-2 flex flex-col items-center gap-1 text-xs font-bold rounded-lg border transition-all
                  ${orientation === opt.id 
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white' 
                    : 'text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Margins */}
        <div className={pageSize === 'original' ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Page Margins
            </label>
            <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-900 dark:text-white">
              {margin}px
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="10" 
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
        </div>

      </div>

      {/* --- ACTION BUTTON --- */}
      <button 
        onClick={handleApply}
        disabled={isGenerating || !image}
        className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2
          ${isGenerating 
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
            : 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200'
          }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Rendering Page...
          </>
        ) : (
          <>
            <Check size={18} /> Apply PDF Layout
          </>
        )}
      </button>

    </div>
  );
}