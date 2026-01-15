
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Plus, Share2, FileDown, Activity, Cpu } from 'lucide-react';
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
    const saved = localStorage.getItem('hunter_all_sectors_v3');
    return saved ? JSON.parse(saved) : INITIAL_SECTORS;
  });

  const [activeSectorId, setActiveSectorId] = useState<string>(sectors[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'error'>('offline');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSector = sectors.find(s => s.id === activeSectorId) || sectors[0];

  const refreshMarketData = useCallback(async () => {
    const symbols = activeSector.stocks.map(s => s.id);
    const realQuotes = await fetchFugleQuotes(symbols);
    
    if (realQuotes.length > 0) {
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
  }, [activeSectorId, activeSector.stocks]);

  useEffect(() => {
    refreshMarketData();
    const timer = setInterval(refreshMarketData, 30000);
    return () => clearInterval(timer);
  }, [activeSectorId]);

  useEffect(() => {
    localStorage.setItem('hunter_all_sectors_v3', JSON.stringify(sectors));
  }, [sectors]);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSectorDynamics(activeSector);
      setAnalysis(result);
    } catch (error) {
      alert("AI 分析連線失敗。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col overflow-hidden">
      {showAddModal && <AddSectorModal onClose={() => setShowAddModal(false)} onSave={(s) => setSectors([...sectors, s])} />}
      {showShareModal && <ShareModal activeSector={activeSector} allSectors={sectors} onClose={() => setShowShareModal(false)} onImportAll={setSectors} />}
      {showSetupGuide && <SetupGuideModal onClose={() => setShowSetupGuide(false)} />}

      <header className="h-16 flex-shrink-0 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-400">
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
              {apiStatus === 'online' ? 'Live Data' : 'Sync Error'}
            </span>
          </div>
          <button onClick={() => setShowSetupGuide(true)} className="p-2 text-slate-400 hover:text-white" title="Deployment Pack">
            <FileDown className="w-5 h-5" />
          </button>
          <button onClick={() => setShowShareModal(true)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
            Sync
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`fixed lg:static inset-0 z-50 lg:z-0 w-64 bg-[#050505] border-r border-white/5 p-6 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Markets</h2>
          <nav className="space-y-2">
            {sectors.map(sector => (
              <button 
                key={sector.id} 
                onClick={() => { setActiveSectorId(sector.id); setIsMobileMenuOpen(false); }}
                className={`w-full text-left p-3 rounded-xl transition-all text-sm font-bold border ${activeSectorId === sector.id ? 'bg-red-600/10 border-red-500/30 text-red-500' : 'text-slate-500 border-transparent hover:text-white'}`}
              >
                {sector.name}
              </button>
            ))}
            <button onClick={() => setShowAddModal(true)} className="w-full mt-4 p-3 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:text-white">
              + New Sector
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-hide">
          <div className="max-w-5xl mx-auto space-y-12 pb-32">
            
            {apiStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4">
                <Activity className="text-red-500 w-5 h-5" />
                <p className="text-xs text-red-400">目前處於模擬模式。若要獲得實時行情，請點擊右上角下載 ZIP 並部署至 Vercel。</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">{activeSector.name}</h2>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stage:</span>
                   <span className="text-[10px] font-black uppercase text-red-500">{activeSector.phase}</span>
                </div>
              </div>
              <button 
                onClick={handleAnalysis} 
                disabled={isAnalyzing}
                className="px-8 py-4 bg-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? "Scanning..." : "Deep Market Insight"}
              </button>
            </div>

            {analysis && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <Cpu className="w-5 h-5 text-red-500" />
                  <h3 className="font-black italic uppercase tracking-widest">AI Strategist</h3>
                </div>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.leaderAnalysis}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSector.stocks.map(stock => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
