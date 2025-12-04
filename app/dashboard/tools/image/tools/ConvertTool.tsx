"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';

// --- TYPES ---
export interface FormatOption {
  id: string; 
  label: string;
  mime: string; 
  extension: string; // File extension
  lossy: boolean;
  desc: string; // Added description back for clarity
}

// --- CONFIGURATION ---
export const FORMATS: FormatOption[] = [
  // Web Standard
  { id: 'png', label: 'PNG', mime: 'image/png', extension: 'png', lossy: false, desc: 'Lossless & Transparency' },
  { id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', extension: 'jpg', lossy: true, desc: 'Small File Size' },
  { id: 'webp', label: 'WEBP', mime: 'image/webp', extension: 'webp', lossy: true, desc: 'Modern Web Standard' },
  { id: 'avif', label: 'AVIF', mime: 'image/avif', extension: 'avif', lossy: true, desc: 'Next-Gen Compression' },
  
  // New Formats Added
  { id: 'bmp', label: 'BMP', mime: 'image/bmp', extension: 'bmp', lossy: false, desc: 'Uncompressed Bitmap' },
  { id: 'svg', label: 'SVG', mime: 'image/svg+xml', extension: 'svg', lossy: false, desc: 'Vector Container' },
  { id: 'pdf', label: 'PDF', mime: 'application/pdf', extension: 'pdf', lossy: false, desc: 'Document Format' },
];

interface ConvertToolProps {
  currentFormat: string; 
  onApply: (format: string, quality: number) => void;
}

export default function ConvertTool({ currentFormat, onApply }: ConvertToolProps) {
  // Find initial format object
  const initialFormat = FORMATS.find(f => f.mime === currentFormat) || FORMATS[0];
  
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(initialFormat);
  const [isOpen, setIsOpen] = useState(false);
  const [quality, setQuality] = useState(0.92);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    onApply(selectedFormat.mime, quality);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex gap-3 items-center">
        <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
           <Settings2 size={18} className="text-zinc-700 dark:text-zinc-300"/>
        </div>
        <div>
           <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Export Settings</h3>
           <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Configure your output format</p>
        </div>
      </div>

      {/* --- CUSTOM DROPDOWN --- */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
          Target Format
        </label>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between
            ${isOpen 
              ? 'border-zinc-900 ring-1 ring-zinc-900 dark:border-white dark:ring-white bg-white dark:bg-zinc-900' 
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
        >
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-white block">{selectedFormat.label}</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{selectedFormat.desc}</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar p-1">
            {FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => {
                  setSelectedFormat(fmt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors mb-0.5
                  ${selectedFormat.id === fmt.id 
                    ? 'bg-zinc-100 dark:bg-zinc-800' 
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
              >
                <div>
                  <span className={`text-sm font-bold block ${selectedFormat.id === fmt.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {fmt.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                    {fmt.desc}
                  </span>
                </div>
                {selectedFormat.id === fmt.id && <Check size={14} className="text-zinc-900 dark:text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- QUALITY SLIDER --- */}
      {selectedFormat.lossy && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quality</label>
             <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-900 dark:text-white">
               {Math.round(quality * 100)}%
             </span>
           </div>
           <input 
             type="range" 
             min="0.1" 
             max="1" 
             step="0.05" 
             value={quality}
             onChange={(e) => setQuality(parseFloat(e.target.value))}
             className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
           />
           <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
             <span>Low Size</span>
             <span>Max Quality</span>
           </div>
        </div>
      )}

      {/* --- ACTION BUTTON --- */}
      <button 
        onClick={handleApply}
        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90 shadow-md"
      >
        <Check size={18} /> Apply Configuration
      </button>

    </div>
  );
}