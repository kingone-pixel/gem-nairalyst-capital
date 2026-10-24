import { Fragment, useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { getPrecision, getSpread } from '../utils/formatters';

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={`w-3 h-3 ${filled ? 'text-text-muted' : 'text-text-muted/30 hover:text-text-muted'} transition-colors`}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-text-muted/30 hover:text-text-muted cursor-pointer"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);

export function MarketWatch() {
  const { watchlist, activeSymbol, setSymbol, favorites, toggleFavorite, isWatchlistOpen, placeOrder } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [lotSize, setLotSize] = useState('0.01'); 
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  if (!isWatchlistOpen) return null;

  const filteredWatchlist = watchlist.filter(item => {
    const matchesTab = activeTab === 'all' || favorites.includes(item.symbol);
    const matchesSearch = item.displaySymbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groups = {
    forex: filteredWatchlist.filter(w => w.type === 'forex'),
    crypto: filteredWatchlist.filter(w => w.type === 'crypto'),
    metal: filteredWatchlist.filter(w => w.type === 'metal'),
    index: filteredWatchlist.filter(w => w.type === 'index'),
  };

  const handleQuickTrade = (side: 'buy' | 'sell', price: number) => {
    const size = parseFloat(lotSize);
    if (isNaN(size) || size <= 0) return alert('Invalid lot size');
    placeOrder(side, size, price, parseFloat(sl), parseFloat(tp));
    setSl(''); setTp('');
  };

  const renderRow = (item: any) => {
    const isActive = item.symbol === activeSymbol;
    const precision = getPrecision(item.symbol);
    const isFav = favorites.includes(item.symbol);
    const spread = getSpread(item.symbol);
    
    const bid = item.price;
    const ask = item.price + spread;

    return (
      <Fragment key={item.symbol}>
        <div
          className={`group flex flex-col px-1.5 py-1 text-[10px] tabular-nums transition-colors border-b border-border/30 hover:bg-[#2a2e39] cursor-pointer ${
            isActive ? 'bg-[#2a2e39]' : ''
          }`}
          onClick={() => setSymbol(item.symbol)}
        >
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-white font-bold tracking-wide text-[11px]">{item.displaySymbol}</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] ${item.change24h >= 0 ? 'text-up' : 'text-down'}`}>
                {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(2)}%
              </span>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}>
                <StarIcon filled={isFav} />
              </button>
              <ChartIcon />
            </div>
          </div>

          <div className="flex justify-between text-[9px]">
            <div className="flex gap-1">
              <span className="text-text-muted w-6">Bid:</span>
              <span className="text-white font-semibold">{bid.toFixed(precision)}</span>
            </div>
            <div className="flex gap-1 text-right">
              <span className="text-text-muted w-6">Ask:</span>
              <span className="text-white font-semibold">{ask.toFixed(precision)}</span>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="bg-[#131722] border-b border-border shadow-inner p-1.5 flex flex-col gap-1.5 relative z-10">
            <div className="flex gap-1.5">
              <div className="flex-1">
                <label className="text-[8px] text-text-muted block mb-0.5">Lot</label>
                <input type="number" value={lotSize} onChange={(e) => setLotSize(e.target.value)} step="0.01"
                  className="w-full bg-[#1e222d] border border-border rounded px-1.5 py-0.5 text-[10px] focus:outline-none text-white" />
              </div>
              <div className="flex-1">
                <label className="text-[8px] text-text-muted block mb-0.5">SL</label>
                <input type="number" placeholder="-" value={sl} onChange={(e) => setSl(e.target.value)} className="w-full bg-[#1e222d] border border-border rounded px-1.5 py-0.5 text-[10px] text-white" />
              </div>
              <div className="flex-1">
                <label className="text-[8px] text-text-muted block mb-0.5">TP</label>
                <input type="number" placeholder="-" value={tp} onChange={(e) => setTp(e.target.value)} className="w-full bg-[#1e222d] border border-border rounded px-1.5 py-0.5 text-[10px] text-white" />
              </div>
            </div>

            <div className="flex gap-1 relative rounded overflow-hidden mt-0.5">
              <button onClick={(e) => { e.stopPropagation(); handleQuickTrade('sell', bid); }} className="flex-1 bg-down hover:bg-down/80 text-white py-1 rounded-l text-[10px] font-bold transition-colors">Sell</button>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 bg-[#131722] w-8 flex items-center justify-center text-[9px] text-text-muted pointer-events-none z-10 font-bold">
                {spread.toFixed(precision).replace(/^0+/, '')}
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleQuickTrade('buy', ask); }} className="flex-1 bg-up hover:bg-up/80 text-white py-1 rounded-r text-[10px] font-bold transition-colors">Buy</button>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1e222d] overflow-hidden border-r border-border">
      <div className="flex items-center px-1.5 py-1 border-b border-border bg-[#1e222d] shrink-0">
        <svg className="text-text-muted mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-white text-[10px] focus:outline-none flex-1 placeholder-text-muted" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        )}
      </div>

      <div className="flex border-b border-border bg-[#1e222d] shrink-0">
        <button onClick={() => setActiveTab('all')} className={`flex-1 py-1 text-[10px] font-semibold transition-colors ${activeTab === 'all' ? 'text-white bg-[#2a2e39] border-b-2 border-blue-500' : 'text-text-muted hover:text-white'}`}>All</button>
        <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-1 text-[10px] font-semibold transition-colors ${activeTab === 'favorites' ? 'text-white bg-[#2a2e39] border-b-2 border-blue-500' : 'text-text-muted hover:text-white'}`}>Favs</button>
      </div>

      <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-border text-[8px] text-text-muted uppercase tracking-wider shrink-0 bg-[#131722]">
        <span className="flex-1 text-left">Symbol</span>
        <span className="w-1/3 text-right">Bid</span>
        <span className="w-1/4 text-right">Chg%</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(groups).map(([groupName, items]) => (
          items.length > 0 && (
            <div key={groupName}>
              <div className="px-1.5 py-0.5 bg-[#131722] text-[8px] text-blue-400 font-bold uppercase border-b border-border/50 sticky top-0 z-20">
                {groupName}
              </div>
              {items.map(renderRow)}
            </div>
          )
        ))}
      </div>
    </div>
  );
}