"use client";

import React from 'react';
import { Check } from 'lucide-react';

export default function CropTool({ editState, setEditState }: any) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Select an aspect ratio to show the crop grid overlay.</p>
      <div className="grid grid-cols-3 gap-2">
        {['Free', '1:1', '16:9', '4:3', '3:2', '2:3'].map((ratio) => (
          <button 
            key={ratio} 
            className="px-3 py-2 text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {ratio}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => setEditState((prev: any) => ({...prev, cropActive: !prev.cropActive}))}
        className={`w-full py-3 rounded-xl text-sm font-bold border transition-colors ${editState.cropActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
      >
        {editState.cropActive ? 'Grid Active' : 'Show Grid'}
      </button>

      <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Check size={16} /> Crop Selection
      </button>
    </div>
  );
}