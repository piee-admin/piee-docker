"use client";

import React, { useState } from "react";
import { 
  Upload, 
  FileText, 
  X, 
  MoveUp, 
  MoveDown, 
  Trash2, 
  Download, 
  Loader2, 
  FileImage,
  Plus
} from "lucide-react";
import { jsPDF } from "jspdf";

type ImageItem = {
  id: string;
  file: File;
  preview: string;
};

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfName, setPdfName] = useState("converted-images");

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: ImageItem[] = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file: file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
    // Reset input
    e.target.value = "";
  };

  // Remove Image
  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Move Image
  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    if (direction === "up" && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setImages(newImages);
  };

  // Helper: Process Image via Canvas to bake orientation and get exact dimensions
  const processImage = (url: string): Promise<{ width: number; height: number; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            // Use natural dimensions to ensure full resolution
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }
            ctx.drawImage(img, 0, 0);
            
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                // Convert to PNG to preserve quality and handle transparency
                dataUrl: canvas.toDataURL("image/jpeg", 0.95) 
            });
        };
        img.onerror = reject;
    });
  };

  // Generate PDF (Adaptive Page Sizes + Canvas Processing)
  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      // Process first image to initialize PDF
      const firstItem = images[0];
      const firstProcessed = await processImage(firstItem.preview);
      
      const firstOrientation = firstProcessed.width > firstProcessed.height ? 'l' : 'p';

      // Initialize PDF with the dimensions of the FIRST image
      const doc = new jsPDF({
        orientation: firstOrientation,
        unit: 'px',
        format: [firstProcessed.width, firstProcessed.height],
        compress: true 
      });

      // Add first image
      doc.addImage(firstProcessed.dataUrl, 'JPEG', 0, 0, firstProcessed.width, firstProcessed.height);

      // Process and add subsequent images
      for (let i = 1; i < images.length; i++) {
        const item = images[i];
        const processed = await processImage(item.preview);
        const orientation = processed.width > processed.height ? 'l' : 'p';

        // Add new page with exact dimensions of the current image
        doc.addPage([processed.width, processed.height], orientation);
        doc.addImage(processed.dataUrl, 'JPEG', 0, 0, processed.width, processed.height);
      }

      doc.save(`${pdfName || "images"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-zinc-800 transition-colors duration-300">
      
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700">
                <FileText className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Image to PDF</h1>
        </div>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 ml-14">Combine multiple images into a single PDF document. Original sizes preserved.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONFIGURATION ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Box */}
            <div className="p-5 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md transition-colors">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Add Images
              </h2>
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer transition group
                border-gray-300 dark:border-zinc-700 
                bg-gray-50 dark:bg-black/20 
                hover:bg-gray-100 dark:hover:bg-zinc-800/50">
                
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform
                        bg-white border border-gray-200 
                        dark:bg-zinc-800 dark:border-zinc-700">
                        <Plus className="w-5 h-5 text-gray-400 dark:text-zinc-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Click to upload images</p>
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* PDF Settings */}
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md space-y-6 transition-colors">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2 block">PDF Filename</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={pdfName} 
                            onChange={(e) => setPdfName(e.target.value)}
                            className="w-full rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors border pr-12
                            bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400 placeholder:text-gray-400
                            dark:bg-black/40 dark:border-zinc-700 dark:text-white dark:focus:border-white dark:placeholder:text-zinc-600"
                            placeholder="document"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 text-xs font-mono">.pdf</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-zinc-400">
                        <span>Total Images:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{images.length}</span>
                    </div>
                </div>

                <button
                    onClick={generatePdf}
                    disabled={images.length === 0 || isGenerating}
                    className="w-full py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg
                    bg-black text-white hover:bg-gray-800
                    dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    {isGenerating ? (
                        <> <Loader2 className="w-5 h-5 animate-spin" /> Generating PDF... </>
                    ) : (
                        <> <Download className="w-4 h-4" /> Download PDF </>
                    )}
                </button>
            </div>
          </div>

          {/* ---------------- RIGHT: IMAGE LIST ---------------- */}
          <div className="lg:col-span-8">
             <div className="min-h-[500px] p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-2xl backdrop-blur-md flex flex-col relative transition-colors">
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                        Selected Images
                    </h2>
                    {images.length > 0 && (
                        <button onClick={() => setImages([])} className="text-xs text-red-500 hover:text-red-600 hover:underline">
                            Clear All
                        </button>
                    )}
                </div>

                {images.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50 space-y-4 border-2 border-dashed rounded-xl
                        border-gray-200 dark:border-zinc-800">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto border
                            bg-white border-gray-200
                            dark:bg-zinc-800 dark:border-zinc-700">
                            <FileImage className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-gray-500 dark:text-zinc-400">No images selected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img, index) => (
                            <div key={img.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden border shadow-sm transition-all
                                bg-white border-gray-200 hover:shadow-md
                                dark:bg-black/40 dark:border-zinc-800 dark:hover:border-zinc-600">
                                
                                {/* Image Preview */}
                                <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                                
                                {/* Page Number Badge */}
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                                    Page {index + 1}
                                </div>

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => moveImage(index, "up")} 
                                            disabled={index === 0}
                                            className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 transition-colors"
                                            title="Move Earlier"
                                        >
                                            <MoveUp className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => moveImage(index, "down")} 
                                            disabled={index === images.length - 1}
                                            className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 transition-colors"
                                            title="Move Later"
                                        >
                                            <MoveDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => removeImage(img.id)}
                                        className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors mt-2"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Add More Card */}
                        <label className="flex flex-col items-center justify-center aspect-[3/4] border border-dashed rounded-xl cursor-pointer transition-all
                            border-gray-300 hover:bg-gray-50 hover:border-gray-400
                            dark:border-zinc-800 dark:hover:bg-zinc-800/30 dark:hover:border-zinc-700">
                            <Plus className="w-8 h-8 text-gray-300 dark:text-zinc-600 mb-2" />
                            <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">Add More</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}