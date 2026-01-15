
import React, { useEffect, useState, useRef } from 'react';
import { Stock } from './types';
import { COLORS } from './constants';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;
  const color = isUp ? COLORS.up : (isDown ? COLORS.down : COLORS.neutral);
  
  const [flash, setFlash] = useState<string | null>(null);
  const prevPrice = useRef(stock.price);

  useEffect(() => {
    if (stock.price !== prevPrice.current) {
      setFlash(stock.price > prevPrice.current ? 'ring-2 ring-red-500/30 bg-red-500/5' : 'ring-2 ring-green-500/30 bg-green-500/5');
      const timer = setTimeout(() => setFlash(null), 800);
      prevPrice.current = stock.price;
      return () => clearTimeout(timer);
    }
  }, [stock.price]);

  const isStrongOpening = stock.openingFiveMinChange > 1.0;

  return (
    <div className={`bg-[#0a0a0a] border ${isStrongOpening ? 'border-red-500/30' : 'border-white/5'} rounded-[2rem] p-8 hover:border-white/20 transition-all duration-500 group relative overflow-hidden shadow-2xl ${flash || ''}`}>
      {/* Live Badge */}
      <div className="absolute top-4 right-8 flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${stock.isRealData ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-slate-700'}`}></div>
        <span className={`text-[8px] font-black uppercase tracking-widest ${stock.isRealData ? 'text-blue-500' : 'text-slate-600'}`}>
          {stock.isRealData ? 'Live Data' : 'Simulation'}
        </span>
      </div>

      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-black text-white group-hover:text-red-500 transition-colors tracking-tighter">
              {stock.name}
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded leading-none border border-white/5">{stock.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {stock.isLeader && (
              <span className="px-2 py-0.5 bg-red-600/10 text-red-500 text-[10px] font-black rounded uppercase tracking-widest border border-red-500/20">Leader</span>
            )}
            {isStrongOpening && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600/20 text-red-400 text-[9px] font-black rounded uppercase tracking-widest animate-pulse border border-red-500/30">
                <TrendingUp className="w-2 h-2" /> Strong Opening
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-black tracking-tighter leading-none" style={{ color }}>
            {stock.price > 0 ? stock.price.toFixed(2) : "---"}
          </div>
          <div className="text-xs font-black font-mono mt-2 flex items-center justify-end gap-1.5" style={{ color }}>
            {isUp ? '▲' : (isDown ? '▼' : '')} {Math.abs(stock.changePercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-3">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Open Gain (開盤後)</div>
          <div className={`text-lg font-mono font-black flex items-center gap-1 ${stock.openingFiveMinChange > 0 ? 'text-red-400' : (stock.openingFiveMinChange < 0 ? 'text-green-400' : 'text-white')}`}>
            {stock.openingFiveMinChange > 0 && <ArrowUpRight className="w-4 h-4" />}
            {stock.openingFiveMinChange > 0 ? '+' : ''}{stock.openingFiveMinChange.toFixed(2)}%
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Volume (Unit)</div>
          <div className="text-lg font-mono font-black text-white">
            {stock.volume}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          {stock.hunterScore > 85 ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Momentum Peak</span>
            </div>
          ) : (
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scanning Dynamics...</span>
          )}
          <span className="text-[8px] font-mono text-slate-700 font-black uppercase tracking-widest">SYNC_T: {stock.lastUpdated || 'WAITING'}</span>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-[11px] font-mono text-slate-500 font-bold uppercase">Hunter Score: {stock.hunterScore}</div>
          <div className="text-[8px] text-slate-700 font-black uppercase tracking-tighter">Verified by Hunter-AI</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
