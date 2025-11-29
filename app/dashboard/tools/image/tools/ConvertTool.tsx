"use client";

import React from 'react';
import { Check } from 'lucide-react';

export default function ConvertTool({ image }: { image: string | null }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Target Format</label>
        <select className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white outline-none">
          <option>PNG (Lossless)</option>
          <option>JPG (Standard)</option>
          <option>WEBP (Web Optimized)</option>
          <option>SVG (Vector)</option>
        </select>
      </div>
      <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Check size={16} /> Convert & Download
      </button>
    </div>
  );
}