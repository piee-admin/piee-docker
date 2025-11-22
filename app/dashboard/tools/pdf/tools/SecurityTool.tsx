"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Lock, Unlock, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

interface SecurityToolProps {
  pdfBytes: Uint8Array | null;
  onUpdatePdf: (bytes: Uint8Array) => void;
}

export default function SecurityTool({ pdfBytes, onUpdatePdf }: SecurityToolProps) {
  const [mode, setMode] = useState<"protect" | "unlock">("protect");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  const handleEncrypt = async () => {
    if (!pdfBytes || !password) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Check if the encrypt method exists at runtime to prevent crashing
      // @ts-ignore
      if (typeof pdfDoc.encrypt !== 'function') {
        alert("Error: The 'encrypt' function is missing from pdf-lib. Please restart your server to ensure the latest version (1.17.1+) is loaded.");
        setIsProcessing(false);
        return;
      }

      // Fix: Cast to 'any' to bypass TypeScript definition mismatch
      (pdfDoc as any).encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: allowPrinting ? 'highResolution' : undefined,
          copying: allowCopying,
          modifying: allowModifying,
          fillingForms: allowModifying,
          annotating: allowModifying,
          contentAccessibility: allowCopying,
        },
      });

      const protectedPdfBytes = await pdfDoc.save();
      onUpdatePdf(protectedPdfBytes);
      alert("PDF Encrypted Successfully! The preview might require a password now.");
    } catch (err) {
      console.error(err);
      alert("Failed to encrypt PDF. It might already be encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!pdfBytes || !password) return;
    setIsProcessing(true);

    try {
      // Fix: Cast options to 'any' to allow the 'password' property which might be missing in older TS definitions
      const pdfDoc = await PDFDocument.load(pdfBytes, { password } as any);
      
      // Saving without calling encrypt() removes the security
      const unprotectedPdfBytes = await pdfDoc.save();
      
      onUpdatePdf(unprotectedPdfBytes);
      alert("Security Removed Successfully!");
    } catch (err) {
      console.error(err);
      alert("Incorrect password or file structure.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white dark:bg-zinc-900 shadow-xl border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right-4">
      
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Shield className="w-5 h-5 text-zinc-900 dark:text-white" />
        <h2 className="font-bold text-lg text-zinc-900 dark:text-white">Security Manager</h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-6">
        <button
          onClick={() => setMode("protect")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all
            ${mode === "protect" 
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
        >
          <Lock className="w-4 h-4" /> Protect
        </button>
        <button
          onClick={() => setMode("unlock")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all
            ${mode === "unlock" 
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
        >
          <Unlock className="w-4 h-4" /> Unlock
        </button>
      </div>

      {/* PROTECT MODE */}
      {mode === "protect" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Set Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm"
                placeholder="Enter strong password"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Permissions</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${allowPrinting ? "bg-black border-black dark:bg-white dark:border-white" : "border-zinc-300"}`}>
                  {allowPrinting && <CheckCircle2 size={12} className="text-white dark:text-black" />}
                </div>
                <input type="checkbox" checked={allowPrinting} onChange={(e) => setAllowPrinting(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium">Allow Printing</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${allowCopying ? "bg-black border-black dark:bg-white dark:border-white" : "border-zinc-300"}`}>
                  {allowCopying && <CheckCircle2 size={12} className="text-white dark:text-black" />}
                </div>
                <input type="checkbox" checked={allowCopying} onChange={(e) => setAllowCopying(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium">Allow Copying Text</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${allowModifying ? "bg-black border-black dark:bg-white dark:border-white" : "border-zinc-300"}`}>
                  {allowModifying && <CheckCircle2 size={12} className="text-white dark:text-black" />}
                </div>
                <input type="checkbox" checked={allowModifying} onChange={(e) => setAllowModifying(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium">Allow Modifying</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleEncrypt}
            disabled={!password || isProcessing}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? "Encrypting..." : "Apply Encryption"}
          </button>
        </div>
      )}

      {/* UNLOCK MODE */}
      {mode === "unlock" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <h3 className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-sm mb-1">
              <AlertCircle size={16} /> Decryption Mode
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              If the current document is password protected, enter the password below to permanently remove security restrictions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm"
                placeholder="Enter original password"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={!password || isProcessing}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? "Unlocking..." : "Remove Security"}
          </button>
        </div>
      )}

    </div>
  );
}