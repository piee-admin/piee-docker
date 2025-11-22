import React, { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Plus, Loader2, FilePlus } from "lucide-react";

interface ToolProps {
  pdfBytes: Uint8Array | ArrayBuffer | null;
  onUpdatePdf: (bytes: Uint8Array) => void;
}

export default function MergeTool({ pdfBytes, onUpdatePdf }: ToolProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleMerge = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pdfBytes || !e.target.files?.[0]) return;
    setIsProcessing(true);

    try {
      const fileB = e.target.files[0];
      const bufferB = await fileB.arrayBuffer();
      const pdfDocA = await PDFDocument.load(pdfBytes);
      const pdfDocB = await PDFDocument.load(bufferB);
      const copiedPages = await pdfDocA.copyPages(pdfDocB, pdfDocB.getPageIndices());
      copiedPages.forEach((page) => pdfDocA.addPage(page));
      const newBytes = await pdfDocA.save();
      onUpdatePdf(newBytes); 
      alert("Merged Successfully!");
    } catch (e) {
      alert("Merge failed.");
    } finally {
      setIsProcessing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
         <p className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
            <FilePlus size={16} className="mt-0.5"/>
            Append a file to the end of this document.
         </p>
      </div>

      <div 
        onClick={() => !isProcessing && fileRef.current?.click()} 
        className={`border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer text-center 
          border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 
          hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600
          ${isProcessing ? 'opacity-50' : ''}
        `}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin text-zinc-500 mx-auto" size={24} />
        ) : (
          <>
            <Plus className="mx-auto mb-3 text-zinc-400 dark:text-zinc-500"/>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">Click to Add PDF</span>
          </>
        )}
      </div>

      <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={handleMerge} />
    </div>
  );
}