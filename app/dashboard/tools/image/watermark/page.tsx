"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Type, Image as ImageIcon, RotateCw, Grid, Droplets } from "lucide-react";

export default function ImageWatermark() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState<string | null>(null);

  // Watermark Type
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  // --- TEXT WATERMARK SETTINGS ---
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState<"topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center" | "tile">("bottomRight");
  const [tileGap, setTileGap] = useState(50);
  
  // --- IMAGE WATERMARK SETTINGS ---
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null);
  const [imageWatermarkSize, setImageWatermarkSize] = useState(0.2);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const drawWatermark = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;

    if (!canvas || !ctx || !img || !originalImageUrl) {
      setWatermarkedImageUrl(null);
      return;
    }

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // --- TEXT WATERMARK ---
    if (watermarkType === "text" && text) {
        ctx.save(); // Save state before applying opacity
        ctx.globalAlpha = opacity;
        ctx.fillStyle = fontColor;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const drawSingleText = (x: number, y: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        };

        if (position === "tile") {
            const textWidthApprox = ctx.measureText(text).width;
            const textHeightApprox = fontSize * 1.5;
            const diagonalLength = Math.sqrt(textWidthApprox * textWidthApprox + textHeightApprox * textHeightApprox);
            const stepX = diagonalLength * Math.abs(Math.cos((rotation * Math.PI) / 180)) + tileGap;
            const stepY = diagonalLength * Math.abs(Math.sin((rotation * Math.PI) / 180)) + tileGap;

            const startX = -Math.max(canvas.width, canvas.height) / 2;
            const startY = -Math.max(canvas.width, canvas.height) / 2;
            
            for (let y = startY; y < canvas.height * 1.5; y += stepY) {
                for (let x = startX; x < canvas.width * 1.5; x += stepX) {
                    drawSingleText(x, y);
                }
            }
        } else {
            let x = 0, y = 0;
            const padding = 40; // Increased padding for better look

            switch (position) {
                case "topLeft":     x = padding; y = padding; ctx.textAlign = "left"; ctx.textBaseline = "top"; break;
                case "topRight":    x = canvas.width - padding; y = padding; ctx.textAlign = "right"; ctx.textBaseline = "top"; break;
                case "bottomLeft":  x = padding; y = canvas.height - padding; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; break;
                case "bottomRight": x = canvas.width - padding; y = canvas.height - padding; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; break;
                case "center":      x = canvas.width / 2; y = canvas.height / 2; ctx.textAlign = "center"; ctx.textBaseline = "middle"; break;
            }
            drawSingleText(x, y);
        }
        ctx.restore(); // Restore opacity
    } 
    // --- IMAGE WATERMARK ---
    else if (watermarkType === "image" && watermarkImageUrl && watermarkImageFile) {
        const wmImg = new Image();
        wmImg.src = watermarkImageUrl;
        wmImg.onload = () => {
            // Redraw background because image loading is async
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            ctx.save(); // Save state
            ctx.globalAlpha = opacity;

            let wmWidth = img.naturalWidth * imageWatermarkSize;
            let wmHeight = (wmImg.naturalHeight / wmImg.naturalWidth) * wmWidth;

            if (wmWidth > canvas.width || wmHeight > canvas.height) {
                const scaleFactor = Math.min(canvas.width / wmWidth, canvas.height / wmHeight) * 0.9;
                wmWidth *= scaleFactor;
                wmHeight *= scaleFactor;
            }

            const drawSingleImage = (x: number, y: number) => {
                ctx.save();
                ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
                ctx.restore();
            };

            if (position === "tile") {
                 const stepX = wmWidth + tileGap;
                 const stepY = wmHeight + tileGap;
                 const startX = -canvas.width;
                 const startY = -canvas.height;

                for (let y = startY; y < canvas.height * 2; y += stepY) {
                    for (let x = startX; x < canvas.width * 2; x += stepX) {
                        drawSingleImage(x, y);
                    }
                }
            } else {
                let x = 0, y = 0;
                const padding = 40;

                switch (position) {
                    case "topLeft":     x = padding; y = padding; break;
                    case "topRight":    x = canvas.width - wmWidth - padding; y = padding; break;
                    case "bottomLeft":  x = padding; y = canvas.height - wmHeight - padding; break;
                    case "bottomRight": x = canvas.width - wmWidth - padding; y = canvas.height - wmHeight - padding; break;
                    case "center":      x = (canvas.width - wmWidth) / 2; y = (canvas.height - wmHeight) / 2; break;
                }
                drawSingleImage(x, y);
            }
            ctx.restore(); // Restore opacity
            setWatermarkedImageUrl(canvas.toDataURL("image/png"));
        };
    } else {
        setWatermarkedImageUrl(canvas.toDataURL("image/png"));
    }
  }, [originalImageUrl, watermarkType, text, fontSize, fontColor, opacity, rotation, position, watermarkImageUrl, watermarkImageFile, imageWatermarkSize, tileGap]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        if (originalImageUrl) {
            drawWatermark();
        }
    }, 200); 
    return () => clearTimeout(debounceTimer);
  }, [drawWatermark, originalImageUrl, text, fontSize, fontColor, opacity, rotation, position, watermarkType, watermarkImageUrl, imageWatermarkSize, tileGap]);


  const handleOriginalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setWatermarkedImageUrl(null); 
  };

  const handleWatermarkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWatermarkImageFile(file);
    setWatermarkImageUrl(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Removed Purple Gradient, purely dark background now */}
      
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-white">Image Watermark</h1>
        </div>
        <p className="text-zinc-400 mb-8 ml-11">Protect your images with custom watermarks.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONTROLS ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Original Image Upload */}
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-zinc-700 rounded-xl bg-black/20 cursor-pointer hover:bg-zinc-800/50 transition group">
                {!originalImageFile ? (
                    <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-zinc-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-zinc-400">Upload Original Image</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-4 w-full">
                        <img src={originalImageUrl!} className="w-14 h-14 rounded bg-black object-contain border border-zinc-700" />
                        <div className="overflow-hidden text-left flex-1">
                             <p className="text-sm font-medium truncate text-white">{originalImageFile.name}</p>
                             <p className="text-xs text-zinc-500">Ready</p>
                        </div>
                        <div className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">Change</div>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleOriginalImageChange} />
              </label>
            </div>

            {/* Watermark Type Selector */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Watermark Type</p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setWatermarkType("text")}
                        className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1
                            ${watermarkType === "text" ? 'bg-white text-black border-white shadow-sm' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                    >   
                        <Type className="w-4 h-4" />
                        <span>Text</span>
                    </button>
                    <button
                        onClick={() => setWatermarkType("image")}
                        className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1
                            ${watermarkType === "image" ? 'bg-white text-black border-white shadow-sm' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                    >   
                        <ImageIcon className="w-4 h-4" />
                        <span>Image / Logo</span>
                    </button>
                </div>
            </div>

            {/* Settings */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md space-y-6">
                
                {watermarkType === "text" && (
                    <>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Watermark Text</label>
                            <input 
                                type="text" 
                                value={text} 
                                onChange={(e) => setText(e.target.value)}
                                disabled={!originalImageFile}
                                className="w-full bg-black/40 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                                placeholder="Enter text..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Font Size</label>
                                <span className="text-white font-mono text-xs">{fontSize}px</span>
                            </div>
                            <input 
                                type="range" min="10" max="200" step="1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                                disabled={!originalImageFile}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Font Color</label>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)}
                                    disabled={!originalImageFile}
                                    className="h-10 w-14 bg-black/20 border border-zinc-700 rounded-lg p-1 cursor-pointer"
                                />
                                <span className="text-xs text-zinc-400 font-mono uppercase">{fontColor}</span>
                            </div>
                        </div>
                    </>
                )}

                {watermarkType === "image" && (
                    <>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Watermark Image</label>
                            <input 
                                type="file" accept="image/*" onChange={handleWatermarkImageChange} disabled={!originalImageFile}
                                className="file:bg-zinc-800 file:text-zinc-300 file:border-zinc-700 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:hover:cursor-pointer hover:cursor-pointer text-xs text-zinc-500 w-full border border-zinc-700 rounded-lg py-2 px-1"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Size</label>
                                <span className="text-white font-mono text-xs">{Math.round(imageWatermarkSize * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0.05" max="0.5" step="0.01" value={imageWatermarkSize} onChange={(e) => setImageWatermarkSize(Number(e.target.value))}
                                disabled={!originalImageFile || !watermarkImageUrl}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                            />
                        </div>
                    </>
                )}

                {/* Common Settings */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Droplets className="w-3 h-3" /> Opacity
                        </label>
                        <span className="text-white font-mono text-xs">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0.01" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}
                        disabled={!originalImageFile}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                    />
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <RotateCw className="w-3 h-3" /> Rotation
                        </label>
                        <span className="text-white font-mono text-xs">{rotation}°</span>
                    </div>
                    <input 
                        type="range" min="-90" max="90" step="1" value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
                        disabled={!originalImageFile}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                    />
                </div>

                {/* Position */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { key: "topLeft", label: "Top Left" }, { key: "topRight", label: "Top Right" }, { key: "center", label: "Center" },
                            { key: "bottomLeft", label: "Bot Left" }, { key: "bottomRight", label: "Bot Right" }, { key: "tile", label: "Tile" },
                        ].map((pos) => (
                            <button
                                key={pos.key}
                                onClick={() => setPosition(pos.key as any)}
                                disabled={!originalImageFile}
                                className={`py-2 rounded-lg border text-xs font-medium transition-all 
                                    ${position === pos.key ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >   
                                {pos.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tile Gap */}
                {position === "tile" && (
                    <div>
                        <div className="flex justify-between mb-2 mt-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Grid className="w-3 h-3" /> Tile Gap
                            </label>
                            <span className="text-white font-mono text-xs">{tileGap}px</span>
                        </div>
                        <input 
                            type="range" min="0" max="200" step="10" value={tileGap} onChange={(e) => setTileGap(Number(e.target.value))}
                            disabled={!originalImageFile}
                            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                        />
                    </div>
                )}
            </div>
          </div>

          {/* ---------------- RIGHT: PREVIEW ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md flex-1 flex flex-col shadow-2xl relative">
                
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        Live Preview
                    </h2>
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#050505] rounded-xl border border-zinc-800 min-h-[500px]">
                    {/* Transparency Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>

                    {!originalImageUrl ? (
                        <div className="text-center opacity-30 z-10 space-y-3">
                             <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto border border-zinc-700">
                                <ImageIcon className="w-8 h-8 text-zinc-400" />
                             </div>
                             <p className="text-zinc-400">Upload an image to start</p>
                        </div>
                    ) : (
                        <>
                            <img ref={imgRef} src={originalImageUrl} alt="Original" className="hidden" onLoad={drawWatermark} />
                            <canvas ref={canvasRef} className="relative z-10 max-w-full max-h-[600px] object-contain shadow-2xl" />
                        </>
                    )}
                </div>

                {watermarkedImageUrl && (
                    <div className="mt-6 flex justify-end animate-in slide-in-from-bottom-2">
                        <a
                            href={watermarkedImageUrl}
                            download={`watermarked_${originalImageFile?.name.split('.')[0]}.png`}
                            className="w-full sm:w-auto py-3 px-8 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Download className="w-5 h-5" /> 
                            Download Result
                        </a>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}