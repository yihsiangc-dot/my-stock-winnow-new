
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
      const sourceFiles = [
        'index.html', 'index.tsx', 'App.tsx', 'types.ts', 'constants.tsx',
        'geminiService.ts', 'fugleService.ts', 'StockCard.tsx',
        'AddSectorModal.tsx', 'ShareModal.tsx', 'SetupGuideModal.tsx',
        'vercel.json', 'package.json', 'README.md', 'tsconfig.json', 'vite.config.ts'
      ];

      await Promise.all(sourceFiles.map(async (fileName) => {
        try {
          const response = await fetch(`/${fileName}`);
          if (response.ok) {
            const content = await response.text();
            zip.file(fileName, content);
          }
        } catch (e) { console.warn(`Skip ${fileName}`); }
      }));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stock-hunter-RECOVERY-PACK.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("打包失敗，請直接從對話框複製程式碼。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 text-center">
      <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95">
        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-600/10">
          <Zap className="text-red-500 w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Fix Black Screen / Build Error</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            黑畫面通常是因為 GitHub 上的檔案不完整或路徑錯誤。請下載下方的「修復包」，解壓後將所有檔案拖進 GitHub 根目錄覆蓋。
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleDownloadProject}
            disabled={isExporting}
            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Processing..." : "Download Recovery Pack (.zip)"}
          </button>
          
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 tracking-widest">
              <Globe className="w-3 h-3" /> Important: Vercel Settings
            </div>
            <p className="text-[10px] text-slate-500">
              請在 Vercel 控制台的 Project Settings -> Environment Variables 加入：
            </p>
            <code className="block bg-black p-2 rounded text-[10px] font-mono text-red-400">API_KEY = [您的 Gemini API 金鑰]</code>
          </div>
        </div>

        <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-white transition-colors">
          I understand, return to dashboard
        </button>
      </div>
    </div>
  );
};

export default SetupGuideModal;
