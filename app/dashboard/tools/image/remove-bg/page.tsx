"use client";

import React, { useState } from "react";
import { Upload, Download, Image as ImageIcon, Layers, Loader2, Eraser } from "lucide-react";
// FIX: Use named import with curly braces
import { removeBackground } from "@imgly/background-removal";

export default function RemoveBackground() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgType, setBgType] = useState<"transparent" | "white" | "black" | "gradient">("transparent");

  // --- Handle File Upload ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setProcessedUrl(null); 
    setPreviewUrl(URL.createObjectURL(file));
  };

  // --- The AI Magic ---
  const handleRemoveBackground = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);

    try {
        // FIX: Call the named function 'removeBackground'
        const blob = await removeBackground(previewUrl, {
            progress: (key, current, total) => {
               // console.log(`Downloading ${key}: ${current} of ${total}`);
            }
        });
        
        const url = URL.createObjectURL(blob);
        setProcessedUrl(url);
    } catch (error) {
        console.error("Background removal failed:", error);
        alert("Could not remove background. Try a clear portrait image.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-white/20">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#09090b] to-[#09090b] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <Eraser className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold tracking-tight">Background Remover</h1>
        </div>
        <p className="text-white/40 mb-8 ml-11">AI-powered local processing. 100% Private. Free.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ---------------- LEFT: UPLOAD & CONTROLS ---------------- */}
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Source Image
              </h2>

              <label className={`group relative border border-dashed border-white/20 bg-black/20 p-8 rounded-xl block text-center cursor-pointer transition-all hover:bg-white/5 ${!imageFile ? 'py-12' : 'py-6'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                
                {!previewUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-white/90 font-medium">Upload Image</p>
                        <p className="text-xs text-white/40 mt-1">Supports JPG, PNG, WEBP</p>
                    </div>
                  </div>
                ) : (
                   <div className="relative">
                      <img src={previewUrl} className="max-h-[300px] w-full object-contain rounded-lg shadow-xl mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                         <p className="text-sm font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Replace Image</p>
                      </div>
                   </div>
                )}
              </label>
            </div>

            <button
                onClick={handleRemoveBackground}
                disabled={!imageFile || isProcessing}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
                {isProcessing ? (
                    <> <Loader2 className="w-5 h-5 animate-spin" /> AI is processing... </>
                ) : (
                    <> <Layers className="w-5 h-5" /> Remove Background </>
                )}
            </button>

            <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-xl text-xs text-purple-200/80 leading-relaxed">
               <span className="font-bold text-purple-300">Note:</span> The first time you run this, it will download the AI model (~20MB). Subsequent runs will be instant.
            </div>
          </div>

          {/* ---------------- RIGHT: RESULT ---------------- */}
          <div className="flex flex-col h-full">
             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex-1 flex flex-col relative overflow-hidden min-h-[500px]">
                <div className="flex justify-between items-start mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                        Result
                    </h2>
                    
                    {processedUrl && (
                        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                             <button onClick={() => setBgType('transparent')} title="Transparent" className={`w-6 h-6 rounded flex items-center justify-center border ${bgType === 'transparent' ? 'border-white/50 bg-white/10' : 'border-transparent opacity-50'}`}>
                                <div className="w-3 h-3 bg-[url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.Uo7zC-C7gRjB2w1zJvXb5QHaHa%26pid%3DApi&f=1&ipt=0e3776627271549130e205772796425f420d1662667962696346193633656364&ipo=images')] bg-cover opacity-70"></div>
                             </button>
                             <button onClick={() => setBgType('white')} title="White" className={`w-6 h-6 rounded border bg-white ${bgType === 'white' ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-transparent opacity-50'}`}></button>
                             <button onClick={() => setBgType('black')} title="Black" className={`w-6 h-6 rounded border bg-black ${bgType === 'black' ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-transparent opacity-50'}`}></button>
                             <button onClick={() => setBgType('gradient')} title="Gradient" className={`w-6 h-6 rounded border bg-gradient-to-br from-pink-500 to-purple-600 ${bgType === 'gradient' ? 'border-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-transparent opacity-50'}`}></button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-xl border border-white/5">
                    <div className={`absolute inset-0 pointer-events-none transition-colors duration-300
                        ${bgType === 'transparent' ? "bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/5d/Checker-16x16.png')] bg-repeat opacity-20" : ''}
                        ${bgType === 'white' ? 'bg-white' : ''}
                        ${bgType === 'black' ? 'bg-black' : ''}
                        ${bgType === 'gradient' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : ''}
                    `}></div>

                    {!processedUrl ? (
                        <div className="text-center opacity-30 relative z-10">
                             {isProcessing ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-purple-500/20 mb-4"></div>
                                    <p>Analyzing Pixels...</p>
                                </div>
                             ) : (
                                <p>Ready to process</p>
                             )}
                        </div>
                    ) : (
                        <img 
                            src={processedUrl} 
                            className="relative z-10 max-w-full max-h-[400px] object-contain animate-in zoom-in-95 duration-300" 
                            alt="Cutout"
                        />
                    )}
                </div>

                {processedUrl && (
                    <div className="mt-6 flex justify-end animate-in fade-in slide-in-from-bottom-4">
                         <a
                            href={processedUrl}
                            download={`cutout_${imageFile?.name.split('.')[0]}.png`}
                            className="py-3 px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg"
                        >
                            <Download className="w-4 h-4" /> Download PNG
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