"use client";

import React from 'react';

export default function WatermarkTool({ editState, setEditState }: any) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Watermark Text</label>
        <input 
          type="text" 
          placeholder="© Your Name"
          value={editState.watermarkText}
          onChange={(e) => setEditState((prev: any) => ({ ...prev, watermarkText: e.target.value }))}
          className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={editState.watermarkColor}
                onChange={(e) => setEditState((prev: any) => ({ ...prev, watermarkColor: e.target.value }))}
                className="h-10 w-full p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Size (px)</label>
            <input 
               type="number"
               value={editState.watermarkSize}
               onChange={(e) => setEditState((prev: any) => ({...prev, watermarkSize: Number(e.target.value)}))}
               className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white outline-none"
             />
          </div>
      </div>
    </div>
  );
}