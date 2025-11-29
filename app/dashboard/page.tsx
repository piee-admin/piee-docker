"use client";

import React from "react";
import {
  Clock,
  Cloud,
  CheckCircle2,
  AlertCircle,
  User,
  MoreHorizontal,
  ArrowRight,
  Zap
} from "lucide-react";

const ActivityItem = ({ title, desc, time, icon: Icon }: any) => (
  <div className="flex gap-3 relative pl-4 pb-6 border-l border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-[#09090b]" />
    <div>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 leading-none mb-1">{title}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{desc}</p>
      <span className="text-[10px] text-zinc-400 font-mono">{time}</span>
    </div>
  </div>
);

export default function RightPanel() {
  return (
    <aside className="w-80 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col overflow-y-auto hidden xl:flex">
      
      {/* Header */}
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Status</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Operational</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Storage Widget */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Storage
            </h3>
            <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Upgrade</button>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">75%</span>
              <span className="text-xs text-zinc-500">45.2 GB / 60 GB</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-900 dark:bg-white w-3/4 rounded-full" />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Activity
            </h3>
          </div>
          <div className="space-y-1 pt-2">
            <ActivityItem 
              title="Project Exported" 
              desc="Marketing Reel v2.mp4" 
              time="2 mins ago" 
            />
            <ActivityItem 
              title="New Asset" 
              desc="logo-transparent.png" 
              time="1 hour ago" 
            />
            <ActivityItem 
              title="Plan Updated" 
              desc="Upgraded to Pro Tier" 
              time="1 day ago" 
            />
            <ActivityItem 
              title="Team Invite" 
              desc="Invited sarah@design.co" 
              time="2 days ago" 
            />
          </div>
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4" /> Team
            </h3>
            <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
              <PlusIcon className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {[1,2,3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-black bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-black bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs font-medium text-zinc-500 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
              +2
            </div>
          </div>
        </div>

        {/* Quick Action Promo */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-black shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <Zap className="w-5 h-5" />
            <button className="opacity-50 hover:opacity-100 transition-opacity"><CheckCircle2 className="w-4 h-4" /></button>
          </div>
          <h4 className="font-bold text-sm mb-1">Pro Tips</h4>
          <p className="text-xs opacity-80 mb-3">Use <code className="bg-white/20 dark:bg-black/10 px-1 rounded">Cmd+K</code> to open the command palette instantly.</p>
        </div>

      </div>
    </aside>
  );
}

const PlusIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
)