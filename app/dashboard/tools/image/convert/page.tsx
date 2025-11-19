"use client";

import { useState, useEffect } from "react";
import { FileImage, Download, Upload, Settings2, RefreshCcw, Loader2 } from "lucide-react";

export default function ConvertImagePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(0.9); // 0.1 to 1.0
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [fileSize, setFileSize] = useState<string | null>(null);

  // Format bytes to readable string
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setConvertedUrl(null); // Reset output when new file uploaded
  };

  const handleConvert = async () => {
    if (!imageFile || !previewUrl) return;

    setIsConverting(true);

    // Small timeout to allow UI to show loading state
    setTimeout(async () => {
      const img = new Image();
      img.src = previewUrl;
      await img.decode();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Handle Quality for Jpeg/Webp
      const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
      const converted = canvas.toDataURL(mimeType, quality);
      
      // Calculate new file size roughly
      const head = "data:image/*;base64,";
      const size = Math.round((converted.length - head.length) * 3 / 4);
      setFileSize(formatBytes(size));

      setConvertedUrl(converted);
      setIsConverting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-white/20">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#09090b] to-[#09090b] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Image Converter</h1>
        <p className="text-white/40 mb-8">Transform your images with professional precision.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* ---------------- LEFT: CONFIGURATION ---------------- */}
          <div className="flex flex-col gap-6">
            
            {/* Upload Card */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl">
              <h2 className="text-lg mb-4 font-medium flex items-center gap-2 text-white/90">
                <FileImage className="w-5 h-5 text-white/70" /> Input Image
              </h2>

              <label className={`relative group border border-dashed border-white/20 bg-black/20 p-8 rounded-xl block text-center cursor-pointer transition-all duration-300 ${!imageFile ? 'hover:bg-white/5 hover:border-white/40' : ''}`}>
                
                {!previewUrl ? (
                  <div className="py-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 opacity-70" />
                    </div>
                    <p className="text-white/90 font-medium text-sm">Click to upload or drag & drop</p>
                    <p className="text-white/40 text-xs mt-1">Supports JPG, PNG, WEBP</p>
                  </div>
                ) : (
                   <div className="relative group/preview">
                      <img
                        src={previewUrl}
                        className="rounded-lg w-full max-h-64 object-contain shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-lg">
                         <p className="flex items-center gap-2 text-sm font-medium"><RefreshCcw className="w-4 h-4" /> Change Image</p>
                      </div>
                   </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              
              {imageFile && (
                 <div className="mt-4 flex justify-between items-center text-xs text-white/40 px-1">
                    <span>Original: {formatBytes(imageFile.size)}</span>
                    <span>{imageFile.name}</span>
                 </div>
              )}
            </div>

            {/* Settings Card */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl">
                <h2 className="text-lg mb-4 font-medium flex items-center gap-2 text-white/90">
                    <Settings2 className="w-5 h-5 text-white/70" /> Configuration
                </h2>

                <div className="space-y-5">
                    <div>
                        <label className="text-white/60 text-sm mb-2 block">Target Format</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['png', 'jpeg', 'webp', 'bmp'].map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setOutputFormat(fmt)}
                                    className={`py-2 text-sm font-medium rounded-lg border transition-all
                                        ${outputFormat === fmt 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-transparent text-white/60 border-white/10 hover:bg-white/5'}`}
                                >
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between mb-2">
                                <label className="text-white/60 text-sm">Quality</label>
                                <span className="text-white/90 text-sm">{Math.round(quality * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="1" 
                                step="0.1" 
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    )}

                    {/* THEME MATCHED BUTTON */}
                    <button
                        onClick={handleConvert}
                        disabled={!imageFile || isConverting}
                        className="w-full py-3.5 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                    >
                        {isConverting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Convert Now"
                        )}
                    </button>
                </div>
            </div>

          </div>

          {/* ---------------- RIGHT: OUTPUT ---------------- */}
          <div className="h-full">
             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md h-full flex flex-col">
                <h2 className="text-lg mb-4 font-medium flex items-center gap-2 text-white/90">
                    <Download className="w-5 h-5 text-white/70" /> Result
                </h2>

                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-black/20 rounded-xl border border-white/5 p-4 relative overflow-hidden">
                    {!convertedUrl ? (
                        <div className="text-center text-white/30">
                             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <FileImage className="w-6 h-6 opacity-50" />
                             </div>
                            <p>Waiting for conversion...</p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center animate-in zoom-in-95 duration-300">
                            <img
                                src={convertedUrl}
                                className="max-w-full max-h-[400px] object-contain rounded-md shadow-2xl"
                            />
                            <div className="mt-4 flex items-center gap-3 text-sm bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                <span className="text-white/50">Size:</span>
                                <span className="text-white font-mono">{fileSize}</span>
                            </div>
                        </div>
                    )}
                </div>

                {convertedUrl && (
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                        <a
                            href={convertedUrl}
                            download={`converted_image.${outputFormat}`}
                            className="w-full py-3.5 bg-white/10 border border-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Result
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