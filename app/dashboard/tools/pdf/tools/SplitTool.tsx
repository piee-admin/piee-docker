import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Scissors, Check, AlertCircle } from "lucide-react";

interface ToolProps {
  pdfBytes: Uint8Array | ArrayBuffer | null;
  onUpdatePdf: (bytes: Uint8Array) => void;
}

export default function SplitTool({ pdfBytes, onUpdatePdf }: ToolProps) {
  const [range, setRange] = useState("");
  const [error, setError] = useState("");

  const handleSplit = async () => {
    if (!pdfBytes || !range) return;
    setError("");

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      const totalPages = pdfDoc.getPageCount();
      const pageIndices: number[] = [];

      const parts = range.split(',').map(p => p.trim());
      parts.forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              if (i > 0 && i <= totalPages) pageIndices.push(i - 1);
            }
          }
        } else {
          const num = parseInt(part);
          if (!isNaN(num) && num > 0 && num <= totalPages) pageIndices.push(num - 1);
        }
      });

      if (pageIndices.length === 0) throw new Error("Invalid range");

      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));
      const splitBytes = await newPdf.save();
      onUpdatePdf(splitBytes); 
      setRange(""); 
    } catch (e) {
      setError("Invalid range. Check page numbers.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
         <p className="text-sm text-amber-800 dark:text-amber-200 flex gap-2">
            <Scissors size={16} className="mt-0.5"/>
            Splitting will keep only the pages you select.
         </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Keep Pages (Range)</label>
        <input 
          value={range} 
          onChange={(e) => setRange(e.target.value)}
          className="w-full p-3 rounded-lg outline-none transition font-mono border-2 
          bg-white dark:bg-zinc-900 
          border-zinc-200 dark:border-zinc-700 
          text-zinc-900 dark:text-white
          focus:border-black dark:focus:border-white"
          placeholder="e.g. 1-5"
        />
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
      </div>

      <button 
        onClick={handleSplit} 
        className="w-full font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm
        bg-black text-white hover:bg-zinc-800 
        dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        <Check size={18} /> Apply Split
      </button>
    </div>
  );
}