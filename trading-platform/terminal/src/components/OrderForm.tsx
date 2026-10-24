import { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { getPrecision, getVolumeLabel } from '../utils/formatters';

export function OrderForm() {
  const ticker = useMarketStore((state) => state.ticker);
  const activeSymbol = useMarketStore((state) => state.activeSymbol);
  const placeOrder = useMarketStore((state) => state.placeOrder);
  
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('market');
  const [volume, setVolume] = useState('0.10'); 
  
  const currentPrice = ticker?.price || 0;
  const precision = getPrecision(activeSymbol);

  const handleSubmit = () => {
    const size = parseFloat(volume);
    if (isNaN(size) || size <= 0) return alert('Invalid volume');
    placeOrder(side, size, currentPrice);
  };

  const handlePercentClick = (percent: number) => {
    const maxVolume = 2.0; 
    const newVol = ((percent / 100) * maxVolume).toFixed(2);
    setVolume(newVol);
  };

  return (
    <div className="flex flex-col h-full bg-bg-panel">
      
      {/* Ultra-Compact Buy/Sell Toggle */}
      <div className="p-2 pb-1">
        <div className="flex bg-bg-base p-0.5 rounded border border-border/50">
          <button 
            onClick={() => setSide('buy')} 
            className={`flex-1 py-1 text-[11px] font-bold rounded-sm transition-all ${side === 'buy' ? 'bg-up text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Buy
          </button>
          <button 
            onClick={() => setSide('sell')} 
            className={`flex-1 py-1 text-[11px] font-bold rounded-sm transition-all ${side === 'sell' ? 'bg-down text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Order Type */}
      <div className="flex px-3 py-1 gap-3 text-[10px] text-text-muted border-b border-border shrink-0">
        <button onClick={() => setOrderType('market')} className={orderType === 'market' ? 'text-text-primary font-semibold' : 'hover:text-text-primary'}>Market</button>
        <button onClick={() => setOrderType('limit')} className={orderType === 'limit' ? 'text-text-primary font-semibold' : 'hover:text-text-primary'}>Limit</button>
        <button className="hover:text-text-primary">Stop</button>
      </div>

      {/* Inputs Area */}
      <div className="p-2 flex flex-col gap-1.5 flex-1 overflow-y-auto">
        
        {/* Price Input */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted">Price</label>
            {orderType === 'market' && <span className="text-[9px] text-up">Best</span>}
          </div>
          <div className="relative">
            <input 
              type="text" 
              disabled={orderType === 'market'}
              value={currentPrice.toFixed(precision)}
              readOnly
              className="w-full bg-bg-base border border-border rounded pl-2 pr-10 py-1 text-[11px] focus:outline-none focus:border-text-muted disabled:opacity-50 tabular-nums transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted">USDT</span>
          </div>
        </div>
        
        {/* Volume Input */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-text-muted">{getVolumeLabel(activeSymbol)}</label>
          <div className="relative">
            <input 
              type="number" 
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              step="0.01"
              className="w-full bg-bg-base border border-border rounded pl-2 pr-10 py-1 text-[11px] focus:outline-none focus:border-text-muted tabular-nums transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted">
              {activeSymbol.includes('BTC') ? 'BTC' : 'Lots'}
            </span>
          </div>
          
          {/* Quick Percentage Buttons */}
          <div className="flex gap-1 mt-0.5">
            {[25, 50, 75, 100].map(pct => (
              <button 
                key={pct}
                onClick={() => handlePercentClick(pct)}
                className="flex-1 bg-bg-elevated border border-border/50 py-[2px] rounded text-[9px] text-text-muted hover:text-text-primary hover:border-text-muted transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* SL / TP Grid */}
        <div className="grid grid-cols-2 gap-1.5 mt-0.5">
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-text-muted">Stop Loss</label>
            <input type="text" placeholder="0.00" className="w-full bg-bg-base border border-border rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-text-muted tabular-nums" />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-text-muted">Take Profit</label>
            <input type="text" placeholder="0.00" className="w-full bg-bg-base border border-border rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-text-muted tabular-nums" />
          </div>
        </div>
      </div>

      {/* Compact Submit Button */}
      <div className="p-2 mt-auto shrink-0 border-t border-border/50 bg-bg-panel">
        <button 
          onClick={handleSubmit}
          className={`w-full py-1.5 rounded text-[11px] font-bold text-white transition-all transform active:scale-[0.98] shadow-sm ${
            side === 'buy' 
              ? 'bg-up hover:bg-up/90 shadow-up/20' 
              : 'bg-down hover:bg-down/90 shadow-down/20'
          }`}
        >
          {side === 'buy' ? `Buy ${activeSymbol}` : `Sell ${activeSymbol}`}
        </button>
      </div>
    </div>
  );
}