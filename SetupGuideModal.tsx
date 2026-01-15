
import React, { useState } from 'react';
import { Download, Zap, X, Globe } from 'lucide-react';
import JSZip from 'jszip';

interface SetupGuideModalProps {
  onClose: () => void;
}

const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadProject = async () => {
    setIsExporting(true);
    const zip = new JSZip();

    try {
      // 核心檔案清單
      const sourceFiles = [
        'index.html',
        'index.tsx',
        'App.tsx',
        'types.ts',
        'constants.tsx',
        'geminiService.ts',
        'fugleService.ts',
        'StockCard.tsx',
        'AddSectorModal.tsx',
        'ShareModal.tsx',
        'SetupGuideModal.tsx',
        'vercel.json',
        'package.json',
        'README.md',
        'tsconfig.json',
        'vite.config.ts'
      ];

      await Promise.all(sourceFiles.map(async (fileName) => {
        try {
          const response = await fetch(`/${fileName}`);
          if (response.ok) {
            const content = await response.text();
            // 直接放入根目錄，不建立資料夾
            zip.file(fileName, content);
          }
        } catch (e) {
          console.warn(`Skip ${fileName}`);
        }
      }));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stock-hunter-FLAT-VERSION.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("打包失敗。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-center">
      <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        <Zap className="text-red-500 w-12 h-12 mx-auto" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Fix Build Error</h2>
        <p className="text-sm text-slate-400">
          Vercel 報錯是因為您 GitHub 上的檔案不齊全。請下載下方「扁平化」包，解壓縮後將 **所有檔案** 一次拖進 GitHub 上傳。
        </p>
        <button 
          onClick={handleDownloadProject}
          disabled={isExporting}
          className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
        >
          {isExporting ? "Processing..." : "Download Flat Package (.zip)"}
        </button>
        <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-white">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SetupGuideModal;
