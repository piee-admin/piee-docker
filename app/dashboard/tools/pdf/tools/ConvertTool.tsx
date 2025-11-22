import React, { useState } from "react";
import { pdfjs } from "react-pdf";
import JSZip from "jszip";
import { 
  FileText, Table, Image as ImageIcon, FileJson, 
  Loader2, CheckCircle, Download, Archive 
} from "lucide-react";
import { motion } from "framer-motion";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ToolProps {
  pdfBytes: Uint8Array | ArrayBuffer | null;
  onUpdatePdf: (bytes: Uint8Array) => void;
}

type ConvertFormat = "word" | "excel" | "jpg" | "json";

export default function ConvertTool({ pdfBytes }: ToolProps) {
  const [step, setStep] = useState<"select" | "processing" | "done">("select");
  const [targetFormat, setTargetFormat] = useState<ConvertFormat | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [finalExtension, setFinalExtension] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const handleConvert = async (format: ConvertFormat) => {
    if (!pdfBytes) return;
    setTargetFormat(format);
    setStep("processing");
    setProgress(0);

    try {
      const loadingTask = pdfjs.getDocument(new Uint8Array(pdfBytes as ArrayBuffer));
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      setPageCount(numPages);

      // --- 1. HIGH FIDELITY WORD CONVERSION ---
      if (format === "word") {
        // We build an HTML structure that uses ABSOLUTE POSITIONING
        // This forces Word to respect the exact X/Y coordinates of the PDF
        let htmlBody = "";

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 }); // 1:1 scale for Word
          const textContent = await page.getTextContent();
          
          // Create a page container matching PDF dimensions
          let pageHtml = `<div style="position:relative; width:${viewport.width}px; height:${viewport.height}px; page-break-after:always; margin:0 auto; background:white;">`;

          // Loop through every text item and place it exactly where it belongs
          for (const item of textContent.items as any[]) {
            // PDF uses bottom-left as (0,0), HTML uses top-left. We must flip Y.
            // item.transform is [scaleX, skewY, skewX, scaleY, x, y]
            const tx = item.transform;
            const x = tx[4]; 
            const y = viewport.height - tx[5]; // Flip coordinate system
            const fontSize = Math.sqrt(tx[0] * tx[3]); // Approximate font size
            const text = item.str.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Escape HTML
            
            // Add absolute positioned div
            if (text.trim().length > 0) {
               pageHtml += `<div style="position:absolute; left:${x}px; top:${y - fontSize}px; font-size:${fontSize}px; font-family:sans-serif; white-space:nowrap;">${text}</div>`;
            }
          }
          
          pageHtml += "</div>";
          htmlBody += pageHtml;
          setProgress(Math.round((i / numPages) * 100));
        }

        // Wrap in standard Office HTML header to ensure Word treats it correctly
        const fullHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
              <meta charset="utf-8">
              <title>Document</title>
              <style>body { margin: 0; padding: 0; background: #888; }</style>
            </head>
            <body>
              ${htmlBody}
            </body>
          </html>
        `;
        
        const blob = new Blob(['\ufeff', fullHtml], { type: "application/msword" });
        setDownloadUrl(URL.createObjectURL(blob));
        setFinalExtension("doc"); // .doc forces Word to open the HTML in "Print Layout" mode
      }

      // --- 2. PDF TO EXCEL (Grid Reconstruction) ---
      else if (format === "excel") {
        let csvContent = "";
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = textContent.items as any[];

          // Sort items by Y position (rows) then X position (columns)
          // This attempts to reconstruct the table structure visually
          items.sort((a, b) => {
             const yDiff = b.transform[5] - a.transform[5]; // Sort Y descending (top to bottom)
             if (Math.abs(yDiff) > 5) return yDiff; // If Y is significantly different, use Y
             return a.transform[4] - b.transform[4]; // Else sort X ascending (left to right)
          });

          let currentRowY = -1;
          let rowBuffer: string[] = [];

          items.forEach((item) => {
             const y = item.transform[5];
             // If this item is on a new visual line (approx 10px tolerance)
             if (Math.abs(y - currentRowY) > 10) {
                if (rowBuffer.length > 0) csvContent += rowBuffer.join(",") + "\n";
                rowBuffer = [];
                currentRowY = y;
             }
             // Clean text for CSV
             const safeText = `"${item.str.replace(/"/g, '""')}"`;
             rowBuffer.push(safeText);
          });
          // Add last row
          if (rowBuffer.length > 0) csvContent += rowBuffer.join(",") + "\n";

          setProgress(Math.round((i / numPages) * 100));
        }
        
        const blob = new Blob(['\ufeff', csvContent], { type: "text/csv;charset=utf-8;" });
        setDownloadUrl(URL.createObjectURL(blob));
        setFinalExtension("csv"); // CSV is the safest "Excel" format from browser
      }

      // --- 3. PDF TO IMAGES (ZIP) ---
      else if (format === "jpg") {
        const zip = new JSZip();
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport } as any).promise;
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            if (blob) zip.file(`page_${i}.jpg`, blob);
          }
          setProgress(Math.round((i / numPages) * 100));
        }
        const zipContent = await zip.generateAsync({ type: "blob" });
        setDownloadUrl(URL.createObjectURL(zipContent));
        setFinalExtension("zip");
      }

      // --- 4. JSON ---
      else {
         let fullText = [];
         for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText.push({ 
                page: i, 
                text: textContent.items.map((item: any) => item.str).join(" ") 
            });
            setProgress(Math.round((i / numPages) * 100));
         }
         const blob = new Blob([JSON.stringify(fullText, null, 2)], { type: "application/json" });
         setDownloadUrl(URL.createObjectURL(blob));
         setFinalExtension("json");
      }

      setStep("done");

    } catch (error) {
      console.error(error);
      alert("Conversion failed.");
      setStep("select");
    }
  };

  const FormatCard = ({ id, label, icon: Icon, desc }: any) => (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => handleConvert(id)}
      className="group relative overflow-hidden p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-left w-full"
    >
      <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
            <Icon size={24} />
          </div>
          <div>
             <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{label}</h3>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{desc}</p>
          </div>
      </div>
    </motion.button>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-left-4">
      
      {/* STEP 1: SELECT */}
      {step === "select" && (
        <div className="space-y-6">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
             <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <strong>New:</strong> Enhanced layout engine preserves text positioning for Word documents.
             </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <FormatCard 
              id="word" label="To Word (.doc)" icon={FileText} 
              desc="High-fidelity layout preservation."
            />
            <FormatCard 
              id="excel" label="To Excel (.csv)" icon={Table} 
              desc="Extracts data rows for spreadsheets."
            />
            <FormatCard 
              id="jpg" label="To Images (.zip)" icon={Archive} 
              desc="Zip archive of high-res page images."
            />
             <FormatCard 
              id="json" label="To JSON (.json)" icon={FileJson} 
              desc="Raw text data for developers."
            />
          </div>
        </div>
      )}

      {/* STEP 2: PROCESSING */}
      {step === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
           <Loader2 className="animate-spin text-zinc-900 dark:text-white" size={48} />
           <div>
             <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Converting...</h3>
             <p className="text-sm text-zinc-500">{progress}% processed</p>
           </div>
        </div>
      )}

      {/* STEP 3: DONE */}
      {step === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <CheckCircle className="text-black dark:text-white" size={32} />
           </div>
           <div>
             <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Success</h3>
             <p className="text-sm text-zinc-500">
               {targetFormat === 'word' ? 'Layout reconstructed.' : 'File ready.'}
             </p>
           </div>

           <a 
             href={downloadUrl || "#"} 
             download={`converted.${finalExtension}`}
             className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition"
           >
             <Download size={18} /> Download .{finalExtension.toUpperCase()}
           </a>

           <button onClick={() => setStep("select")} className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline">
             Convert another file
           </button>
        </div>
      )}
    </div>
  );
}