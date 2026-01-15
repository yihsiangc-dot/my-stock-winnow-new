
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, FileDown, Cpu, ExternalLink } from 'lucide-react';
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
      const saved = localStorage.getItem('hunter_all_sectors_v4');
      return saved ? JSON.parse(saved) : INITIAL_SECTORS;
    } catch (e) {
      return INITIAL_SECTORS;
    }
  });

  const [activeSectorId, setActiveSectorId] = useState<string>(sectors[0]?.id || 'us_ai_concepts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'error'>('offline');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSector = sectors.find(s => s.id === activeSectorId) || sectors[0];

  const refreshMarketData = useCallback(async () => {
    if (!activeSector) return;
    
    console.log(`Syncing data for: ${activeSector.name}...`);
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
            if (quote) {
              return { ...stock, ...quote };
            }
            return stock;
          })
        };
      }));
    } else {
      setApiStatus('error');
    }
  }, [activeSectorId, activeSector]);

  // 初次加載與主動切換時更新
  useEffect(() => {
    refreshMarketData();
  }, [activeSectorId]);

  // 定時刷新 (1分鐘)
  useEffect(() => {
    const timer = setInterval(refreshMarketData, 60000);
    return () => clearInterval(timer);
  }, [refreshMarketData]);

  useEffect(() => {
    localStorage.setItem('hunter_all_sectors_v4', JSON.stringify(sectors));
  }, [sectors]);

  const handleAnalysis = async () => {
    if (!activeSector) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeSectorDynamics(activeSector);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
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

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {apiStatus === 'online' ? 'Live Data Sync' : 'Static Mode'}
            </span>
          </div>
          <button onClick={() => setShowSetupGuide(true)} className="p-2 text-slate-400 hover:text-white">
            <FileDown className="w-5 h-5" />
          </button>
          <button onClick={() => setShowShareModal(true)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
            Sync
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`absolute lg:static inset-0 z-30 lg:z-0 w-64 bg-[#050505] border-r border-white/5 p-6 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Sectors</h2>
          <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-hide">
            {sectors.map(sector => (
              <button 
                key={sector.id} 
                onClick={() => { setActiveSectorId(sector.id); setIsMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded-xl transition-all text-sm font-bold border ${activeSectorId === sector.id ? 'bg-red-600/10 border-red-500/30 text-red-500' : 'text-slate-500 border-transparent hover:text-white hover:bg-white/5'}`}
              >
                {sector.name}
              </button>
            ))}
            <button onClick={() => setShowAddModal(true)} className="w-full mt-4 p-3 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:text-white hover:border-white/20">
              + Add Strategy
            </button>
          </nav>
        </aside>

        {isMobileMenuOpen && <div className="absolute inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-hide relative z-10">
          <div className="max-w-5xl mx-auto space-y-12 pb-32">
            {activeSector && (
              <>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-2">{activeSector.name}</h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Market Phase:</span>
                       <span className="text-[10px] font-black uppercase text-red-500 px-2 py-0.5 bg-red-500/10 rounded">{activeSector.phase}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleAnalysis} 
                    disabled={isAnalyzing}
                    className="w-full lg:w-auto px-10 py-5 bg-red-600 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
                  >
                    {isAnalyzing ? "AI Deep Scanning..." : "Execute AI Analysis"}
                  </button>
                </div>

                {analysis && (
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Cpu className="w-5 h-5 text-red-500" />
                      <h3 className="font-black italic uppercase tracking-widest text-sm text-slate-300">Market Strategist Output</h3>
                    </div>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.leaderAnalysis}</div>
                    
                    {analysis.sources && analysis.sources.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Grounding Sources (Search Results)</div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.sources.map((source, idx) => (
                            <a 
                              key={idx} 
                              href={source.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-400 hover:text-white transition-all flex items-center gap-2 group"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
