"use client";

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const FILTERS = [
  { name: 'Normal', value: 'none' },
  { name: 'Gray', value: 'grayscale(100%)' },
  { name: 'Sepia', value: 'sepia(100%)' },
  { name: 'Invert', value: 'invert(100%)' },
  { name: 'Blur', value: 'blur(2px)' },
  { name: 'Warm', value: 'sepia(50%) saturate(150%)' },
  { name: 'Cool', value: 'hue-rotate(180deg)' },
  { name: 'Vintage', value: 'sepia(40%) contrast(150%)' },
];

export default function FilterTool({ editState, setEditState }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={18} className="text-zinc-500"/>
        <h3 className="font-bold text-zinc-900 dark:text-white">Adjustments</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.name}
            onClick={() => setEditState((prev: any) => ({ ...prev, filter: f.value }))}
            className={`text-xs p-3 rounded-lg border text-center transition-all ${
              editState.filter === f.value 
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex justify-between">
             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Brightness</label>
             <span className="text-xs text-zinc-400">{editState.brightness}%</span>
          </div>
          <input 
            type="range" min="50" max="150" 
            value={editState.brightness}
            onChange={(e) => setEditState((prev: any) => ({...prev, brightness: Number(e.target.value)}))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
             <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Contrast</label>
             <span className="text-xs text-zinc-400">{editState.contrast}%</span>
          </div>
          <input 
            type="range" min="50" max="150" 
            value={editState.contrast}
            onChange={(e) => setEditState((prev: any) => ({...prev, contrast: Number(e.target.value)}))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
        </div>
      </div>
    </div>
  );
}