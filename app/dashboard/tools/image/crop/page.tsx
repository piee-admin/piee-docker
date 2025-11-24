"use client";

import React, { useState, useRef } from "react";
import { 
  Scan, 
  Instagram, 
  Youtube, 
  Smartphone, 
  Twitter, 
  Monitor, 
  Layout, 
  Image as ImageIcon,
  Crop as CropIcon,
  Download
} from "lucide-react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  PercentCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Helper to center the crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function CropImageTool() {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Manual Inputs
  const [manualWidth, setManualWidth] = useState<number>(0);
  const [manualHeight, setManualHeight] = useState<number>(0);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  const imgRef = useRef<HTMLImageElement>(null);

  // --- ASPECT RATIO CONFIGURATION ---
  const aspectRatios = [
    { label: "Free", value: undefined, icon: Scan, desc: "Custom" },
    { label: "1:1", value: 1, icon: Instagram, desc: "Instagram Post" },
    { label: "16:9", value: 16 / 9, icon: Youtube, desc: "YouTube Video" },
    { label: "9:16", value: 9 / 16, icon: Smartphone, desc: "TikTok / Reels" },
    { label: "4:5", value: 4 / 5, icon: ImageIcon, desc: "Insta Portrait" },
    { label: "2:1", value: 2 / 1, icon: Twitter, desc: "Twitter Card" },
    { label: "3:4", value: 3 / 4, icon: Layout, desc: "Pinterest / FB" },
    { label: "4:3", value: 4 / 3, icon: Monitor, desc: "Standard / Web" },
  ];

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      setCompletedCrop(undefined); 
      setCroppedImage(null);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;

    const scaleX = naturalWidth / width;
    const scaleY = naturalHeight / height;
    setScale({ x: scaleX, y: scaleY });

    let newCrop: Crop;
    if (aspect) {
      newCrop = centerAspectCrop(width, height, aspect);
    } else {
      newCrop = { unit: "%", width: 50, height: 50, x: 25, y: 25 };
    }

    setCrop(newCrop);
    const pixelCrop = convertToPixelCrop(newCrop, width, height);
    setCompletedCrop(pixelCrop);
    setManualWidth(Math.round(pixelCrop.width * scaleX));
    setManualHeight(Math.round(pixelCrop.height * scaleY));
  };

  const handleCropChange = (c: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(c);
    setCompletedCrop(c);

    if (scale.x && scale.y) {
      setManualWidth(Math.round(c.width * scale.x));
      setManualHeight(Math.round(c.height * scale.y));
    }
  };

  const onManualWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setManualWidth(val);
    setAspect(undefined);

    if (imgRef.current && scale.x) {
      const newWidth = val / scale.x;
      const newCropState = {
        ...crop,
        unit: "px" as const,
        width: newWidth,
        x: crop?.x || 0,
        y: crop?.y || 0,
        height: crop?.height || 0,
      };
      setCrop(newCropState);
      setCompletedCrop(newCropState as PixelCrop);
    }
  };

  const onManualHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setManualHeight(val);
    setAspect(undefined);

    if (imgRef.current && scale.y) {
      const newHeight = val / scale.y;
      const newCropState = {
        ...crop,
        unit: "px" as const,
        height: newHeight,
        x: crop?.x || 0,
        y: crop?.y || 0,
        width: crop?.width || 0, // Fixed: removed duplicate key and corrected variable
      };
      setCrop(newCropState);
      setCompletedCrop(newCropState as PixelCrop);
    }
  };

  const handleAspectChange = (val: number | undefined) => {
    setAspect(val);
    if (imgRef.current && val) {
      const { width, height } = imgRef.current;
      const newCrop = centerAspectCrop(width, height, val);

      setCrop(newCrop);
      const pixelCrop = convertToPixelCrop(newCrop, width, height);
      setCompletedCrop(pixelCrop);

      if (scale.x && scale.y) {
        setManualWidth(Math.round(pixelCrop.width * scale.x));
        setManualHeight(Math.round(pixelCrop.height * scale.y));
      }
    }
  };

  const createCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const base64Image = canvas.toDataURL("image/png");
    setCroppedImage(base64Image);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-zinc-800 transition-colors duration-300">
      
      <div className="max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
            <CropIcon className="w-8 h-8 text-black dark:text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Crop Tool</h1>
        </div>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 ml-11">Resize and crop images for social media.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
          {/* Controls Column (Left) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="p-5 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="w-full text-sm text-gray-500 dark:text-zinc-400 
                file:mr-4 file:py-2 file:px-4 
                file:rounded-full file:border-0 
                file:text-xs file:font-medium 
                file:bg-gray-100 dark:file:bg-zinc-800 file:text-gray-700 dark:file:text-zinc-300 
                hover:file:bg-gray-200 dark:hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>

            {/* Aspect Ratio Controls */}
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm backdrop-blur-md space-y-4 transition-colors">
              <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ratio, idx) => {
                  const Icon = ratio.icon;
                  const isActive = aspect === ratio.value;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAspectChange(ratio.value)}
                      className={`h-auto py-3 px-3 flex flex-col items-start justify-center gap-1 text-left rounded-xl border transition-all duration-200
                        ${isActive 
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md" 
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        }`}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-50"}`} />
                            <span className="font-bold text-sm">{ratio.label}</span>
                        </div>
                        <span className={`text-[10px] font-normal truncate w-full ${isActive ? "text-gray-300 dark:text-zinc-500" : "text-gray-400 dark:text-zinc-600"}`}>
                            {ratio.desc}
                        </span>
                    </button>
                  );
                })}
              </div>

              {/* Manual Dimensions Inputs */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4">
                <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3">Dimensions (px)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xs font-bold">W</span>
                    <input
                      type="number"
                      value={manualWidth}
                      onChange={onManualWidthChange}
                      disabled={!imgSrc}
                      className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/40 px-3 pl-8 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-xs font-bold">H</span>
                    <input
                      type="number"
                      value={manualHeight}
                      onChange={onManualHeightChange}
                      disabled={!imgSrc}
                      className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/40 px-3 pl-8 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={createCroppedImage}
                className="w-full py-4 mt-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!imgSrc}
              >
                Generate Crop
              </button>
            </div>
            
            {/* Result Preview */}
            {croppedImage && (
            <div className="border border-gray-200 dark:border-zinc-800 shadow-xl rounded-2xl p-6 bg-white dark:bg-zinc-900/50 backdrop-blur-md animate-in slide-in-from-top-4 transition-colors">
              <p className="font-bold mb-4 text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-400 dark:text-zinc-400"/> Result Preview
              </p>
              <div className="flex flex-col items-center gap-4 bg-gray-100 dark:bg-black/40 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 border-dashed">
                <img
                  src={croppedImage}
                  className="rounded-lg shadow-2xl max-h-[300px] object-contain"
                  alt="Cropped Output"
                />
                <a
                    href={croppedImage}
                    download={`cropped-image-${Date.now()}.png`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all text-sm"
                >
                    <Download className="w-4 h-4" />
                    Download Result
                </a>
              </div>
            </div>
          )}
          </div>

          {/* Workspace (Right) */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="flex-1 flex justify-center items-center border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 bg-gray-100 dark:bg-[#050505] min-h-[600px] relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
              
               {/* Dot Grid Background */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
               </div>

              {imgSrc ? (
                <div className="relative z-10">
                    <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    aspect={aspect}
                    className="max-h-[75vh]"
                    >
                    <img
                        ref={imgRef}
                        src={imgSrc}
                        alt="Upload"
                        onLoad={onImageLoad}
                        className="max-w-full max-h-[75vh] object-contain shadow-2xl"
                    />
                    </ReactCrop>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500 dark:text-zinc-600 z-10">
                    <div className="w-24 h-24 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-2xl mb-4 flex items-center justify-center">
                        <CropIcon className="w-10 h-10 opacity-30 dark:opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-gray-500 dark:text-zinc-500">Upload an image to start cropping</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}