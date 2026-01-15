
import React, { useState, useRef } from 'react';
import { Sector } from './types';

interface ShareModalProps {
  activeSector: Sector;
  allSectors: Sector[];
  onClose: () => void;
  onImportAll: (sectors: Sector[]) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ activeSector, allSectors, onClose, onImportAll }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shareUrl = (() => {
    const data = JSON.stringify(activeSector);
    const encoded = btoa(encodeURIComponent(data));
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('strategy', encoded);
    return url.toString();
  })();

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&bgcolor=0a0a0a&color=ffffff&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const downloadBackup = () => {
    const dataStr = JSON.stringify(allSectors, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const fileName = `Hunter_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && confirm('確認要導入此備份檔案？這將會更新您的族群清單。')) {
          onImportAll(json);
          onClose();
        } else {
          alert('無效的備份格式。');
        }
      } catch (err) {
        alert('解析檔案失敗。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 max-w-xl w-full shadow-[0_0_80px_rgba(255,255,255,0.05)] space-y-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Hunter <span className="text-red-500">Sync</span></h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Cross-platform strategy bridge</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-2 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <img src={qrCodeUrl} alt="Strategy QR Code" className="w-40 h-40 rounded-2xl" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center leading-relaxed">
              Scan to open current strategy<br/>on your mobile device
            </p>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Strategy Link</div>
              <div className="font-mono text-[9px] text-slate-500 break-all h-12 overflow-hidden opacity-50">
                {shareUrl}
              </div>
            </div>
            <button 
              onClick={handleCopyLink}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
                copyStatus === 'copied' ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {copyStatus === 'copied' ? '✓ Copied' : 'Copy Strategy URL'}
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
          <button 
            onClick={downloadBackup}
            className="flex flex-col items-center gap-2 p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.06] transition-all group"
          >
            <div className="text-white group-hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Backup All</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.06] transition-all group"
          >
            <div className="text-white group-hover:text-blue-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Restore Data</span>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
