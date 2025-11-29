"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Minimize2, Maximize2, Crop, FileType, Scaling, 
  Eraser, Stamp, Wand2, FileText, UploadCloud, 
  Layers, Download, Undo, Redo, 
  ZoomIn, ZoomOut, ChevronLeft,
} from 'lucide-react';

// --- IMPORT TOOLS ---
import CompressTool from './tools/CompressTool';
import ResizeTool from './tools/Resize';
import CropTool from './tools/CropTool';
import ConvertTool from './tools/ConvertTool';
import FilterTool from './tools/FilterTool';
import WatermarkTool from './tools/WaterMark';
import UpscaleTool from './tools/Upscale';
import RemoveBgTool from './tools/Removet';
import ToPdfTool from './tools/to-pdf';

// --- TYPES ---
export type ToolId = 'compress' | 'resize' | 'crop' | 'convert' | 'upscale' | 'remove-bg' | 'watermark' | 'filter' | 'to-pdf' | null;

export interface EditState {
  filter: string;
  brightness: number;
  contrast: number;
  watermarkText: string;
  watermarkColor: string;
  watermarkSize: number;
  cropActive: boolean;
}

const DEFAULT_EDIT_STATE: EditState = {
  filter: 'none',
  brightness: 100,
  contrast: 100,
  watermarkText: '',
  watermarkColor: '#ffffff',
  watermarkSize: 32,
  cropActive: false,
};

// --- MAIN COMPONENT ---
export default function ImageEditorPage() {
  // Navigation State
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  
  // Image State
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  
  // Visual State (Filters, etc.)
  const [editState, setEditState] = useState<EditState>(DEFAULT_EDIT_STATE);
  
  // History State
  const [history, setHistory] = useState<EditState[]>([DEFAULT_EDIT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isHistoryAction = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HISTORY MANAGEMENT ---
  useEffect(() => {
    if (isHistoryAction.current) {
      isHistoryAction.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setHistory(prev => {
        const currentHistory = prev.slice(0, historyIndex + 1);
        const lastState = currentHistory[currentHistory.length - 1];
        
        if (JSON.stringify(lastState) !== JSON.stringify(editState)) {
           const newHistory = [...currentHistory, editState];
           setHistoryIndex(newHistory.length - 1);
           return newHistory;
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [editState, historyIndex]);

  const handleUndo = () => {
    // Undo for image changes (compress, resize, etc.)
    if (imageHistoryIndex > 0) {
      isImageHistoryAction.current = true;
      const newIndex = imageHistoryIndex - 1;
      setImageHistoryIndex(newIndex);
      const previousImageUrl = imageHistory[newIndex];
      setImageSrc(previousImageUrl);
      
      // Update file to match the undone image
      fetch(previousImageUrl)
        .then(r => r.blob())
        .then(blob => {
          const newFile = new File([blob], file?.name || 'image.jpg', { type: blob.type });
          setFile(newFile);
        });
    }
    // Also handle filter undo
    else if (historyIndex > 0) {
      isHistoryAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditState(history[newIndex]);
    }
  };

  const handleRedo = () => {
    // Redo for image changes
    if (imageHistoryIndex < imageHistory.length - 1) {
      isImageHistoryAction.current = true;
      const newIndex = imageHistoryIndex + 1;
      setImageHistoryIndex(newIndex);
      const nextImageUrl = imageHistory[newIndex];
      setImageSrc(nextImageUrl);
      
      // Update file to match the redone image
      fetch(nextImageUrl)
        .then(r => r.blob())
        .then(blob => {
          const newFile = new File([blob], file?.name || 'image.jpg', { type: blob.type });
          setFile(newFile);
        });
    }
    // Also handle filter redo
    else if (historyIndex < history.length - 1) {
      isHistoryAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditState(history[newIndex]);
    }
  };

  // --- FILE HANDLING ---
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setImageSrc(url);
      setActiveTool(null);
      setEditState(DEFAULT_EDIT_STATE);
      setHistory([DEFAULT_EDIT_STATE]);
      setHistoryIndex(0);
      setScale(1.0);
    }
  };

  // --- IMAGE HISTORY (for undo/redo of actual image changes) ---
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [imageHistoryIndex, setImageHistoryIndex] = useState(-1);
  const isImageHistoryAction = useRef(false);

  // Add initial image to history when uploaded
  useEffect(() => {
    if (imageSrc && imageHistory.length === 0) {
      setImageHistory([imageSrc]);
      setImageHistoryIndex(0);
    }
  }, [imageSrc, imageHistory.length]);

  // --- TOOL APPLY HANDLERS ---
  // This is the key function that handles when tools apply changes to the image
  const handleCompressApply = (blob: Blob) => {
    // Create new URL from compressed blob
    const newUrl = URL.createObjectURL(blob);
    
    // Add to image history for undo/redo BEFORE updating imageSrc
    if (!isImageHistoryAction.current) {
      const newHistory = imageHistory.slice(0, imageHistoryIndex + 1);
      newHistory.push(newUrl);
      setImageHistory(newHistory);
      setImageHistoryIndex(newHistory.length - 1);
    }
    
    // Update file reference FIRST (so CompressTool sees the new file size)
    const newFile = new File([blob], file?.name || 'compressed.jpg', { type: blob.type });
    setFile(newFile);
    
    // Update image source LAST (this triggers CompressTool to recalculate)
    setImageSrc(newUrl);
  };

  const handleResizeApply = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    setImageSrc(newUrl);
    
    const newFile = new File([blob], file?.name || 'resized.jpg', { type: blob.type });
    setFile(newFile);
    
    // Add to image history
    if (!isImageHistoryAction.current) {
      const newHistory = imageHistory.slice(0, imageHistoryIndex + 1);
      newHistory.push(newUrl);
      setImageHistory(newHistory);
      setImageHistoryIndex(newHistory.length - 1);
    }
    
    // DON'T close the tool panel
  };

  // --- EXPORT FUNCTION ---
  const handleExport = async () => {
    if (!imageSrc) return;
    
    // If no filters/watermarks are applied, just download the current file directly
    const hasNoEdits = editState.filter === 'none' && 
                       editState.brightness === 100 && 
                       editState.contrast === 100 && 
                       !editState.watermarkText;
    
    if (hasNoEdits && file) {
      // Direct download of the current file (preserves compression)
      const link = document.createElement('a');
      link.download = `edited-${file.name}`;
      link.href = URL.createObjectURL(file);
      link.click();
      return;
    }
    
    // If filters/watermarks are applied, render to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      if (!ctx) return;

      // Apply CSS Filters
      ctx.filter = `${editState.filter} brightness(${editState.brightness}%) contrast(${editState.contrast}%)`;
      ctx.drawImage(img, 0, 0);
      
      // Apply Watermark
      if (editState.watermarkText) {
         const fontSize = editState.watermarkSize * (canvas.width / 1000) * 2; 
         ctx.font = `bold ${Math.max(20, fontSize)}px sans-serif`;
         ctx.fillStyle = editState.watermarkColor;
         ctx.globalAlpha = 0.8;
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.filter = 'none';
         ctx.fillText(editState.watermarkText, canvas.width/2, canvas.height/2);
      }
      
      // Download with appropriate format
      const link = document.createElement('a');
      link.download = `edited-${file?.name || 'image.jpg'}`;
      
      // Preserve the compressed format if available
      const outputFormat = file?.type || 'image/jpeg';
      const quality = outputFormat === 'image/png' ? undefined : 0.92;
      
      canvas.toBlob((blob) => {
        if (blob) {
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      }, outputFormat, quality);
    };
  };

  // --- RENDER HELPERS ---
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'compress': 
        return <CompressTool 
          image={imageSrc} 
          file={file}
          onApply={handleCompressApply} 
        />;
      case 'resize': 
        return <ResizeTool 
          image={imageSrc} 
          onApply={handleResizeApply} 
        />;
      case 'crop': 
        return <CropTool 
          editState={editState} 
          setEditState={setEditState} 
        />;
      case 'convert': 
        return <ConvertTool image={imageSrc} />;
      case 'filter': 
        return <FilterTool 
          editState={editState} 
          setEditState={setEditState} 
        />;
      case 'watermark': 
        return <WatermarkTool 
          editState={editState} 
          setEditState={setEditState} 
        />;
      case 'upscale': 
        return <UpscaleTool />;
      case 'remove-bg': 
        return <RemoveBgTool />;
      case 'to-pdf': 
        return <ToPdfTool />;
      default: 
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black text-zinc-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      
      {/* --- LEFT SIDEBAR (Navigation & Tools) --- */}
      <div className="w-80 flex flex-col z-20 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
        
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {activeTool ? (
            <button 
              onClick={() => setActiveTool(null)} 
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition text-sm font-medium"
            >
              <ChevronLeft size={16} /> BACK
            </button>
          ) : (
            <span className="text-lg font-bold flex items-center gap-2 tracking-tight text-zinc-900 dark:text-white">
              <Layers className="text-blue-600" size={20}/> Image Tools
            </span>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {!activeTool ? (
            <div className="grid grid-cols-1 gap-2">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 font-mono uppercase tracking-wider px-2">Select Action</p>
              {[
                { id: 'compress', label: 'Compress', icon: Minimize2, desc: 'Reduce size' },
                { id: 'resize', label: 'Resize', icon: Maximize2, desc: 'Change dimensions' },
                { id: 'crop', label: 'Crop', icon: Crop, desc: 'Trim edges' },
                { id: 'convert', label: 'Convert', icon: FileType, desc: 'Format change' },
                { id: 'upscale', label: 'Upscale', icon: Scaling, desc: 'AI Enhancement', isAI: true },
                { id: 'remove-bg', label: 'Remove BG', icon: Eraser, desc: 'Transparent BG', isAI: true },
                { id: 'watermark', label: 'Watermark', icon: Stamp, desc: 'Add branding' },
                { id: 'filter', label: 'Filters', icon: Wand2, desc: 'Color effects' },
                { id: 'to-pdf', label: 'To PDF', icon: FileText, desc: 'Make document' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolId)}
                  disabled={!imageSrc}
                  className={`group flex items-center gap-3 p-3 rounded-xl text-left transition-all border
                    ${!imageSrc 
                      ? 'opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900 border-transparent' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm'
                    }`}
                >
                  <div className={`p-2.5 rounded-lg ${tool.isAI ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'} group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                    <tool.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{tool.label}</h3>
                      {tool.isAI && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">AI</span>}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{tool.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-in slide-in-from-left-4 fade-in duration-200">
               {renderActiveTool()}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT CANVAS (Viewer) --- */}
      <div className="flex-1 flex flex-col relative bg-zinc-100 dark:bg-[#09090b]">
        
        {/* Top Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md absolute top-0 w-full z-10">
           
           {/* Zoom Controls */}
           <div className="flex items-center gap-2">
             {imageSrc && (
               <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                 <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition shadow-sm"><ZoomOut size={16}/></button>
                 <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                 <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition shadow-sm"><ZoomIn size={16}/></button>
               </div>
             )}
             
             {imageSrc && (
                <div className="flex items-center gap-1 ml-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                   <button 
                     onClick={handleUndo} 
                     disabled={imageHistoryIndex <= 0 && historyIndex <= 0}
                     className={`p-1.5 rounded transition shadow-sm ${(imageHistoryIndex <= 0 && historyIndex <= 0) ? 'opacity-30 cursor-not-allowed text-zinc-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'}`}
                   >
                     <Undo size={16} />
                   </button>
                   <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700"></div>
                   <button 
                     onClick={handleRedo} 
                     disabled={imageHistoryIndex >= imageHistory.length - 1 && historyIndex >= history.length - 1}
                     className={`p-1.5 rounded transition shadow-sm ${(imageHistoryIndex >= imageHistory.length - 1 && historyIndex >= history.length - 1) ? 'opacity-30 cursor-not-allowed text-zinc-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'}`}
                   >
                     <Redo size={16} />
                   </button>
                </div>
             )}
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3">
             <input type="file" accept="image/*" onChange={handleUpload} ref={fileInputRef} className="hidden" />
             {imageSrc && (
               <>
                 <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg text-xs font-bold transition bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400">
                   REPLACE
                 </button>
                 <button 
                   onClick={handleExport}
                   className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                 >
                   <Download size={16} /> Export
                 </button>
               </>
             )}
           </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto p-10 pt-24 flex items-start justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
           {!imageSrc ? (
              <div className="flex flex-col items-center justify-center h-full w-full animate-in zoom-in-95 duration-300">
                 <button onClick={() => fileInputRef.current?.click()} className="group text-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto bg-zinc-100 dark:bg-zinc-900 group-hover:scale-110 transition-transform">
                       <UploadCloud size={32} className="text-zinc-400 dark:text-zinc-600 group-hover:text-blue-500 transition-colors"/>
                    </div>
                    <h3 className="font-bold text-2xl text-zinc-900 dark:text-white mb-2">Upload Image</h3>
                    <p className="text-zinc-500 dark:text-zinc-500">Drag & drop or click to browse</p>
                 </button>
              </div>
           ) : (
             <div 
               className="relative shadow-2xl transition-all duration-200 ease-out origin-top m-auto"
               style={{ 
                 width: `${scale * 100}%`,
                 minWidth: '100px',
                 maxWidth: 'none'
               }}
             >
               {/* THE IMAGE LAYER */}
               <img 
                 src={imageSrc} 
                 alt="Workspace" 
                 className="w-full h-auto block bg-white dark:bg-zinc-800 rounded-sm select-none"
                 draggable={false}
                 style={{
                   filter: `${editState.filter} brightness(${editState.brightness}%) contrast(${editState.contrast}%)`
                 }}
               />

               {/* WATERMARK LAYER */}
               {editState.watermarkText && (
                 <div 
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap font-bold select-none mix-blend-overlay"
                   style={{ 
                     color: editState.watermarkColor, 
                     fontSize: `${editState.watermarkSize * scale}px`,
                     opacity: 0.8
                   }}
                 >
                   {editState.watermarkText}
                 </div>
               )}

               {/* CROP OVERLAY (Visual only) */}
               {editState.cropActive && (
                  <div className="absolute inset-0 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10 pointer-events-none">
                     <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
                     <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
                     <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
                     <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
                     <div className="absolute left-1/3 inset-y-0 border-l border-white/30"></div>
                     <div className="absolute right-1/3 inset-y-0 border-r border-white/30"></div>
                     <div className="absolute top-1/3 inset-x-0 border-t border-white/30"></div>
                     <div className="absolute bottom-1/3 inset-x-0 border-b border-white/30"></div>
                  </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}