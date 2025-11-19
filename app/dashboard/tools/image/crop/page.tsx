"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  PercentCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
// Import icons for the aspect ratios
import { 
  Scan, 
  Instagram, 
  Youtube, 
  Smartphone, 
  Twitter, 
  Monitor, 
  Layout, 
  Image as ImageIcon 
} from "lucide-react";

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
        width: crop?.width || 0,
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
    <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Controls Column (Left) */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border border-primary/20 shadow-lg sticky top-6">
          <CardHeader>
            <CardTitle className="text-primary">Crop Controls</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:cursor-pointer hover:cursor-pointer text-sm text-muted-foreground w-full"
            />

            {/* Aspect Ratio Controls (Updated 2-col grid) */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ratio, idx) => {
                  const Icon = ratio.icon;
                  const isActive = aspect === ratio.value;
                  return (
                    <Button
                      key={idx}
                      variant={isActive ? "default" : "outline"}
                      onClick={() => handleAspectChange(ratio.value)}
                      className={`h-auto py-3 px-3 flex flex-col items-start justify-center gap-1 text-left ${isActive ? "bg-primary/10 border-primary text-primary hover:bg-primary/20" : "hover:bg-muted"}`}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <Icon className="w-4 h-4 opacity-70" />
                            <span className="font-bold text-sm">{ratio.label}</span>
                        </div>
                        <span className="text-[10px] opacity-60 font-normal truncate w-full">{ratio.desc}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Manual Dimensions Inputs */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Dimensions (px)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                    W
                  </span>
                  <input
                    type="number"
                    value={manualWidth}
                    onChange={onManualWidthChange}
                    disabled={!imgSrc}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                    H
                  </span>
                  <input
                    type="number"
                    value={manualHeight}
                    onChange={onManualHeightChange}
                    disabled={!imgSrc}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={createCroppedImage}
              className="w-full py-6 text-lg font-semibold shadow-md transition-all hover:scale-[1.02]"
              disabled={!imgSrc}
            >
              Generate Crop
            </Button>
          </CardContent>
        </Card>
        
        {/* Result Preview */}
        {croppedImage && (
        <div className="border border-primary/20 shadow-lg rounded-xl p-6 bg-card animate-in slide-in-from-top-4">
          <p className="font-semibold mb-4 text-primary">Result Preview</p>
          <div className="flex flex-col items-center gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
            <img
              src={croppedImage}
              className="rounded-lg shadow-sm max-h-[300px] object-contain"
              alt="Cropped Output"
            />
            <Button asChild className="w-full">
              <a
                href={croppedImage}
                download={`cropped-image-${Date.now()}.png`}
              >
                Download Result
              </a>
            </Button>
          </div>
        </div>
      )}
      </div>

      {/* Workspace (Right) */}
      <div className="lg:col-span-8 flex flex-col h-full">
        <div className="flex-1 flex justify-center items-center border-2 border-dashed rounded-2xl p-8 bg-muted/10 min-h-[600px] relative overflow-hidden">
          {imgSrc ? (
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
          ) : (
            <div className="flex flex-col items-center text-muted-foreground/50">
                <div className="w-20 h-20 border-2 border-dashed border-current rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-4xl">+</span>
                </div>
                <p className="text-xl font-medium">Upload an image to start cropping</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}