"use client";

import React from 'react';
import { 
  Crop as CropIcon, 
  Instagram, 
  Youtube, 
  Smartphone, 
  Monitor, 
  Twitter, 
  Layout, 
  Image as ImageIcon 
} from 'lucide-react';

interface CropToolProps {
  onApply: () => void;
  onCancel: () => void;
  aspect: number | undefined;
  setAspect: (aspect: number | undefined) => void;
  isReady: boolean;
  // We accept generic width/height to display in the boxes
  currentWidth?: number;
  currentHeight?: number;
}

export default function CropTool({ 
  onApply, 
  onCancel, 
  aspect, 
  setAspect, 
  isReady,
  currentWidth = 0,
  currentHeight = 0
}: CropToolProps) {
  
  // Define presets to match your screenshot
  const presets = [
    { label: 'Free', sub: 'Custom', value: undefined, icon: CropIcon },
    { label: '1:1', sub: 'Instagram Post', value: 1, icon: Instagram },
    { label: '16:9', sub: 'YouTube Video', value: 16 / 9, icon: Youtube },
    { label: '9:16', sub: 'TikTok / Reels', value: 9 / 16, icon: Smartphone },
    { label: '4:5', sub: 'Insta Portrait', value: 4 / 5, icon: ImageIcon },
    { label: '2:1', sub: 'Twitter Card', value: 2 / 1, icon: Twitter },
    { label: '3:4', sub: 'Pinterest / FB', value: 3 / 4, icon: Layout },
    { label: '4:3', sub: 'Standard / Web', value: 4 / 3, icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      
      {/* --- PRESETS SECTION --- */}
      <div>
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 mb-3 uppercase tracking-wider">
          Presets
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setAspect(preset.value)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200
                ${aspect === preset.value
                  ? 'bg-white text-black border-white shadow-md dark:bg-white dark:text-black dark:border-white'
                  : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <preset.icon size={16} className={aspect === preset.value ? 'text-black' : 'text-zinc-500'} />
                <span className="text-sm font-bold">{preset.label}</span>
              </div>
              <span className={`text-[10px] ${aspect === preset.value ? 'text-zinc-600' : 'text-zinc-500'}`}>
                {preset.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- DIMENSIONS SECTION --- */}
      <div>
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 mb-3 uppercase tracking-wider">
          Dimensions (PX)
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* WIDTH INPUT */}
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 uppercase">
              W
            </div>
            <input 
              type="number"
              value={Math.round(currentWidth)}
              readOnly
              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl py-3 pl-8 pr-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* HEIGHT INPUT */}
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 uppercase">
              H
            </div>
            <input 
              type="number"
              value={Math.round(currentHeight)}
              readOnly
              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl py-3 pl-8 pr-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* --- ACTION BUTTON --- */}
      <div className="pt-2">
        <button 
          onClick={onApply}
          disabled={!isReady}
          className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm
            ${!isReady 
              ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-600 dark:border-zinc-800 cursor-not-allowed' 
              : 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md'
            }`}
        >
          Generate Crop
        </button>
      </div>

    </div>
  );
}