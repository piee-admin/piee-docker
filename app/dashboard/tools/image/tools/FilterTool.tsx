"use client";

import React from 'react';
import { SlidersHorizontal, RotateCcw, Wand2 } from 'lucide-react';

// --- TYPES ---
// We import the EditState interface structure implicitly by usage, 
// ensuring it matches the parent state.
interface FilterToolProps {
  editState: any; // Using any here to allow flexibility, but typed in parent
  setEditState: (state: any) => void;
}

// --- PRESET DEFINITIONS ---
const PRESETS = [
  { 
    name: 'Normal', 
    values: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } 
  },
  { 
    name: 'Vivid', 
    values: { brightness: 110, contrast: 120, saturate: 140, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } 
  },
  { 
    name: 'Noir', 
    values: { brightness: 100, contrast: 130, saturate: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0 } 
  },
  { 
    name: 'Vintage', 
    values: { brightness: 100, contrast: 90, saturate: 60, grayscale: 0, sepia: 50, hueRotate: 0, blur: 0 } 
  },
  { 
    name: 'Dramatic', 
    values: { brightness: 90, contrast: 150, saturate: 90, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } 
  },
  { 
    name: 'Soft', 
    values: { brightness: 105, contrast: 85, saturate: 90, grayscale: 0, sepia: 10, hueRotate: 0, blur: 0.5 } 
  },
];

export default function FilterTool({ editState, setEditState }: FilterToolProps) {

  const applyPreset = (values: any) => {
    setEditState((prev: any) => ({
      ...prev,
      ...values
    }));
  };

  const resetFilters = () => {
    applyPreset(PRESETS[0].values);
  };

  const handleChange = (key: string, value: number) => {
    setEditState((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-zinc-400 dark:text-zinc-500"/>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-sm">Adjustments</h3>
        </div>
        <button 
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* --- PRESETS GRID --- */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Wand2 size={12} /> Presets
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.values)}
              className="px-2 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all active:scale-95"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full"></div>

      {/* --- SLIDERS --- */}
      <div className="space-y-6">
        {[
          { key: 'brightness', label: 'Brightness', min: 0, max: 200 },
          { key: 'contrast', label: 'Contrast', min: 0, max: 200 },
          { key: 'saturate', label: 'Saturation', min: 0, max: 200 },
          { key: 'grayscale', label: 'Grayscale', min: 0, max: 100 },
          { key: 'sepia', label: 'Sepia', min: 0, max: 100 },
          { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1, unit: 'px' },
          { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, unit: '°' },
        ].map((slider) => (
          <div key={slider.key} className="space-y-3 group">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {slider.label}
              </label>
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                {editState[slider.key]}{slider.unit || '%'}
              </span>
            </div>
            
            <div className="relative h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full">
               <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step || 1}
                value={editState[slider.key]}
                onChange={(e) => handleChange(slider.key, Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute left-0 top-0 h-full bg-zinc-400 dark:bg-zinc-600 rounded-full"
                style={{ 
                  width: `${((editState[slider.key] - slider.min) / (slider.max - slider.min)) * 100}%` 
                }}
              ></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white dark:bg-zinc-300 rounded-full shadow-md pointer-events-none transition-transform group-hover:scale-125"
                style={{ 
                  left: `${((editState[slider.key] - slider.min) / (slider.max - slider.min)) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}