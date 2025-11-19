"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, MoveHorizontal, Loader2, ScanEye, Wand2 } from "lucide-react";

export default function ImageUpscaler() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  
  const [scaleFactor, setScaleFactor] = useState(2);
  const [sharpness, setSharpness] = useState(1); // 0 = None, 1 = Medium, 2 = High
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stats
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [newSize, setNewSize] = useState({ w: 0, h: 0 });

  // Compare Slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setUpscaledUrl(null);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
        setOriginalSize({ w: img.width, h: img.height });
        setNewSize({ w: img.width * scaleFactor, h: img.height * scaleFactor });
    };
  };

  useEffect(() => {
    setNewSize({ w: originalSize.w * scaleFactor, h: originalSize.h * scaleFactor });
  }, [scaleFactor, originalSize]);


  // --- THE REAL MATH: Convolution Kernel for Sharpening ---
  const applySharpenFilter = (ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) => {
    if (strength === 0) return;

    const imgData = ctx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    const width = imgData.width;
    const height = imgData.height;

    // Create a temporary buffer to store results so we don't read pixels we just modified
    const output = new Uint8ClampedArray(pixels.length);
    output.set(pixels); // Copy alpha and original values initially

    // Sharpen Kernel weights
    // A simple 3x3 kernel:
    //  0  -1   0
    // -1   5  -1
    //  0  -1   0
    // We adjust the center weight based on "strength" to control intensity
    const mix = strength === 1 ? 0.5 : 0.9; // Amount of sharpening mix
    
    // We skip the very edge pixels to avoid boundary checks for performance
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;

            // Apply kernel to RGB channels
            for (let c = 0; c < 3; c++) {
                const val = 
                    pixels[i + c - 4 * width] * -1 +   // Top
                    pixels[i + c - 4] * -1 +           // Left
                    pixels[i + c] * 5 +                // Center
                    pixels[i + c + 4] * -1 +           // Right
                    pixels[i + c + 4 * width] * -1;    // Bottom
                
                // Blend the sharpened value with the original based on strength
                output[i + c] = Math.min(255, Math.max(0, 
                    (val * mix) + (pixels[i+c] * (1 - mix)) 
                ));
            }
        }
    }

    // Write back to canvas
    const finalImageData = new ImageData(output, width, height);
    ctx.putImageData(finalImageData, 0, 0);
  };


  const handleUpscale = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);

    setTimeout(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        img.src = previewUrl;
        img.onload = () => {
            if (!ctx) return;

            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            // 1. Bicubic Upscale (Smooths it out)
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 2. Apply Real Sharpening (Adds the "Crispness" back)
            if (sharpness > 0) {
                applySharpenFilter(ctx, canvas.width, canvas.height, sharpness);
            }

            const output = canvas.toDataURL("image/png");
            setUpscaledUrl(output);
            setIsProcessing(false);
        };
    }, 100);
  };

  // Slider Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-white/20">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#09090b] to-[#09090b] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <ScanEye className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold tracking-tight">Smart Upscaler</h1>
        </div>
        <p className="text-white/40 mb-8 ml-11">Increase resolution and enhance edge clarity.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/20 rounded-xl bg-black/20 cursor-pointer hover:bg-white/5 transition group">
                {!imageFile ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-sm text-white/60">Upload Image</p>
                    </>
                ) : (
                    <div className="flex items-center gap-3 px-4">
                        <img src={previewUrl!} className="w-12 h-12 rounded bg-black object-cover" />
                        <div className="overflow-hidden">
                             <p className="text-sm font-medium truncate w-32">{imageFile.name}</p>
                             <p className="text-xs text-white/40">{originalSize.w} x {originalSize.h}</p>
                        </div>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-6">
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 block">Scale</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[2, 4].map((factor) => (
                            <button
                                key={factor}
                                onClick={() => setScaleFactor(factor)}
                                className={`py-3 rounded-lg border text-sm font-medium transition-all ${scaleFactor === factor ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'}`}
                            >
                                {factor}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sharpness Level */}
                <div>
                     <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 block">Edge Sharpening</label>
                     <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/5">
                        {['None', 'Standard', 'Strong'].map((level, idx) => (
                            <button
                                key={level}
                                onClick={() => setSharpness(idx)}
                                className={`flex-1 py-2 text-xs rounded-md transition-all ${sharpness === idx ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {level}
                            </button>
                        ))}
                     </div>
                     <p className="text-[10px] text-white/30 mt-2 px-1">
                        "Strong" may introduce noise but maximizes clarity.
                     </p>
                </div>

                <button
                    onClick={handleUpscale}
                    disabled={!imageFile || isProcessing}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                    {isProcessing ? (
                        <> <Loader2 className="w-5 h-5 animate-spin" /> Enhancing... </>
                    ) : (
                        <> <Wand2 className="w-4 h-4" /> Upscale Image </>
                    )}
                </button>
            </div>
          </div>

          {/* PREVIEW AREA */}
          <div className="lg:col-span-8">
             <div className="h-full p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Comparison</h2>
                    {upscaledUrl && <span className="text-xs text-indigo-300 flex items-center gap-1"><MoveHorizontal className="w-3 h-3" /> Slide to compare</span>}
                </div>

                <div className="flex-1 relative rounded-xl overflow-hidden bg-black/40 border border-white/5 min-h-[400px] flex items-center justify-center group select-none">
                    {!upscaledUrl ? (
                        <div className="text-center opacity-30">
                             <p>Upload and Process to see results</p>
                        </div>
                    ) : (
                        <div 
                            ref={compareContainerRef}
                            className="relative w-full h-full max-h-[600px] cursor-col-resize"
                            onMouseMove={handleMouseMove}
                            onTouchMove={handleTouchMove}
                        >
                            {/* AFTER (Upscaled) - High Quality */}
                            <img src={upscaledUrl} className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                             <div className="absolute top-4 right-4 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded shadow-lg z-10">Upscaled ({scaleFactor}x)</div>

                            {/* BEFORE (Original) - Low Quality */}
                            {/* Note: We rely on browser rendering to show the "softness" of the low-res image here */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none border-r border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ width: `${sliderPosition}%` }}>
                                <img src={previewUrl!} className="absolute top-0 left-0 w-full h-full object-contain max-w-none" />
                                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded border border-white/10">Original</div>
                            </div>
                            
                            {/* SLIDER HANDLE */}
                            <div className="absolute top-0 bottom-0 w-px bg-white/50 left-[50%] pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                                    <MoveHorizontal className="w-4 h-4 text-black" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {upscaledUrl && (
                    <div className="mt-6 flex justify-end animate-in fade-in slide-in-from-bottom-4">
                         <a
                            href={upscaledUrl}
                            download={`upscaled_${scaleFactor}x_${imageFile?.name}`}
                            className="py-3 px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg"
                        >
                            <Download className="w-4 h-4" /> Download Result
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