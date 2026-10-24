import { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

export function SymbolSearchModal() {
  const { isSymbolSearchOpen, toggleSymbolSearch, watchlist, setSymbol } = useMarketStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  if (!isSymbolSearchOpen) return null;

  const categories = ['All', 'Forex', 'Cryptos', 'Metals'];

  const filtered = watchlist.filter(item => {
    const matchesSearch = item.displaySymbol.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    
    // Map filter categories to our store types
    let matchesCategory = true;
    if (category !== 'All') {
      if (category === 'Forex') matchesCategory = item.type === 'forex';
      if (category === 'Cryptos') matchesCategory = item.type === 'crypto';
      if (category === 'Metals') matchesCategory = item.type === 'metal';
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e222d] w-full max-w-2xl rounded-lg shadow-2xl border border-border flex flex-col overflow-hidden max-h-[80vh]">
        
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-[#1e222d]">
          <h2 className="text-white font-semibold text-sm">Symbol Search</h2>
          <button onClick={toggleSymbolSearch} className="text-text-muted hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-3 border-b border-border bg-[#131722]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search symbol or description (e.g., XAU, EURUSD)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1e222d] border border-border rounded pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex px-3 py-2 gap-2 border-b border-border bg-[#1e222d]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${category === cat ? 'bg-white text-black' : 'bg-[#2a2e39] text-text-muted hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-[#1e222d]">
          <div className="flex text-[10px] text-text-muted uppercase tracking-wider mb-2 px-3 font-semibold">
            <span className="w-1/3">Symbol</span>
            <span className="w-2/3">Description</span>
          </div>
          
          {filtered.length === 0 ? (
            <div className="text-center text-text-muted py-10 text-sm">No symbols found.</div>
          ) : (
            filtered.map(item => (
              <div 
                key={item.symbol}
                onClick={() => { setSymbol(item.symbol); toggleSymbolSearch(); }}
                className="flex items-center px-3 py-2.5 hover:bg-[#2a2e39] cursor-pointer rounded transition-colors group border-b border-border/20"
              >
                <div className="w-1/3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#131722] rounded-full flex items-center justify-center text-[9px] border border-border text-white">
                    {item.displaySymbol.substring(0,1)}
                  </div>
                  <span className="text-white font-bold text-xs">{item.displaySymbol}</span>
                </div>
                <span className="w-2/3 text-text-muted text-[11px] group-hover:text-white transition-colors">{item.description}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}