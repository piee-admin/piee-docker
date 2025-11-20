"use client";

import React, { useState, useRef } from "react";
import { Download, Upload, Image as ImageIcon, Sliders, RefreshCcw, Loader2, Sparkles, Wand2 } from "lucide-react";

// Define presets for quick styling
const FILTER_PRESETS = [
  { name: "Normal", values: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
  { name: "Vivid", values: { brightness: 110, contrast: 120, saturation: 140, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
  { name: "Noir", values: { brightness: 100, contrast: 130, saturation: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0 } },
  { name: "Vintage", values: { brightness: 100, contrast: 90, saturation: 60, grayscale: 0, sepia: 50, hueRotate: 0, blur: 0 } },
  { name: "Dramatic", values: { brightness: 90, contrast: 150, saturation: 90, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
  { name: "Soft", values: { brightness: 105, contrast: 85, saturation: 90, grayscale: 0, sepia: 10, hueRotate: 0, blur: 0.5 } },
];

export default function ImageFilterStudio() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter states
  const [filters, setFilters] = useState(FILTER_PRESETS[0].values);

  const imgRef = useRef<HTMLImageElement>(null);

  // --- Helper: Generate the Filter String ---
  const getFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`;
  };

  const resetFilters = () => {
    setFilters(FILTER_PRESETS[0].values);
  };

  const applyPreset = (values: typeof filters) => {
    setFilters(values);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetFilters();
  };

  // --- Bake filters into pixels and download ---
  const handleDownload = async () => {
    if (!imageFile || !previewUrl || !imgRef.current) return;

    setIsProcessing(true);

    setTimeout(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;

        if (!ctx || !img) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Apply filter string to context
        ctx.filter = getFilterString();

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const outputUrl = canvas.toDataURL("image/png");

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
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-zinc-800">
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-white">Filter Studio</h1>
        </div>
        <p className="text-zinc-400 mb-8 ml-11">Professional grade color grading and effects.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT COLUMN: Controls (4 Cols) ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Source
              </h2>

              <label className={`group relative border border-dashed border-zinc-700 bg-black/20 p-6 rounded-xl block text-center cursor-pointer transition-all hover:bg-zinc-800/50 ${!imageFile ? 'py-10' : 'py-4'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                
                {!previewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="text-sm text-zinc-400 font-medium">Upload Image</span>
                  </div>
                ) : (
                   <div className="flex items-center gap-3">
                      <img src={previewUrl} className="w-12 h-12 rounded bg-black/50 object-cover border border-zinc-700" />
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-[150px] text-white">{imageFile?.name}</p>
                        <p className="text-xs text-zinc-500">Click to replace</p>
                      </div>
                   </div>
                )}
              </label>
            </div>

            {/* Filters & Adjustments Card */}
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                      <Sliders className="w-4 h-4" /> Adjustments
                  </h2>
                  <button 
                    onClick={resetFilters} 
                    disabled={!imageFile}
                    className="text-xs flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition disabled:opacity-30"
                  >
                    <RefreshCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Presets Grid */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                        <Wand2 className="w-3 h-3" /> Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {FILTER_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => applyPreset(preset.values)}
                                disabled={!imageFile}
                                className="py-2 px-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 hover:border-zinc-600 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-5 border-t border-zinc-800 pt-6">
                    {/* Sliders */}
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
                                <span className="text-zinc-400 group-hover:text-white transition-colors">{f.label}</span>
                                <span className="text-zinc-500 font-mono">
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
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                            />
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN: Preview ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md flex-1 flex flex-col relative overflow-hidden shadow-2xl">
                
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        Preview
                    </h2>
                    {imageFile && (
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 animate-pulse">
                            Live Preview Active
                        </span>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center bg-[#050505] rounded-xl border border-zinc-800 p-4 relative overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!previewUrl ? (
                        <div className="text-center space-y-3 opacity-40">
                             <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto border border-zinc-700">
                                <ImageIcon className="w-8 h-8 text-zinc-400" />
                             </div>
                             <p className="text-sm text-zinc-500">Upload an image to start editing</p>
                        </div>
                    ) : (
                        <img
                            ref={imgRef}
                            src={previewUrl}
                            className="max-w-full max-h-[600px] object-contain rounded shadow-2xl transition-all duration-100 ease-linear"
                            style={{ 
                                filter: getFilterString(), 
                                transform: 'translateZ(0)' 
                            }}
                            alt="Live Preview"
                        />
                    )}
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-zinc-800">
                    <button
                        onClick={handleDownload}
                        disabled={!imageFile || isProcessing}
                        className="py-3 px-6 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg active:scale-95"
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