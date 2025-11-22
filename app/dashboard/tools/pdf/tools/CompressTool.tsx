import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { pdfjs } from "react-pdf";
import { Minimize2, Loader2, FileBarChart, Gauge, AlertTriangle } from "lucide-react";

// Ensure worker is set
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ToolProps {
  pdfBytes: Uint8Array | ArrayBuffer | null;
  onUpdatePdf: (bytes: Uint8Array) => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function CompressTool({ pdfBytes, onUpdatePdf }: ToolProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(0.6); 

  useEffect(() => {
    if (pdfBytes) setOriginalSize(pdfBytes.byteLength);
  }, [pdfBytes]);

  const handleCompress = async () => {
    if (!pdfBytes) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      // 1. Load original PDF
      const loadingTask = pdfjs.getDocument(new Uint8Array(pdfBytes as ArrayBuffer));
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // 2. Create NEW PDF
      const newPdfDoc = await PDFDocument.create();

      // Determine Scale based on Quality Setting
      // Lower quality = Lower resolution scale to ensure size drop
      const renderScale = quality <= 0.4 ? 1.0 : 1.5; 

      // 3. Loop pages
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          await page.render(renderContext as any).promise;
          
          // Convert to JPEG
          const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
          const jpgImage = await newPdfDoc.embedJpg(imgDataUrl);
          
          // Scale back to original PDF point size
          const jpgDims = jpgImage.scale(1 / renderScale); 

          const newPage = newPdfDoc.addPage([jpgDims.width, jpgDims.height]);
          newPage.drawImage(jpgImage, {
            x: 0, y: 0, width: jpgDims.width, height: jpgDims.height,
          });
        }
        setProgress(Math.round((i / numPages) * 100));
      }

      const outputBytes = await newPdfDoc.save();
      
      // --- THE FIX: SAFETY CHECK ---
      if (outputBytes.byteLength >= originalSize) {
         alert(
           `Optimization Skipped.\n\nOriginal: ${formatSize(originalSize)}\nResult: ${formatSize(outputBytes.byteLength)}\n\nYour file is already highly optimized (mostly text). Converting it to image would increase the size. We kept the original for you.`
         );
         // We DO NOT call onUpdatePdf here, keeping the original file
      } else {
         onUpdatePdf(outputBytes);
         alert(`Success! Reduced from ${formatSize(originalSize)} to ${formatSize(outputBytes.byteLength)}`);
      }

    } catch (error) {
      console.error(error);
      alert("Compression failed.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
      
      {/* Stats Card */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileBarChart className="text-zinc-400 dark:text-zinc-500" size={20} />
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Current Size</p>
            <p className="text-xs text-zinc-500">Original PDF</p>
          </div>
        </div>
        <span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{formatSize(originalSize)}</span>
      </div>

      {/* Quality Slider */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
           <span className="text-zinc-500 font-bold flex items-center gap-2">
             <Gauge size={14}/> Compression Level
           </span>
           <span className="text-zinc-900 dark:text-white font-mono">
             {quality === 0.4 ? "Extreme" : quality === 0.6 ? "Recommended" : "Low"}
           </span>
        </div>
        
        <input 
          type="range" 
          min="0.2" // Allow going even lower for stubborn files
          max="0.8" 
          step="0.2" 
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-black dark:accent-white"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
           <span>Max Compression</span>
           <span>Better Quality</span>
        </div>
      </div>

      {/* Warning for small files */}
      {originalSize < 100 * 1024 && (
         <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg flex gap-2 items-start">
            <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0"/>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              This file is already very small ({formatSize(originalSize)}). Compression might not be possible without making it blurry.
            </p>
         </div>
      )}

      {/* Action Button */}
      <button 
        onClick={handleCompress}
        disabled={isProcessing}
        className="w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md
        bg-black text-white hover:bg-zinc-800
        dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-wait"
      >
         {isProcessing ? (
           <>
            <Loader2 className="animate-spin" size={18}/> 
            <span>Processing {progress}%...</span>
           </>
         ) : (
           <>
            <Minimize2 size={18}/> 
            <span>Apply Compression</span>
           </>
         )}
      </button>
    </div>
  );
}