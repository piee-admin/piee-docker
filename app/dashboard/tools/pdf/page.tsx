"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  UploadCloud, Minimize2, Scissors, Combine,
  ChevronLeft, ZoomIn, ZoomOut, Loader2, Layers, Download, RefreshCcw,
  Undo, Redo, FileInput, Shield
} from "lucide-react";

// Import Tools
import CompressTool from "./tools/CompressTool";
import SplitTool from "./tools/SplitTool";
import MergeTool from "./tools/MergeTool";
import ConvertTool from "./tools/ConvertTool";
import SecurityTool from "./tools/SecurityTool";
import { uploadFileToFastAPI } from "@/lib/upload";
import { useAuth } from "@/app/context/AuthContext"; // IF you store token here

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type ToolId = "merge" | "split" | "compress" | "convert" | "security" | null;

export default function PDFEditorPage() {
  const [exportOpen, setExportOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0); // Reset to 1.0 for standard view

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();


  // --- HISTORY STATE ---

  const [history, setHistory] = useState<Uint8Array[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const pdfBytes = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex];
    }
    return null;
  }, [history, currentIndex]);

  // --- ACTIONS ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const buffer = await selected.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      setFile(selected);
      setHistory([uint8]);
      setCurrentIndex(0);
      setActiveTool(null);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const updatePdfView = (newBytes: Uint8Array) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newBytes);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const downloadBytes = (bytes: Uint8Array, suffix: string) => {
    const blob = new Blob([bytes as any], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${file?.name.replace(".pdf", "") || "document"}_${suffix}.pdf`;
    link.click();
  };

  const pdfUrl = useMemo(() => {
    return pdfBytes
      ? URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' }))
      : null;
  }, [pdfBytes]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black text-zinc-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">

      {/* --- LEFT SIDEBAR (Tools) --- */}
      <div className="w-80 flex flex-col z-20 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">

        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          {activeTool ? (
            <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition text-sm font-medium">
              <ChevronLeft size={16} /> BACK
            </button>
          ) : (
            <span className="text-lg font-bold flex items-center gap-2 tracking-tight text-zinc-900 dark:text-white">
              <Layers className="text-black dark:text-white" size={20} /> PDF Tools
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeTool ? (
            <div className="grid grid-cols-1 gap-3">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 font-mono uppercase tracking-wider">Select Action</p>
              {[
                { id: "convert", label: "Convert PDF", icon: RefreshCcw, desc: "To Word, Excel, JPG" },
                { id: "merge", label: "Merge PDF", icon: Combine, desc: "Combine files" },
                { id: "split", label: "Split PDF", icon: Scissors, desc: "Extract pages" },
                { id: "compress", label: "Compress", icon: Minimize2, desc: "Reduce size" },
                { id: "security", label: "Security", icon: Shield, desc: "Encrypt/Decrypt" }, // New Tool
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolId)}
                  disabled={!pdfBytes}
                  className={`group flex items-center gap-4 p-4 rounded-xl text-left transition-all border
                    ${!pdfBytes
                      ? 'opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900 border-transparent'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm'
                    }`}
                >
                  <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <tool.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{tool.label}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{tool.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-in slide-in-from-left-4 fade-in duration-200 h-full">
              {activeTool === 'convert' && <ConvertTool pdfBytes={pdfBytes} onUpdatePdf={updatePdfView} />}
              {activeTool === 'compress' && <CompressTool pdfBytes={pdfBytes} onUpdatePdf={updatePdfView} />}
              {activeTool === 'split' && <SplitTool pdfBytes={pdfBytes} onUpdatePdf={updatePdfView} />}
              {activeTool === 'merge' && <MergeTool pdfBytes={pdfBytes} onUpdatePdf={updatePdfView} />}
              {activeTool === 'security' && <SecurityTool pdfBytes={pdfBytes} onUpdatePdf={updatePdfView} />}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT CANVAS (Viewer) --- */}
      <div className="flex-1 flex flex-col relative bg-zinc-100 dark:bg-[#09090b]">

        {/* Top Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md absolute top-0 w-full z-10">

          {/* Left: Zoom & History */}
          <div className="flex items-center gap-2">
            {pdfBytes && (
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition shadow-sm"><ZoomOut size={16} /></button>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500 w-10 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(4.0, s + 0.25))} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition shadow-sm"><ZoomIn size={16} /></button>
              </div>
            )}

            {/* Middle: UNDO / REDO */}
            {pdfBytes && (
              <div className="flex items-center gap-1 ml-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                <button onClick={handleUndo} disabled={!canUndo} className={`p-1.5 rounded transition flex items-center gap-2 ${!canUndo ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' : 'text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 shadow-sm'}`}><Undo size={16} /></button>
                <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700"></div>
                <button onClick={handleRedo} disabled={!canRedo} className={`p-1.5 rounded transition flex items-center gap-2 ${!canRedo ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' : 'text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 shadow-sm'}`}><Redo size={16} /></button>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <input type="file" accept=".pdf" onChange={handleUpload} ref={fileInputRef} className="hidden" />
            {pdfBytes && (
              <>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400"><FileInput size={14} /> REPLACE</button>
                <button
                  onClick={() => setExportOpen(true)}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg bg-black text-white dark:bg-white dark:text-black"
                >
                  <Download size={16} /> Export PDF
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto p-10 pt-24 flex justify-center bg-zinc-100 dark:bg-[#09090b] custom-scrollbar">
          {!pdfUrl ? (
            <div className="flex flex-col items-center justify-center h-full opacity-100">
              <button onClick={() => fileInputRef.current?.click()} className="group text-center p-10 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 transition-all">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto bg-zinc-100 dark:bg-zinc-900 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-zinc-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">Upload PDF Document</h3>
                <p className="text-zinc-500 dark:text-zinc-500 text-sm">Drag & drop or click to browse</p>
              </button>
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div className="mt-20 text-zinc-500 dark:text-zinc-500 flex flex-col items-center gap-3"><Loader2 className="animate-spin w-8 h-8" /> <span className="text-xs uppercase tracking-widest">Rendering...</span></div>}
              className="flex flex-col gap-8"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div key={`page_${index + 1}`} className="relative group">
                  <div className="absolute -top-8 left-0 text-xs font-mono text-zinc-500 dark:text-zinc-500 flex items-center gap-2">
                    <span className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded shadow-sm">PAGE {String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div className="shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-800">
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="bg-white"
                      loading=""
                    />
                  </div>
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Export PDF</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-500">
            Choose where to save your edited PDF.
          </p>

          <div className="flex flex-col gap-3 mt-4">

            {/* SAVE LOCALLY */}
            <Button
              onClick={() => {
                if (pdfBytes) {
                  downloadBytes(pdfBytes, "edited");
                  setExportOpen(false);
                }
              }}
              className="w-full flex items-center gap-2"
            >
              <Download size={16} />
              Save Locally
            </Button>

            {/* SAVE TO CLOUD USING uploadFileToFastAPI */}
            <Button
              variant="secondary"
              disabled={isUploading}
              className="w-full flex items-center gap-2"
              onClick={async () => {
                try {
                  if (!pdfBytes) return;

                  setIsUploading(true);

                  // Convert Uint8Array → File
                  const safeBytes = new Uint8Array(pdfBytes); // <--- COPY (not same buffer)
                  const blob = new Blob([safeBytes], { type: "application/pdf" });
                  const pdfFile = new File(
                    [blob],
                    `${file?.name?.replace(".pdf", "") || "document"}_edited.pdf`,
                    { type: "application/pdf" }
                  );

                  // Upload using your existing library
                  const result = await uploadFileToFastAPI(pdfFile);


                  console.log("Cloud Upload Success:", result);
                  toast.success("PDF saved to cloud successfully!");
                  setExportOpen(false);

                } catch (err) {
                  console.error(err);
                  toast.error("Failed to save PDF to cloud. Please try again.");
                } finally {
                  setIsUploading(false);
                }
              }}
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UploadCloud size={16} />
              )}
              {isUploading ? "Uploading..." : "Save to Cloud"}
            </Button>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}