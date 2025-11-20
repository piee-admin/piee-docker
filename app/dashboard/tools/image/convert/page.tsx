"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  FileImage, 
  Download, 
  Upload, 
  Settings2, 
  RefreshCcw, 
  Loader2, 
  Check, 
  ChevronDown, 
  ArrowRight 
} from "lucide-react";

export default function ConvertImagePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  
  // Settings
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(0.9); // 0.1 to 1.0
  const [isConverting, setIsConverting] = useState(false);
  
  // Stats
  const [originalSize, setOriginalSize] = useState<string>("");
  const [convertedSize, setConvertedSize] = useState<string>("");

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format Options
  const formatOptions = [
    { value: "png", label: "PNG", desc: "Lossless & Transparency" },
    { value: "jpeg", label: "JPEG", desc: "Small File Size" },
    { value: "webp", label: "WEBP", desc: "Modern Web Standard" },
    { value: "avif", label: "AVIF", desc: "Next-Gen Compression" },
    { value: "bmp", label: "BMP", desc: "Bitmap Image" },
    { value: "ico", label: "ICO", desc: "Favicon Format" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setConvertedUrl(null); 
    setOriginalSize(formatBytes(file.size));
  };

  const handleConvert = async () => {
    if (!imageFile || !previewUrl) return;

    setIsConverting(true);

    // Small timeout for UI reactivity
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

      // Map format to MIME type
      let mimeType = `image/${outputFormat}`;
      if (outputFormat === 'jpg') mimeType = 'image/jpeg';
      if (outputFormat === 'ico') mimeType = 'image/x-icon'; // Note: Browser support varies

      // Convert
      // Note: AVIF support depends on the browser (Chrome/Firefox support it)
      const converted = canvas.toDataURL(mimeType, quality);
      
      // Calculate size
      const head = `data:${mimeType};base64,`;
      const size = Math.round((converted.length - head.length) * 3 / 4);
      setConvertedSize(formatBytes(size));

      setConvertedUrl(converted);
      setIsConverting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-zinc-800">
      
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <RefreshCcw className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-white">Image Converter</h1>
        </div>
        <p className="text-zinc-400 mb-8 ml-11">Transform images into modern formats instantly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONTROLS (1/3) ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-zinc-700 rounded-xl bg-black/20 cursor-pointer hover:bg-zinc-800/50 transition group">
                {!imageFile ? (
                    <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-zinc-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-zinc-400">Upload Image</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-4 w-full">
                        <img src={previewUrl!} className="w-14 h-14 rounded bg-black object-contain border border-zinc-700" />
                        <div className="overflow-hidden text-left flex-1">
                             <p className="text-sm font-medium truncate text-white">{imageFile.name}</p>
                             <p className="text-xs text-zinc-500">{originalSize}</p>
                        </div>
                        <div className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">Change</div>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Settings Card */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Settings2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Configuration</span>
                </div>

                {/* Custom Format Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-zinc-400 mb-2 block">Target Format</label>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between bg-black/40 border border-zinc-700 hover:border-zinc-600 rounded-xl py-3 px-4 text-sm text-white transition-colors focus:outline-none focus:border-white"
                    >
                        <div className="flex flex-col items-start">
                            <span className="font-bold uppercase">{outputFormat}</span>
                            <span className="text-[10px] text-zinc-500">{formatOptions.find(f => f.value === outputFormat)?.desc}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {formatOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setOutputFormat(opt.value);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors border-b border-zinc-800/50 last:border-0
                                        ${outputFormat === opt.value ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
                                    `}
                                >
                                    <div>
                                        <span className="block font-bold uppercase">{opt.label}</span>
                                        <span className="block text-[10px] opacity-60">{opt.desc}</span>
                                    </div>
                                    {outputFormat === opt.value && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quality Slider (Only for lossy formats) */}
                {(outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'avif') && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between mb-3">
                            <label className="text-xs font-bold text-zinc-400">Quality</label>
                            <span className="text-white font-mono text-xs">{Math.round(quality * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="1" 
                            step="0.05" 
                            value={quality}
                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                )}

                {/* Convert Button */}
                <button
                    onClick={handleConvert}
                    disabled={!imageFile || isConverting}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg mt-4"
                >
                    {isConverting ? (
                        <> <Loader2 className="w-5 h-5 animate-spin" /> Converting... </>
                    ) : (
                        <> Convert Now <ArrowRight className="w-4 h-4" /> </>
                    )}
                </button>
            </div>
          </div>

          {/* ---------------- RIGHT: OUTPUT PREVIEW (2/3) ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md flex-1 flex flex-col shadow-2xl relative">
                
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        {convertedUrl ? "Conversion Result" : "Preview"}
                    </h2>
                    {convertedUrl && (
                        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                             <span className="text-xs text-zinc-400 line-through">{originalSize}</span>
                             <ArrowRight className="w-3 h-3 text-zinc-500" />
                             <span className="text-xs text-white font-mono font-bold">{convertedSize}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#050505] rounded-xl border border-zinc-800 min-h-[500px]">
                    {/* Transparency Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!previewUrl ? (
                        <div className="text-center opacity-30 z-10 space-y-3">
                             <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto border border-zinc-700">
                                <FileImage className="w-8 h-8 text-zinc-400" />
                             </div>
                             <p className="text-zinc-400">Waiting for image...</p>
                        </div>
                    ) : (
                        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                            <img 
                                src={convertedUrl || previewUrl} 
                                className={`max-w-full max-h-[600px] object-contain shadow-2xl transition-all duration-500 ${isConverting ? 'opacity-50 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
                            />
                        </div>
                    )}
                </div>

                {/* Download Bar */}
                {convertedUrl && (
                    <div className="mt-6 flex justify-end animate-in slide-in-from-bottom-2">
                        <a
                            href={convertedUrl}
                            download={`converted_image.${outputFormat}`}
                            className="w-full sm:w-auto py-3 px-8 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Download className="w-5 h-5" /> 
                            Download {outputFormat.toUpperCase()}
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