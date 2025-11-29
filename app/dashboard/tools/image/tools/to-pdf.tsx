"use client";

import React from 'react';
import { Download } from 'lucide-react';

export default function ToPdfTool() {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
         <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Page Size</label>
         <select className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white outline-none">
           <option>A4 (210 x 297 mm)</option>
           <option>Letter (8.5 x 11 in)</option>
           <option>Fit to Image</option>
         </select>
       </div>
       <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Orientation</label>
          <div className="grid grid-cols-2 gap-2">
             <button className="py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">Portrait</button>
             <button className="py-2 text-sm font-medium bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800">Landscape</button>
          </div>
       </div>
       <button className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
         <Download size={16} /> Export as PDF
       </button>
    </div>
  );
}