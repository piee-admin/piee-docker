"use client";

import React, { useState, useRef, useMemo } from "react";
import { 
  QrCode, 
  Download, 
  Link, 
  Type, 
  Wifi, 
  Mail, 
  Image as ImageIcon, 
  RotateCcw, 
  Check,
  Settings2
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type QRType = "url" | "text" | "wifi" | "email";

export default function QRCodeGenerator() {
  const [qrType, setQrType] = useState<QRType>("url");
  
  // Inputs State
  const [url, setUrl] = useState("https://example.com");
  const [text, setText] = useState("Hello World");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  
  // Style State - Updated Defaults: Black Foreground, White Background
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(40); // px

  const qrRef = useRef<HTMLCanvasElement>(null);

  // --- DERIVED CONTENT (Single Source of Truth) ---
  const qrContent = useMemo(() => {
    switch (qrType) {
      case "url":
        return url;
      case "text":
        return text;
      case "wifi":
        // WIFI:T:WPA;S:MyNetwork;P:mypassword;;
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPass};;`;
      case "email":
        // mailto:email@example.com?subject=Hello
        return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
      default:
        return "";
    }
  }, [qrType, url, text, wifiSsid, wifiPass, wifiEncryption, email, subject]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode_${qrType}_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen px-4 sm:px-10 py-10 bg-[#09090b] text-white font-sans selection:bg-zinc-800">
      
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold tracking-tight text-white">QR Generator</h1>
        </div>
        <p className="text-zinc-400 mb-8 ml-11">Create custom, high-resolution QR codes instantly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ---------------- LEFT: CONFIGURATION (1/3) ---------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Type Selection */}
            <div className="p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex overflow-hidden">
                {[
                    { id: "url", icon: Link, label: "URL" },
                    { id: "text", icon: Type, label: "Text" },
                    { id: "wifi", icon: Wifi, label: "WiFi" },
                    { id: "email", icon: Mail, label: "Email" },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setQrType(item.id as QRType)}
                        className={`flex-1 flex flex-col items-center justify-center py-4 gap-2 transition-all duration-200
                            ${qrType === item.id 
                                ? "bg-zinc-800 text-white shadow-sm" 
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Content Inputs */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Settings2 className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Content</h3>
                </div>

                {qrType === "url" && (
                    <div>
                        <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Website URL</label>
                        <input 
                            type="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                        />
                    </div>
                )}

                {qrType === "text" && (
                    <div>
                        <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Plain Text</label>
                        <textarea 
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter your text here..."
                            className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors resize-none"
                        />
                    </div>
                )}

                {qrType === "wifi" && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Network Name (SSID)</label>
                            <input 
                                type="text" 
                                value={wifiSsid}
                                onChange={(e) => setWifiSsid(e.target.value)}
                                placeholder="MyHomeWiFi"
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Password</label>
                            <input 
                                type="text" 
                                value={wifiPass}
                                onChange={(e) => setWifiPass(e.target.value)}
                                placeholder="SecretPassword123"
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                        <div>
                             <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Encryption</label>
                             <select 
                                value={wifiEncryption}
                                onChange={(e) => setWifiEncryption(e.target.value)}
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none"
                             >
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">No Password</option>
                             </select>
                        </div>
                    </div>
                )}

                {qrType === "email" && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contact@company.com"
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1.5 block ml-1">Subject Line</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Inquiry about..."
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Design & Branding */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Design</h3>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-zinc-500 mb-2 block ml-1">Foreground</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-zinc-700 p-2 rounded-xl">
                            <input 
                                type="color" 
                                value={fgColor}
                                onChange={(e) => setFgColor(e.target.value)}
                                className="w-8 h-8 rounded bg-transparent cursor-pointer"
                            />
                            <span className="text-xs font-mono text-zinc-300 uppercase">{fgColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 mb-2 block ml-1">Background</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-zinc-700 p-2 rounded-xl">
                            <input 
                                type="color" 
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-8 h-8 rounded bg-transparent cursor-pointer"
                            />
                            <span className="text-xs font-mono text-zinc-300 uppercase">{bgColor}</span>
                        </div>
                    </div>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="text-xs text-zinc-500 mb-2 block ml-1">Center Logo (Optional)</label>
                    <div className="flex gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl cursor-pointer transition-colors bg-black/20 hover:bg-black/40">
                            <span className="text-xs text-zinc-400">Upload PNG/JPG</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                        {logoUrl && (
                            <button 
                                onClick={() => setLogoUrl(null)} 
                                className="p-3 bg-zinc-800 hover:bg-red-900/20 border border-zinc-700 hover:border-red-900/50 rounded-xl text-zinc-400 hover:text-red-400 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Logo Size Slider */}
                {logoUrl && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between mb-2">
                             <label className="text-xs text-zinc-500 ml-1">Logo Size</label>
                             <span className="text-xs text-white font-mono">{logoSize}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="20" 
                            max="60" 
                            value={logoSize} 
                            onChange={(e) => setLogoSize(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                )}

            </div>
          </div>

          {/* ---------------- RIGHT: PREVIEW (2/3) ---------------- */}
          <div className="lg:col-span-8 flex flex-col h-full">
             <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md flex-1 flex flex-col shadow-2xl relative">
                
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Check className="w-5 h-5 text-zinc-500" /> Live Preview
                    </h2>
                    <div className="bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                        <span className="text-xs text-zinc-400">Auto-Generated</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center bg-[#111] rounded-xl border border-zinc-800 relative overflow-hidden p-10">
                    {/* Dot Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>
                    
                    {/* THE QR CANVAS */}
                    <div className="relative p-4 bg-white rounded-xl shadow-2xl">
                        <QRCodeCanvas
                            ref={qrRef}
                            value={qrContent}
                            size={350}
                            bgColor={bgColor}
                            fgColor={fgColor}
                            level={"H"} // High error correction for logos
                            imageSettings={logoUrl ? {
                                src: logoUrl,
                                height: logoSize,
                                width: logoSize,
                                excavate: true,
                            } : undefined}
                        />
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mt-8 flex justify-between items-center border-t border-zinc-800 pt-6">
                    <div className="text-sm text-zinc-500">
                        Format: <span className="text-white font-medium">PNG (High-Res)</span>
                    </div>
                    <button
                        onClick={downloadQR}
                        className="py-4 px-8 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                        <Download className="w-5 h-5" /> Download QR Code
                    </button>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}