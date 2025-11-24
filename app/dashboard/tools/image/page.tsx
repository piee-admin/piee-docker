"use client";

import Link from "next/link";
import {
  ImageIcon,
  ArrowUpDown,
  Scissors,
  File,
  Maximize2,
  Trash2,
  Waves,
  FileText,
  Sparkles,
} from "lucide-react";

// Shadcn-like Card component
function Card({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: any;
  icon: any;
  title: any;
  description: any;
  badge?: any;
}) {
  return (
    <Link href={href}>
      <div className="group p-5 rounded-xl h-32 flex flex-col justify-center gap-2 border shadow-sm backdrop-blur-md transition-all duration-200
        bg-white border-gray-200 hover:border-gray-300 hover:shadow-md
        dark:bg-zinc-900/50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 dark:shadow-none"
      >
        
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors">
             <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-zinc-400 pl-[42px] -mt-1 line-clamp-1">{description}</p>

        {badge && (
          <span className="mt-1 ml-[42px] px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded w-fit
            bg-blue-100 text-blue-700 border border-blue-200
            dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
          >
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function ImageToolsPage() {
  const tools = [
    {
      title: "Compress Image",
      description: "Reduce image size without quality loss.",
      icon: ImageIcon,
      href: "/dashboard/tools/image/compress",
    },
    {
      title: "Resize Image",
      description: "Resize any image to desired dimensions.",
      icon: ArrowUpDown,
      href: "/dashboard/tools/image/resize",
    },
    {
      title: "Crop Image",
      description: "Cut and crop selected area of the image.",
      icon: Scissors,
      href: "/dashboard/tools/image/crop",
    },
    {
      title: "Convert From JPG",
      description: "Convert JPG to PNG, WEBP, SVG and more.",
      icon: File,
      href: "/dashboard/tools/image/convert",
    },
    {
      title: "Upscale Image",
      description: "Enhance and upscale image using AI.",
      icon: Maximize2,
      href: "/dashboard/tools/image/upscale",
      badge: "AI",
    },
    {
      title: "Remove Background",
      description: "AI tool to remove background cleanly.",
      icon: Trash2,
      href: "/dashboard/tools/image/remove-bg",
      badge: "AI",
    },
    {
      title: "Watermark Image",
      description: "Add text or image watermark easily.",
      icon: Waves,
      href: "/dashboard/tools/image/watermark",
    },
    {
      title: "Image Filter Studio",
      description: "Apply filters and adjust colors.",
      icon: Sparkles,
      href: "/dashboard/tools/image/filter",
    },
    {
      title: "Image to PDF",
      description: "Convert multiple images into a single PDF.",
      icon: FileText,
      href: "/dashboard/tools/image/to-pdf",
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-[#09090b] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Image Tools</h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-8">Select a tool to start processing your images.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[140px]">
          {tools.map((tool, i) => (
            <Card key={i} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
}