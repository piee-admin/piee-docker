"use client";

import React from "react";
import {
  Search,
  Bell,
  Zap,
  Cloud,
  Folder,
  TrendingUp,
  MoreHorizontal,
  ArrowUpRight,
  FileImage,
  Video,
  Code,
  Package,
  ArrowDownRight
} from "lucide-react";

// --- Components ---

const StatCard = ({ title, value, trend, trendLabel, icon: Icon }: any) => (
  <div className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 hover:shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 transition-transform group-hover:scale-105">
        <Icon className="w-5 h-5" />
      </div>
      {/* Decorative subtle patch */}
      <div className="w-16 h-16 absolute top-0 right-0 bg-zinc-50 dark:bg-zinc-800/30 rounded-bl-full -mr-4 -mt-4 transition-opacity opacity-0 group-hover:opacity-100" />
    </div>
    
    <div className="relative z-10">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">{value}</h3>
      
      <div className="flex items-center gap-2 text-xs">
        <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium
          ${parseFloat(trend) > 0 
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" 
            : "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"}`}
        >
          {parseFloat(trend) > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
        <span className="text-zinc-400 dark:text-zinc-600">{trendLabel}</span>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ title, category, time, icon: Icon }: any) => (
  <div className="group cursor-pointer flex flex-col h-full">
    {/* Thumbnail Area - Replaces colored blocks with neutral aesthetic */}
    <div className="relative w-full aspect-[16/10] rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-4 flex items-center justify-center transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-600">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      </div>
      
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-7 h-7 text-zinc-700 dark:text-zinc-300" />
      </div>
    </div>

    {/* Content */}
    <div className="flex justify-between items-start flex-1">
      <div className="space-y-1">
        <h4 className="font-semibold text-zinc-900 dark:text-white text-sm leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {title}
        </h4>
        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 gap-2">
          <span>{category}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span>{time}</span>
        </div>
      </div>
      <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function Overview() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Overview</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-200 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all text-sm placeholder:text-zinc-400"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rounded-full border-2 border-white dark:border-zinc-900"></span>
            </button>
          </div>
        </header>

        {/* --- Stats Grid --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Credits" 
            value="2,450" 
            trend="+12.5%" 
            trendLabel="vs last month"
            icon={Zap} 
          />
          <StatCard 
            title="Storage Used" 
            value="45.2 GB" 
            trend="+5.2%" 
            trendLabel="vs last month"
            icon={Cloud} 
          />
          <StatCard 
            title="Active Projects" 
            value="12" 
            trend="-2.1%" 
            trendLabel="vs last month"
            icon={Folder} 
          />
          <StatCard 
            title="Total Exports" 
            value="892" 
            trend="+18.2%" 
            trendLabel="vs last month"
            icon={TrendingUp} 
          />
        </section>

        {/* --- Recent Projects Section --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Projects</h2>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProjectCard 
              title="Product Shoot v2" 
              category="Image Processing" 
              time="2 hours ago" 
              icon={FileImage} 
            />
            <ProjectCard 
              title="Marketing Reel" 
              category="Video Editor" 
              time="5 hours ago" 
              icon={Video} 
            />
            <ProjectCard 
              title="API Integration" 
              category="Code Formatter" 
              time="1 day ago" 
              icon={Code} 
            />
            <ProjectCard 
              title="Logo Brand Kit" 
              category="Image Toolkit" 
              time="2 days ago" 
              icon={Package} 
            />
          </div>
        </section>

      </div>
    </div>
  );
}