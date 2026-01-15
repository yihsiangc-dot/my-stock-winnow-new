
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, FileDown, Cpu, ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { INITIAL_SECTORS } from './constants';
import { Sector, AnalysisResult } from './types';
import StockCard from './StockCard';
import AddSectorModal from './AddSectorModal';
import ShareModal from './ShareModal';
import SetupGuideModal from './SetupGuideModal';
import { analyzeSectorDynamics } from './geminiService';
import { fetchFugleQuotes } from './fugleService';

const App: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>(() => {
    try {
      const saved = localStorage.getItem('hunter_v5_storage');
      return saved ? JSON.parse(saved) : INITIAL_SECTORS;
    } catch (e) {
      return INITIAL_SECTORS;
    }
  });

  const [activeSectorId, setActiveSectorId] = useState<string>(sectors[0]?.id || 'us_ai_concepts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'error'>('offline');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSector = sectors.find(s => s.id === activeSectorId) || sectors[0];

  const refreshMarketData = useCallback(async () => {
    if (!activeSector || isSyncing) return;
    
    setIsSyncing(true);
    const symbols = activeSector.stocks.map(s => s.id);
    const realQuotes = await fetchFugleQuotes(symbols);
    
    if (realQuotes && realQuotes.length > 0) {
      setApiStatus('online');
      setSectors(prevSectors => prevSectors.map(sector => {
        if (sector.id !== activeSectorId) return sector;
        return {
          ...sector,
          stocks: sector.stocks.map(stock => {
            const quote = realQuotes.find(q => q.id === stock.id);
            return quote ? { ...stock, ...quote } : stock;
          })
        };
      }));
    } else {
      setApiStatus('error');
    }
    setTimeout(() => setIsSyncing(false), 500); // 防止點擊過快
  }, [activeSectorId, activeSector, isSyncing]);

  useEffect(() => {
    refreshMarketData();
  }, [activeSectorId]);

  // 每 30 秒自動刷新一次
  useEffect(() => {
    const timer = setInterval(refreshMarketData, 30000);
    return () => clearInterval(timer);
  }, [refreshMarketData]);

  useEffect(() => {
    localStorage.setItem('hunter_v5_storage', JSON.stringify(sectors));
  }, [sectors]);

  const handleAnalysis = async () => {
    if (!activeSector) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeSectorDynamics(activeSector);
      setAnalysis(result);
    } catch (error) {
      alert("AI 分析失敗。請確認 Vercel 環境變數 API_KEY 已設定。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col overflow-hidden">
      {showAddModal && <AddSectorModal onClose={() => setShowAddModal(false)} onSave={(s) => setSectors([...sectors, s])} />}
      {showShareModal && activeSector && <ShareModal activeSector={activeSector} allSectors={sectors} onClose={() => setShowShareModal(false)} onImportAll={setSectors} />}
      {showSetupGuide && <SetupGuideModal onClose={() => setShowSetupGuide(false)} />}

      <header className="h-16 flex-shrink-0 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-black italic shadow-lg">H</div>
            <h1 className="text-lg font-black tracking-tighter italic uppercase">Sector <span className="text-red-600">Hunter</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {apiStatus === 'online' ? 'Market Live' : 'API Offline'}
            </span>
          </div>
          
          <button 
            onClick={refreshMarketData} 
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all ${isSyncing ? 'opacity-50' : ''}`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing' : 'Sync'}
          </button>

          <button onClick={() => setShowShareModal(true)} className="p-2 text-slate-400 hover:text-white sm:hidden">
            <Share2 className="w-5 h-5" />
          </button>
          
          <button onClick={() => setShowSetupGuide(true)} className="hidden sm:block p-2 text-slate-400 hover:text-white">
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`absolute lg:static inset-0 z-30 lg:z-0 w-64 bg-[#050505] border-r border-white/5 p-6 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategies</h2>
            <button onClick={() => setShowShareModal(true)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Share</button>
          </div>
          <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-hide">
            {sectors.map(sector => (
              <button 
                key={sector.id} 
                onClick={() => { setActiveSectorId(sector.id); setIsMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded-xl transition-all text-sm font-bold border ${activeSectorId === sector.id ? 'bg-red-600/10 border-red-500/30 text-red-500 shadow-inner' : 'text-slate-500 border-transparent hover:text-white hover:bg-white/5'}`}
              >
                {sector.name}
              </button>
            ))}
            <button onClick={() => setShowAddModal(true)} className="w-full mt-4 p-3 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:text-white hover:border-white/20 transition-all">
              + Design Strategy
            </button>
          </nav>
        </aside>

        {isMobileMenuOpen && <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        <main className="flex-1 overflow-y-auto p-4 lg:p-12 scrollbar-hide relative z-10">
          <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12 pb-32">
            {activeSector && (
              <>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="animate-in slide-in-from-left-4 duration-500">
                    <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter mb-2 leading-none">
                      {activeSector.name}
                    </h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strategy Phase:</span>
                       <span className="text-[10px] font-black uppercase text-red-500 px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">{activeSector.phase}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleAnalysis} 
                    disabled={isAnalyzing}
                    className="w-full lg:w-auto px-10 py-5 bg-red-600 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(239,68,68,0.3)] border border-red-400/20"
                  >
                    {isAnalyzing ? "AI Scrutinizing..." : "Execute Market Scan"}
                  </button>
                </div>

                {analysis && (
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 lg:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Cpu className="w-5 h-5 text-red-500 animate-pulse" />
                      <h3 className="font-black italic uppercase tracking-widest text-sm text-slate-300">Strategic Intelligence</h3>
                    </div>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.leaderAnalysis}</div>
                    
                    {analysis.sources && analysis.sources.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Verification Sources</div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.sources.map((source, idx) => (
                            <a 
                              key={idx} 
                              href={source.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center gap-2 group"
                            >
                              <ExternalLink className="w-3 h-3 text-red-500 opacity-50 group-hover:opacity-100" />
                              {source.web.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {activeSector.stocks.map(stock => (
                    <StockCard key={stock.id} stock={stock} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
