"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Minimize2, Maximize2, Crop as CropIcon, FileType, Scaling, 
  Eraser, Stamp, Wand2, FileText, UploadCloud, 
  Layers, Download, Undo, Redo, 
  ZoomIn, ZoomOut, ChevronLeft,
} from 'lucide-react';

import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  blur: number;
  hueRotate: number;
  filter: string; 
  
  // Watermark (Enhanced)
  watermarkText: string;
  watermarkColor: string;
  watermarkSize: number;
  watermarkOpacity: number;
  watermarkRotation: number;
  watermarkPosition: string;
  watermarkTileCount: number; // Blocks
  watermarkTileGap: number;   // Distance
}

interface ExportConfig {
  mime: string;
  quality: number;
  extension: string;
}

const DEFAULT_EDIT_STATE: EditState = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  hueRotate: 0,
  filter: 'none',
  
  watermarkText: '',
  watermarkColor: '#ffffff',
  watermarkSize: 32,
  watermarkOpacity: 0.8,
  watermarkRotation: 0,
  watermarkPosition: 'center',
  watermarkTileCount: 3,
  watermarkTileGap: 0,
};

// --- MAIN COMPONENT ---
export default function ImageEditorPage() {
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [imgDims, setImgDims] = useState<{ w: number, h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false); // New state for drag visual feedback
  
  const [editState, setEditState] = useState<EditState>(DEFAULT_EDIT_STATE);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    mime: 'image/png', quality: 1.0, extension: 'png'
  });
  
  // History State
  const [history, setHistory] = useState<EditState[]>([DEFAULT_EDIT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isHistoryAction = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop State
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  // --- HISTORY MANAGEMENT ---
  useEffect(() => {
    if (isHistoryAction.current) { isHistoryAction.current = false; return; }
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

  // --- IMAGE HISTORY ---
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [imageHistoryIndex, setImageHistoryIndex] = useState(-1);
  const isImageHistoryAction = useRef(false);

  useEffect(() => {
    if (imageSrc && imageHistory.length === 0) {
      setImageHistory([imageSrc]);
      setImageHistoryIndex(0);
    }
  }, [imageSrc, imageHistory.length]);

  const addToImageHistory = (newUrl: string, newFile: File) => {
    if (!isImageHistoryAction.current) {
      const newHistory = imageHistory.slice(0, imageHistoryIndex + 1);
      newHistory.push(newUrl);
      setImageHistory(newHistory);
      setImageHistoryIndex(newHistory.length - 1);
    }
    setFile(newFile);
    setImageSrc(newUrl);
  };

  const handleUndo = () => {
    if (imageHistoryIndex > 0) {
      isImageHistoryAction.current = true;
      const newIndex = imageHistoryIndex - 1;
      setImageHistoryIndex(newIndex);
      const previousImageUrl = imageHistory[newIndex];
      setImageSrc(previousImageUrl);
      fetch(previousImageUrl).then(r => r.blob()).then(blob => {
          const newFile = new File([blob], file?.name || 'image.jpg', { type: blob.type });
          setFile(newFile);
      });
    } else if (historyIndex > 0) {
      isHistoryAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditState(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (imageHistoryIndex < imageHistory.length - 1) {
      isImageHistoryAction.current = true;
      const newIndex = imageHistoryIndex + 1;
      setImageHistoryIndex(newIndex);
      const nextImageUrl = imageHistory[newIndex];
      setImageSrc(nextImageUrl);
      fetch(nextImageUrl).then(r => r.blob()).then(blob => {
          const newFile = new File([blob], file?.name || 'image.jpg', { type: blob.type });
          setFile(newFile);
      });
    } else if (historyIndex < history.length - 1) {
      isHistoryAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditState(history[newIndex]);
    }
  };

  // --- FILE HANDLING (Unified for Drop & Click) ---
  const loadFile = (selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    const extension = selected.type.split('/')[1] || 'png';
    setExportConfig({ mime: selected.type, quality: 0.92, extension: extension });
    setActiveTool(null);
    setEditState(DEFAULT_EDIT_STATE);
    setHistory([DEFAULT_EDIT_STATE]);
    setHistoryIndex(0);
    setImageHistory([]); 
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) loadFile(selected);
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
        loadFile(selected);
    }
  };

  // --- TOOL HANDLERS ---
  const handleCompressApply = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    const newFile = new File([blob], file?.name || 'compressed.jpg', { type: blob.type });
    addToImageHistory(newUrl, newFile);
  };

  const handleResizeApply = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    const newFile = new File([blob], file?.name || 'resized.jpg', { type: blob.type });
    addToImageHistory(newUrl, newFile);
  };

  const handleRemoveBgApply = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    const newFile = new File([blob], 'removed-bg.png', { type: 'image/png' });
    addToImageHistory(newUrl, newFile);
    setExportConfig({ mime: 'image/png', quality: 1.0, extension: 'png' });
  };

  const handleUpscaleApply = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    const newFile = new File([blob], 'upscaled.png', { type: 'image/png' });
    addToImageHistory(newUrl, newFile);
    setExportConfig({ mime: 'image/png', quality: 1.0, extension: 'png' });
  };

  const handlePdfApply = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    const newFile = new File([blob], 'document-preview.jpg', { type: 'image/jpeg' });
    addToImageHistory(newUrl, newFile);
    setExportConfig({ mime: 'application/pdf', quality: 1.0, extension: 'pdf' });
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDims({ w: naturalWidth, h: naturalHeight });

    if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 80;
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;
        const scaleW = availableW / naturalWidth;
        const scaleH = availableH / naturalHeight;
        const fitScale = Math.min(scaleW, scaleH, 1.0);
        setScale(fitScale);
    }

    if (activeTool === 'crop') {
        const { width, height } = e.currentTarget;
        const currentAspect = aspect || (width / height);
        const newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, currentAspect, width, height), width, height);
        setCrop(newCrop);
        setCompletedCrop({
          unit: 'px', x: (newCrop.x / 100) * width, y: (newCrop.y / 100) * height,
          width: (newCrop.width / 100) * width, height: (newCrop.height / 100) * height,
        });
    }
  };

  const handleCropApply = () => {
    if (!imgRef.current || !completedCrop) return;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelWidth = completedCrop.width * scaleX;
    const pixelHeight = completedCrop.height * scaleY;
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, pixelWidth, pixelHeight, 0, 0, pixelWidth, pixelHeight);
    const outputFormat = file?.type || 'image/png';
    canvas.toBlob((blob) => {
      if (!blob) return;
      const newUrl = URL.createObjectURL(blob);
      const newFile = new File([blob], file?.name || 'cropped.jpg', { type: outputFormat });
      addToImageHistory(newUrl, newFile);
      setCrop(undefined); 
      setCompletedCrop(undefined);
    }, outputFormat, 1);
  };

  const filterString = useMemo(() => {
    return `brightness(${editState?.brightness ?? 100}%) contrast(${editState?.contrast ?? 100}%) saturate(${editState?.saturate ?? 100}%) grayscale(${editState?.grayscale ?? 0}%) sepia(${editState?.sepia ?? 0}%) hue-rotate(${editState?.hueRotate ?? 0}deg) blur(${editState?.blur ?? 0}px)`;
  }, [editState]);

  const handleExport = async () => {
    if (!imageSrc) return;
    
    const hasVisualEdits = editState.brightness !== 100 || 
                           editState.contrast !== 100 || 
                           editState.saturate !== 100 ||
                           editState.grayscale !== 0 ||
                           editState.sepia !== 0 ||
                           editState.blur !== 0 ||
                           editState.hueRotate !== 0 ||
                           editState.watermarkText;
    
    const isFormatChanged = file?.type !== exportConfig.mime;
    
    if (!hasVisualEdits && !isFormatChanged && file) {
      const link = document.createElement('a');
      link.download = `image.${exportConfig.extension}`;
      link.href = URL.createObjectURL(file);
      link.click();
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    
    img.onload = async () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      if (!ctx) return;

      if (exportConfig.mime === 'image/jpeg' || exportConfig.mime === 'image/bmp' || exportConfig.mime === 'application/pdf') {
         ctx.fillStyle = '#FFFFFF';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);
      
      // --- WATERMARK EXPORT LOGIC ---
      if (editState.watermarkText) {
         const exportFontSize = editState.watermarkSize / scale;
         ctx.font = `bold ${exportFontSize}px sans-serif`;
         ctx.fillStyle = editState.watermarkColor;
         ctx.globalAlpha = editState.watermarkOpacity;
         ctx.textBaseline = 'middle';
         
         if (editState.watermarkPosition === 'tile') {
            ctx.textAlign = 'center';
            const count = editState.watermarkTileCount || 3;
            const gap = editState.watermarkTileGap || 0;
            const cellW = canvas.width / count;
            const cellH = canvas.height / count;
            
            for(let i=0; i<count; i++) {
              for(let j=0; j<count; j++) {
                 ctx.save();
                 // Apply gap as an offset
                 const gapOffsetX = (i - count/2) * gap;
                 const gapOffsetY = (j - count/2) * gap;
                 const targetX = (cellW * i) + (cellW / 2) + gapOffsetX;
                 const targetY = (cellH * j) + (cellH / 2) + gapOffsetY;
                 
                 ctx.translate(targetX, targetY);
                 ctx.rotate((editState.watermarkRotation ?? 0) * Math.PI / 180);
                 ctx.fillText(editState.watermarkText, 0, 0);
                 ctx.restore();
              }
            }
         } else {
            let x = canvas.width / 2;
            let y = canvas.height / 2;
            const margin = canvas.width * 0.05; 
            ctx.textAlign = 'center';
            switch (editState.watermarkPosition) {
              case 'top-left': x = margin; y = margin; ctx.textAlign = 'left'; break;
              case 'top-right': x = canvas.width - margin; y = margin; ctx.textAlign = 'right'; break;
              case 'bottom-left': x = margin; y = canvas.height - margin; ctx.textAlign = 'left'; break;
              case 'bottom-right': x = canvas.width - margin; y = canvas.height - margin; ctx.textAlign = 'right'; break;
              case 'center': default: break;
            }
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((editState.watermarkRotation ?? 0) * Math.PI / 180);
            ctx.fillText(editState.watermarkText, 0, 0);
            ctx.restore();
         }
         ctx.globalAlpha = 1.0; 
      }
      
      const originalName = file?.name.split('.')[0] || 'image';
      const filename = `${originalName}-edited.${exportConfig.extension}`;
      
      if (exportConfig.mime === 'application/pdf') {
        const { jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL('image/jpeg', exportConfig.quality);
        const orientation = canvas.width > canvas.height ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'px', [canvas.width, canvas.height]);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
        return;
      }

      if (exportConfig.mime === 'image/svg+xml') {
        const imgData = canvas.toDataURL('image/png');
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${imgData}" width="${canvas.width}" height="${canvas.height}" /></svg>`;
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
        }
      }, exportConfig.mime, exportConfig.quality);
    };
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'compress': return <CompressTool image={imageSrc} file={file} onApply={handleCompressApply} />;
      case 'resize': return <ResizeTool image={imageSrc} file={file} onApply={handleResizeApply} />;
      case 'crop': return <CropTool onApply={handleCropApply} onCancel={() => setActiveTool(null)} aspect={aspect} setAspect={setAspect} isReady={!!completedCrop} currentWidth={completedCrop?.width || 0} currentHeight={completedCrop?.height || 0} />;
      case 'convert': return <ConvertTool currentFormat={exportConfig.mime} onApply={(mime, quality) => { setExportConfig({ mime, quality, extension: mime.split('/')[1] }); setActiveTool(null); }} />;
      case 'filter': return <FilterTool editState={editState} setEditState={setEditState} />;
      case 'watermark': return <WatermarkTool editState={editState} setEditState={setEditState} />;
      case 'upscale': return <UpscaleTool image={imageSrc} onApply={handleUpscaleApply} />;
      case 'remove-bg': return <RemoveBgTool image={imageSrc} onApply={handleRemoveBgApply} />;
      case 'to-pdf': return <ToPdfTool image={imageSrc} file={file} editState={editState} onApply={handlePdfApply} />;
      default: return null;
    }
  };

  return (
    <div 
      className="flex h-screen w-full bg-white dark:bg-black text-zinc-900 dark:text-white overflow-hidden font-sans transition-colors duration-300"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 flex flex-col z-20 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {activeTool ? (
            <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition text-sm font-medium">
              <ChevronLeft size={16} /> BACK
            </button>
          ) : (
            <span className="text-lg font-bold flex items-center gap-2 tracking-tight text-zinc-900 dark:text-white">
              <Layers className="text-zinc-600 dark:text-zinc-400" size={20}/> Image Tools
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {!activeTool ? (
             <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'compress', label: 'Compress', icon: Minimize2, desc: 'Reduce size' },
                  { id: 'resize', label: 'Resize', icon: Maximize2, desc: 'Change dimensions' },
                  { id: 'crop', label: 'Crop', icon: CropIcon, desc: 'Trim edges' },
                  { id: 'convert', label: 'Convert', icon: FileType, desc: 'Format change' },
                  { id: 'upscale', label: 'Upscale', icon: Scaling, desc: 'AI Enhancement', isAI: true },
                  { id: 'remove-bg', label: 'Remove BG', icon: Eraser, desc: 'Transparent BG', isAI: true },
                  { id: 'watermark', label: 'Watermark', icon: Stamp, desc: 'Add branding' },
                  { id: 'filter', label: 'Filters', icon: Wand2, desc: 'Color effects' },
                  { id: 'to-pdf', label: 'To PDF', icon: FileText, desc: 'Make document' },
                ].map((tool) => (
                  <button key={tool.id} onClick={() => setActiveTool(tool.id as ToolId)} disabled={!imageSrc} className={`group flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${!imageSrc ? 'opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900 border-transparent' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm'}`}>
                    <div className={`p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors`}>
                      {React.createElement(tool.icon, { size: 18 })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{tool.label}</h3>
                         {tool.isAI && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">AI</span>}
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

      {/* RIGHT CANVAS */}
      <div className="flex-1 flex flex-col relative bg-zinc-100 dark:bg-[#09090b]">
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md absolute top-0 w-full z-10">
           <div className="flex items-center gap-2">
             {imageSrc && (
               <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                 <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition shadow-sm"><ZoomOut size={16}/></button>
                 <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                 <button onClick={() => setScale(s => Math.min(5.0, s + 0.1))} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition shadow-sm"><ZoomIn size={16}/></button>
               </div>
             )}
             {imageSrc && (
               <div className="flex items-center gap-1 ml-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                   <button onClick={handleUndo} disabled={imageHistoryIndex <= 0 && historyIndex <= 0} className={`p-1.5 rounded transition shadow-sm ${(imageHistoryIndex <= 0 && historyIndex <= 0) ? 'opacity-30 cursor-not-allowed text-zinc-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'}`}><Undo size={16} /></button>
                   <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700"></div>
                   <button onClick={handleRedo} disabled={imageHistoryIndex >= imageHistory.length - 1 && historyIndex >= history.length - 1} className={`p-1.5 rounded transition shadow-sm ${(imageHistoryIndex >= imageHistory.length - 1 && historyIndex >= history.length - 1) ? 'opacity-30 cursor-not-allowed text-zinc-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'}`}><Redo size={16} /></button>
                </div>
             )}
           </div>

           <div className="flex items-center gap-3">
             <input type="file" accept="image/*" onChange={handleUpload} ref={fileInputRef} className="hidden" />
             {imageSrc && (
               <>
                 <div className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                   {exportConfig.extension}
                 </div>
                 <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg text-xs font-bold transition bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400">
                   REPLACE
                 </button>
                 <button onClick={handleExport} className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                   <Download size={16} /> Export
                 </button>
               </>
             )}
           </div>
        </div>

        {/* --- SCROLLABLE CANVAS AREA --- */}
        <div 
          ref={containerRef}
          className={`flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 transition-colors relative ${isDragging ? 'ring-4 ring-black-500/20 bg-black-50 dark:bg-black-950/20' : ''}`}
        >
           {/* DROP ZONE OVERLAY */}
           {isDragging && (
             <div className="absolute inset-0 z-50 bg-black-500/10 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-black-500 border-dashed m-4 rounded-3xl pointer-events-none">
               <div className="p-6 bg-white dark:bg-zinc-900 rounded-full shadow-xl mb-4">
                 <UploadCloud size={48} className="text-black-500" />
               </div>
               <h3 className="text-2xl font-bold text-black-600 dark:text-black-400">Drop Image Here</h3>
             </div>
           )}

           {!imageSrc ? (
              <div className="flex h-full w-full flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                 <button onClick={() => fileInputRef.current?.click()} className="group text-center p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-all">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto bg-zinc-100 dark:bg-zinc-900 group-hover:scale-110 transition-transform">
                       <UploadCloud size={32} className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors"/>
                    </div>
                    <h3 className="font-bold text-2xl text-zinc-900 dark:text-white mb-2">Upload Image</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Drag & drop or click to browse</p>
                 </button>
              </div>
           ) : (
             <div className="min-w-full min-h-full flex items-center justify-center p-10 pt-24">
               <div 
                 className="relative shadow-2xl transition-all duration-150 ease-out origin-center bg-white dark:bg-zinc-900"
                 style={{ 
                   width: imgDims ? imgDims.w * scale : 'auto',
                   height: imgDims ? imgDims.h * scale : 'auto',
                   flexShrink: 0
                 }}
               >
                  {activeTool === 'crop' ? (
                    <ReactCrop 
                      crop={crop} 
                      onChange={(_, percentCrop) => setCrop(percentCrop)} 
                      onComplete={(c) => setCompletedCrop(c)} 
                      aspect={aspect} 
                      className="w-full h-full"
                    >
                      <img 
                        ref={imgRef} 
                        src={imageSrc} 
                        onLoad={onImageLoad} 
                        alt="Crop Workspace" 
                        draggable={false} 
                        className="w-full h-full object-contain" 
                        style={{ filter: filterString }} 
                      />
                    </ReactCrop>
                  ) : (
                     <div className="relative w-full h-full overflow-hidden">
                       <img 
                         src={imageSrc} 
                         onLoad={onImageLoad} 
                         alt="Workspace" 
                         className="w-full h-full object-contain pointer-events-none select-none" 
                         draggable={false} 
                         style={{ filter: filterString }} 
                       />
                       
                       {/* WATERMARK OVERLAY */}
                       {editState.watermarkText && editState.watermarkPosition === 'tile' ? (
                          <div 
                            className="absolute inset-0 grid pointer-events-none" 
                            style={{ 
                              gridTemplateColumns: `repeat(${editState.watermarkTileCount || 3}, 1fr)`,
                              gridTemplateRows: `repeat(${editState.watermarkTileCount || 3}, 1fr)`,
                              gap: `${(editState.watermarkTileGap || 0) * scale}px` 
                            }}
                          >
                             {[...Array((editState.watermarkTileCount || 3) ** 2)].map((_, i) => (
                               <div key={i} className="flex items-center justify-center overflow-hidden">
                                  <div 
                                    className="whitespace-nowrap font-bold select-none mix-blend-overlay"
                                    style={{
                                      color: editState.watermarkColor,
                                      fontSize: `${editState.watermarkSize}px`,
                                      opacity: editState.watermarkOpacity ?? 0.8,
                                      transform: `rotate(${editState.watermarkRotation ?? 0}deg)`,
                                    }}
                                  >
                                    {editState.watermarkText}
                                  </div>
                               </div>
                             ))}
                          </div>
                       ) : (
                         editState.watermarkText && (
                           <div 
                             className="absolute pointer-events-none whitespace-nowrap font-bold select-none mix-blend-overlay" 
                             style={{ 
                               color: editState.watermarkColor, 
                               fontSize: `${editState.watermarkSize}px`, 
                               opacity: editState.watermarkOpacity ?? 0.8,
                               transform: `translate(-50%, -50%) rotate(${editState.watermarkRotation ?? 0}deg)`,
                               left: editState.watermarkPosition?.includes('left') ? '10%' : 
                                     editState.watermarkPosition?.includes('right') ? '90%' : '50%',
                               top: editState.watermarkPosition?.includes('top') ? '10%' : 
                                    editState.watermarkPosition?.includes('bottom') ? '90%' : '50%',
                             }}
                           >
                             {editState.watermarkText}
                           </div>
                         )
                       )}
                     </div>
                  )}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
