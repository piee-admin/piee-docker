"use client";

import React from 'react';
import { Scaling, Zap } from 'lucide-react';

export default function UpscaleTool() {
  return (
    <div className="text-center space-y-6 pt-4">
       <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
         <Scaling className="w-8 h-8 text-white" />
       </div>
       <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">AI Super Resolution</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed px-4">
            Upscale your image up to 4x without losing quality using our latest neural networks.
          </p>
       </div>
       <div className="grid grid-cols-2 gap-2">
          <button className="py-3 rounded-xl border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold">2x Scale</button>
          <button className="py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:border-blue-600 hover:text-blue-600 transition-colors">4x Scale</button>
       </div>
       <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
         <Zap size={16} className="fill-current" /> Start Upscaling
       </button>
     </div>
  );
}