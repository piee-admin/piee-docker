"use client";

import React, { useState, useRef } from "react";
import { Download, Upload, Image as ImageIcon, Sliders, RefreshCcw, Loader2 } from "lucide-react";

export default function ImageFilterStudio() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    blur: 0, // Added blur for fun
  });

  const imgRef = useRef<HTMLImageElement>(null);

  // --- Helper: Generate the Filter String ---
  // 1. Used for CSS (Visual Preview)
  // 2. Used for Canvas (Actual Processing)
  const getFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`;
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetFilters();
  };

  // --- The Heavy Lifting: Bake filters into pixels and download ---
  const handleDownload = async () => {
    if (!imageFile || !previewUrl || !imgRef.current) return;

    setIsProcessing(true);

    // Small delay to let the button show the spinner
    setTimeout(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;

        if (!ctx || !img) return;

        // Set canvas to match original image resolution
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // 1. Apply the Filter String to the Context
        // CRITICAL FIX: This string must be clean (no newlines)
        ctx.filter = getFilterString();

        // 2. Draw the image (The filter is applied during drawing)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 3. Convert to URL
        const outputUrl = canvas.toDataURL("image/png");

        // 4. Trigger Download
        const link = document.createElement('a');
        link.href = outputUrl;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-white/20">
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#09090b] to-[#09090b] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Image Filter Studio</h1>
        <p className="text-white/40 mb-8">Professional grade color grading and effects.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT COLUMN: Controls (4 Cols) ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Source
              </h2>

              <label className={`group relative border border-dashed border-white/20 bg-black/20 p-6 rounded-xl block text-center cursor-pointer transition-all hover:bg-white/5 ${!imageFile ? 'py-10' : 'py-4'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                
                {!previewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white/70" />
                    </div>
                    <span className="text-sm text-white/70 font-medium">Upload Image</span>
                  </div>
                ) : (
                   <div className="flex items-center gap-3">
                      <img src={previewUrl} className="w-12 h-12 rounded bg-black/50 object-cover border border-white/10" />
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-[150px]">{imageFile?.name}</p>
                        <p className="text-xs text-white/40">Click to replace</p>
                      </div>
                   </div>
                )}
              </label>
            </div>

            {/* Filters Card */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                      <Sliders className="w-4 h-4" /> Adjustments
                  </h2>
                  <button 
                    onClick={resetFilters} 
                    disabled={!imageFile}
                    className="text-xs flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 transition disabled:opacity-30"
                  >
                    <RefreshCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-5">
                    {/* Helper to render sliders */}
                    {[
                        { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1 },
                        { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1 },
                        { key: 'saturation', label: 'Saturation', min: 0, max: 200, step: 1 },
                        { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1 },
                        { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1 },
                        { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1 },
                        { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, step: 1, unit: '°' },
                    ].map((f) => (
                        <div key={f.key} className="group">
                            <div className="flex justify-between mb-2 text-xs font-medium">
                                <span className="text-white/70 group-hover:text-white transition-colors">{f.label}</span>
                                <span className="text-white/40 font-mono">
                                    {/* @ts-ignore */}
                                    {filters[f.key]}{f.unit || '%'}
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min={f.min} max={f.max} step={f.step}
                                // @ts-ignore
                                value={filters[f.key]}
                                // @ts-ignore
                                onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) }))}
                                disabled={!imageFile}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-blue-400 disabled:opacity-30"
                            />
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN: Live Preview & Download (8 Cols) ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex-1 flex flex-col relative overflow-hidden shadow-2xl">
                
                {/* Header inside Preview */}
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                        Preview
                    </h2>
                    {imageFile && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 animate-pulse">
                            Live Preview Active
                        </span>
                    )}
                </div>

                {/* Canvas / Image Area */}
                <div className="flex-1 flex items-center justify-center bg-black/40 rounded-xl border border-white/5 p-4 relative overflow-hidden min-h-[400px]">
                    
                    {/* Checkerboard pattern for transparency */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!previewUrl ? (
                        <div className="text-center space-y-3 opacity-40">
                             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                <ImageIcon className="w-8 h-8" />
                             </div>
                            <p className="text-sm">Upload an image to start editing</p>
                        </div>
                    ) : (
                        /* THIS IS THE LIVE PREVIEW */
                        /* We apply the CSS filter string directly to this image */
                        <img
                            ref={imgRef}
                            src={previewUrl}
                            className="max-w-full max-h-[600px] object-contain rounded shadow-2xl transition-all duration-100 ease-linear"
                            style={{ 
                                filter: getFilterString(), 
                                transform: 'translateZ(0)' // Hardware acceleration hint
                            }}
                            alt="Live Preview"
                        />
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-6 flex justify-end pt-4 border-t border-white/10">
                    <button
                        onClick={handleDownload}
                        disabled={!imageFile || isProcessing}
                        className="py-3 px-6 bg-white text-black rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-white/20 active:scale-95"
                    >
                        {isProcessing ? (
                            <> <Loader2 className="w-4 h-4 animate-spin" /> Processing... </>
                        ) : (
                            <> <Download className="w-4 h-4" /> Download Processed Image </>
                        )}
                    </button>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}