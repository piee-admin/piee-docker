"use client";

import React from 'react';
import { Eraser, Zap } from 'lucide-react';

export default function RemoveBgTool() {
  return (
    <div className="text-center space-y-6 pt-4">
       <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-zinc-300 dark:border-zinc-700">
         <Eraser className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
       </div>
       <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">Background Removal</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed px-4">
            Automatically detect and remove the background from your subject in seconds.
          </p>
       </div>
       <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
         <Zap size={16} className="fill-current" /> Remove Background
       </button>
     </div>
  );
}