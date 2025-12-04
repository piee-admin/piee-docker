"use client";

import React from 'react';
import { 
  CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Move, Grid3X3
} from 'lucide-react';

interface WatermarkToolProps {
  editState: any;
  setEditState: (state: any) => void;
}

export default function WatermarkTool({ editState, setEditState }: WatermarkToolProps) {
  
  const handleChange = (key: string, value: any) => {
    setEditState((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      
      {/* --- TEXT INPUT --- */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
          Watermark Text
        </label>
        <input 
          type="text" 
          placeholder="Enter text here..."
          value={editState.watermarkText || ''}
          onChange={(e) => handleChange('watermarkText', e.target.value)}
          className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors placeholder:text-zinc-400"
        />
      </div>

      {/* --- SLIDERS --- */}
      <div className="space-y-5">
        
        {/* Font Size */}
        <div className="space-y-3 group">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Font Size</label>
            <span className="text-xs font-mono text-zinc-900 dark:text-zinc-300">{editState.watermarkSize}px</span>
          </div>
          <input 
            type="range" 
            min="10" max="200" 
            value={editState.watermarkSize} 
            onChange={(e) => handleChange('watermarkSize', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-3 group">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Opacity</label>
            <span className="text-xs font-mono text-zinc-900 dark:text-zinc-300">{Math.round((editState.watermarkOpacity ?? 0.8) * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="1" step="0.05"
            value={editState.watermarkOpacity ?? 0.8} 
            onChange={(e) => handleChange('watermarkOpacity', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-3 group">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rotation</label>
            <span className="text-xs font-mono text-zinc-900 dark:text-zinc-300">{editState.watermarkRotation ?? 0}°</span>
          </div>
          <input 
            type="range" 
            min="-180" max="180" 
            value={editState.watermarkRotation ?? 0} 
            onChange={(e) => handleChange('watermarkRotation', Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
        </div>

        {/* --- TILE SETTINGS (CONDITIONAL) --- */}
        {editState.watermarkPosition === 'tile' && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-1">
               <Grid3X3 size={14} className="text-zinc-500"/>
               <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Tile Settings</label>
            </div>

            {/* Grid Size (Blocks) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Blocks (Density)</span>
                <span>{editState.watermarkTileCount ?? 3}x{editState.watermarkTileCount ?? 3}</span>
              </div>
              <input 
                type="range" 
                min="2" max="10" step="1"
                value={editState.watermarkTileCount ?? 3} 
                onChange={(e) => handleChange('watermarkTileCount', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>

            {/* Gap (Distance) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Gap (Distance)</span>
                <span>{editState.watermarkTileGap ?? 0}px</span>
              </div>
              <input 
                type="range" 
                min="0" max="200" step="10"
                value={editState.watermarkTileGap ?? 0} 
                onChange={(e) => handleChange('watermarkTileGap', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
              />
            </div>
          </div>
        )}

      </div>

      {/* --- COLOR PICKER --- */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
          Font Color
        </label>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <input 
              type="color" 
              value={editState.watermarkColor}
              onChange={(e) => handleChange('watermarkColor', e.target.value)}
              className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
            />
          </div>
          <div className="flex-1 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase">
            {editState.watermarkColor}
          </div>
        </div>
      </div>

      {/* --- POSITION GRID --- */}
      <div>
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
          Position
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'top-left', label: 'Top Left', icon: CornerUpLeft },
            { id: 'top-right', label: 'Top Right', icon: CornerUpRight },
            { id: 'center', label: 'Center', icon: Move },
            { id: 'bottom-left', label: 'Bot Left', icon: CornerDownLeft },
            { id: 'bottom-right', label: 'Bot Right', icon: CornerDownRight },
            { id: 'tile', label: 'Tile', icon: Grid3X3 },
          ].map((pos) => (
            <button
              key={pos.id}
              onClick={() => handleChange('watermarkPosition', pos.id)}
              className={`py-2 px-1 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-all
                ${editState.watermarkPosition === pos.id
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white'
                  : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
            >
              <pos.icon size={14} />
              {pos.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
} 