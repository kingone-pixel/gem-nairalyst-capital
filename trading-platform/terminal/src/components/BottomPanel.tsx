import { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { getPrecision } from '../utils/formatters';

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'transactions'>('positions');
  const { positions, history, watchlist, closePosition, modifyPosition, isBottomPanelOpen, toggleBottomPanel } = useMarketStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSl, setEditSl] = useState('');
  const [editTp, setEditTp] = useState('');

  const calculatePnL = (pos: any) => {
    const currentItem = watchlist.find(w => w.symbol === pos.symbol);
    if (!currentItem) return { pnl: 0 };
    const isForex = !pos.symbol.includes('BTC') && !pos.symbol.includes('ETH');
    const multiplier = isForex ? 100000 : 1;
    const currentPrice = currentItem.price;
    const priceDiff = pos.side === 'buy' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    return { pnl: priceDiff * pos.size * multiplier };
  };

  const startEditing = (pos: any) => {
    setEditingId(pos.id);
    setEditSl(pos.sl?.toString() || '');
    setEditTp(pos.tp?.toString() || '');
  };

  const saveModification = (id: string) => {
    modifyPosition(id, parseFloat(editSl) || undefined, parseFloat(editTp) || undefined);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#131722] overflow-hidden relative">
      {/* Tiny Tabs Bar */}
      <div className="flex items-center px-2 gap-1 text-[10px] bg-[#1e222d] border-b border-border h-[28px] shrink-0 select-none relative z-10">
        <button onClick={() => setActiveTab('positions')} className={`h-full flex items-center gap-1 px-2 transition-colors border-t-2 ${activeTab === 'positions' ? 'text-white bg-[#131722] border-t-blue-500' : 'text-text-muted border-t-transparent hover:text-white'}`}>
          Positions <span className="bg-[#2a2e39] text-text-muted text-[9px] px-1 rounded">{positions.length}</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`h-full flex items-center gap-1 px-2 transition-colors border-t-2 ${activeTab === 'history' ? 'text-white bg-[#131722] border-t-blue-500' : 'text-text-muted border-t-transparent hover:text-white'}`}>
          History
        </button>
        
        {/* Icon-only Toggle */}
        <div className="ml-auto flex items-center h-full">
          <button onClick={toggleBottomPanel} className="p-1 text-text-muted hover:text-white transition-colors" title={isBottomPanelOpen ? "Collapse" : "Expand"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${isBottomPanelOpen ? 'rotate-180' : ''}`}><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
        </div>
      </div>

      {isBottomPanelOpen && (
        <div className="flex-1 overflow-auto bg-[#131722]">
          {activeTab === 'positions' && (
            <table className="w-full min-w-[700px] text-left text-[10px] table-fixed">
              <thead className="text-text-muted border-b border-border/50 bg-[#1e222d] sticky top-0 text-[9px] uppercase tracking-wider">
                <tr>
                  <th className="font-normal px-2 py-1 w-[12%]">Symbol</th>
                  <th className="font-normal px-2 py-1 w-[8%]">Side</th>
                  <th className="font-normal px-2 py-1 w-[8%] text-right">Size</th>
                  <th className="font-normal px-2 py-1 w-[12%] text-right">Entry</th>
                  <th className="font-normal px-2 py-1 w-[12%] text-right">Mark</th>
                  <th className="font-normal px-2 py-1 w-[12%] text-right">PnL</th>
                  <th className="font-normal px-2 py-1 w-[20%] text-center">SL / TP</th>
                  <th className="font-normal px-2 py-1 w-[16%] text-center"></th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {positions.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4 text-text-muted text-[10px]">No open positions.</td></tr>
                ) : (
                  positions.map((pos) => {
                    const { pnl } = calculatePnL(pos);
                    const currentItem = watchlist.find(w => w.symbol === pos.symbol);
                    const markPrice = currentItem ? currentItem.price : pos.entryPrice;
                    const precision = getPrecision(pos.symbol);
                    const isEditing = editingId === pos.id;

                    return (
                      <tr key={pos.id} className="border-b border-border/20 hover:bg-[#1e222d] transition-colors group">
                        <td className="px-2 py-0.5 font-semibold text-white">{pos.symbol}</td>
                        <td className={`px-2 py-0.5 uppercase ${pos.side === 'buy' ? 'text-up' : 'text-down'}`}>{pos.side}</td>
                        <td className="px-2 py-0.5 text-right">{pos.size.toFixed(2)}</td>
                        <td className="px-2 py-0.5 text-right text-text-muted">{pos.entryPrice.toFixed(precision)}</td>
                        <td className="px-2 py-0.5 text-right text-white">{markPrice.toFixed(precision)}</td>
                        <td className={`px-2 py-0.5 text-right ${pnl >= 0 ? 'text-up' : 'text-down'}`}>{pnl > 0 ? '+' : ''}{pnl.toFixed(2)}</td>
                        
                        <td className="px-2 py-0.5 text-center">
                          {isEditing ? (
                            <div className="flex gap-1 justify-center">
                              <input value={editSl} onChange={(e) => setEditSl(e.target.value)} placeholder="SL" className="w-12 bg-[#2a2e39] border border-border text-white px-1 py-0 text-[9px] rounded" />
                              <input value={editTp} onChange={(e) => setEditTp(e.target.value)} placeholder="TP" className="w-12 bg-[#2a2e39] border border-border text-white px-1 py-0 text-[9px] rounded" />
                            </div>
                          ) : (
                            <span className="text-text-muted text-[9px]">
                              {pos.sl ? `SL: ${pos.sl}` : 'SL: -'} | {pos.tp ? `TP: ${pos.tp}` : 'TP: -'}
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-0.5 text-center">
                          <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isEditing ? (
                              <button onClick={() => saveModification(pos.id)} className="text-[9px] bg-blue-600 text-white px-1.5 py-0 rounded">Save</button>
                            ) : (
                              <button onClick={() => startEditing(pos)} className="text-[9px] bg-[#2a2e39] border border-border/50 px-1.5 py-0 rounded text-text-muted hover:text-white transition-colors">Mod</button>
                            )}
                            <button 
                              onClick={() => { if (currentItem) closePosition(pos.id, currentItem.price); }} 
                              className="text-[9px] bg-[#2a2e39] border border-border/50 px-1.5 py-0 rounded text-text-muted hover:bg-down hover:text-white transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'history' && (
             <div className="flex items-center justify-center h-full text-text-muted text-[10px]">No history yet.</div>
          )}
        </div>
      )}
    </div>
  );
}