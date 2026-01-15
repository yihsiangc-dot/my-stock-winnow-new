
import React, { useState } from 'react';
import { Sector, Stock, SectorPhase } from './types';

interface AddSectorModalProps {
  onClose: () => void;
  onSave: (sector: Sector) => void;
  editData?: Sector;
}

const AddSectorModal: React.FC<AddSectorModalProps> = ({ onClose, onSave, editData }) => {
  const [name, setName] = useState(editData?.name || '');
  const [phase, setPhase] = useState<SectorPhase>(editData?.phase || 'Accumulation');
  const [stocks, setStocks] = useState<{ name: string; id: string; price: string; isLeader: boolean }[]>(
    editData?.stocks.map(s => ({ name: s.name, id: s.id, price: s.price.toString(), isLeader: s.isLeader })) || 
    [{ name: '', id: '', price: '', isLeader: true }]
  );

  const addStockRow = () => {
    setStocks([...stocks, { name: '', id: '', price: '', isLeader: false }]);
  };

  const removeStockRow = (index: number) => {
    if (stocks.length <= 1) return;
    const newStocks = stocks.filter((_, i) => i !== index);
    if (!newStocks.some(s => s.isLeader)) {
      newStocks[0].isLeader = true;
    }
    setStocks(newStocks);
  };

  const updateStock = (index: number, field: string, value: any) => {
    const newStocks = [...stocks];
    if (field === 'isLeader') {
      newStocks.forEach((s, i) => s.isLeader = i === index);
    } else {
      newStocks[index] = { ...newStocks[index], [field as keyof typeof newStocks[0]]: value };
    }
    setStocks(newStocks);
  };

  const handleSave = () => {
    if (!name || stocks.some(s => !s.name || !s.id)) {
      alert("請填寫族群名稱與完整的個股資訊。");
      return;
    }

    const newSector: Sector = {
      id: editData?.id || `custom_${Date.now()}`,
      name,
      phase,
      totalChangePercent: editData?.totalChangePercent || 0,
      rotationRisk: editData?.rotationRisk || 20,
      marketCorrelation: editData?.marketCorrelation || 0.5,
      stocks: stocks.map((s, idx) => {
        const existingStock = editData?.stocks.find(es => es.id === s.id);
        const priceNum = parseFloat(s.price) || 100;
        return {
          id: s.id,
          name: s.name,
          price: priceNum,
          change: existingStock?.change || 0,
          changePercent: existingStock?.changePercent || 0,
          volume: existingStock?.volume || '0',
          isLeader: s.isLeader,
          openingFiveMinChange: existingStock?.openingFiveMinChange || 0,
          volumeRatio: existingStock?.volumeRatio || 1.0,
          gapPercent: existingStock?.gapPercent || 0,
          confidenceScore: existingStock?.confidenceScore || 70,
          distributionRisk: existingStock?.distributionRisk || 10,
          isStalling: existingStock?.isStalling || false,
          relativeStrength: existingStock?.relativeStrength || 0,
          hunterScore: existingStock?.hunterScore || 75,
          supportPrice: existingStock?.supportPrice || priceNum * 0.95,
          resistancePrice: existingStock?.resistancePrice || priceNum * 1.05,
        };
      })
    };

    onSave(newSector);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 max-w-3xl w-full shadow-[0_0_100px_rgba(239,68,68,0.05)] space-y-8 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {editData ? 'Configure' : 'Design'} <span className="text-red-500">Hunter</span> Strategy
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">Customizing sector dynamics and peripheral stocks</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sector Name (族群名稱)</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 矽光子, 低軌衛星周邊"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:border-red-500/50 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Market Stage (當前位階)</label>
            <select 
              value={phase}
              onChange={e => setPhase(e.target.value as SectorPhase)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:border-red-500/50 focus:outline-none appearance-none"
            >
              <option value="Accumulation">Accumulation (打底吸籌)</option>
              <option value="Advancing">Advancing (主升攻擊)</option>
              <option value="Climax">Climax (末端噴出)</option>
              <option value="Distribution">Distribution (高檔派發)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Stock List</label>
            <span className="text-[9px] text-red-500/60 font-black uppercase tracking-widest italic">Check star to mark sector leader</span>
          </div>
          <div className="space-y-3">
            {stocks.map((stock, idx) => (
              <div key={idx} className="flex gap-3 items-center group/row animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                <button 
                  onClick={() => updateStock(idx, 'isLeader', true)}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${stock.isLeader ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-600 hover:border-white/20'}`}
                  title="Mark as Leader"
                >
                  ★
                </button>
                <input 
                  placeholder="名稱"
                  value={stock.name}
                  onChange={e => updateStock(idx, 'name', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 focus:outline-none"
                />
                <input 
                  placeholder="代號"
                  value={stock.id}
                  onChange={e => updateStock(idx, 'id', e.target.value)}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-red-500/50 focus:outline-none"
                />
                <input 
                  placeholder="現價"
                  value={stock.price}
                  onChange={e => updateStock(idx, 'price', e.target.value)}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-red-500/50 focus:outline-none"
                />
                <button 
                  onClick={() => removeStockRow(idx)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-slate-700 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={addStockRow}
            className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-slate-500 hover:border-white/20 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Add Peripheral Stock
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            className="w-full py-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-[2rem] font-black transition-all shadow-2xl uppercase text-xs tracking-[0.3em] border border-white/10"
          >
            Deploy Hunter Intelligence
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSectorModal;
