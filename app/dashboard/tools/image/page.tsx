"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ImageIcon,
  ArrowUpDown,
  Scissors,
  File,
  FileImage,
  Maximize2,
  Trash2,
  Waves,
  Star,
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
      <div className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10 shadow-xl backdrop-blur-md 
        h-32 flex flex-col justify-center gap-2">
        
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <p className="text-sm text-white/60 pl-8 -mt-1">{description}</p>

        {badge && (
          <span className="mt-1 ml-8 px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300 w-fit">
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
      description: "Filter you Image ",
      icon: Waves,
      href: "/dashboard/tools/image/filter",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Image Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[130px]">

        {tools.map((tool, i) => (
          <Card key={i} {...tool} />
        ))}
      </div>
    </div>
  );
}
