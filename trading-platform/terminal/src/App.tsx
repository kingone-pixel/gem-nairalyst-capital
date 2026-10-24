import { useMarketStore } from './store/useMarketStore';
import { ChartPanel } from './components/ChartPanel';
import { MarketWatch } from './components/MarketWatch';
import { BottomPanel } from './components/BottomPanel';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { getPrecision } from './utils/formatters';
import { useFanOutFeed } from './hooks/useFanOutFeed';

function App() {
  // 1. Get the connection status
  const wsStatus = useFanOutFeed();

  const activeSymbol = useMarketStore((state) => state.activeSymbol);
  const ticker = useMarketStore((state) => state.ticker);
  const watchlist = useMarketStore((state) => state.watchlist);
  const isWatchlistOpen = useMarketStore((state) => state.isWatchlistOpen);
  const toggleWatchlist = useMarketStore((state) => state.toggleWatchlist);
  const isBottomPanelOpen = useMarketStore((state) => state.isBottomPanelOpen); 
  const toggleSymbolSearch = useMarketStore((state) => state.toggleSymbolSearch); 
  
  const balance = useMarketStore((state) => state.balance);
  const positions = useMarketStore((state) => state.positions);

  const equity = positions.reduce((acc, pos) => {
    const currentItem = watchlist.find(w => w.symbol === pos.symbol);
    if (!currentItem) return acc;
    const isForex = !pos.symbol.includes('BTC') && !pos.symbol.includes('ETH') && !pos.symbol.includes('US500');
    const multiplier = isForex ? 100000 : 1;
    const pnl = (pos.side === 'buy' ? currentItem.price - pos.entryPrice : pos.entryPrice - currentItem.price) * pos.size * multiplier;
    return acc + pnl;
  }, balance);

  const marginUsed = positions.reduce((acc, pos) => acc + (pos.size * 1000), 0);
  const freeMargin = equity - marginUsed;
  const unrealizedPnl = equity - balance;

  const activeItem = watchlist.find(w => w.symbol === activeSymbol);
  const displaySymbol = activeItem ? activeItem.displaySymbol : activeSymbol;

  return (
    <div className="h-[100dvh] flex flex-col font-mono text-[10px] bg-[#131722] overflow-hidden text-gray-300">
      
      <SymbolSearchModal />

      {/* --- TOP HEADER --- */}
      <header className="h-8 shrink-0 flex items-center px-2 border-b border-border bg-[#1e222d] z-20">
        
        {/* WS Status Indicator */}
        <div className="flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded bg-[#131722] border border-border">
           <div className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-500' : wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
           <span className="text-[8px] uppercase tracking-wider text-text-muted">{wsStatus}</span>
        </div>

        <button onClick={toggleWatchlist} className="mr-2 text-text-muted hover:text-white transition-colors focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        
        <span className="text-white font-bold tracking-wider hidden sm:block text-[11px] mr-3">TERMINAL</span>
        
        {/* Account Selector (Mock) */}
        <div className="relative group cursor-pointer border border-border rounded px-1.5 py-0.5 bg-[#2a2e39] hover:bg-[#131722] flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[9px] leading-tight text-left">
            <span className="text-text-muted">Acc:</span>
            <span className="text-white font-bold">#880192</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>

        {/* Chart Symbol Search Trigger */}
        <button onClick={toggleSymbolSearch} className="ml-3 flex items-center gap-1 text-white bg-[#2a2e39] px-2 py-0.5 rounded border border-border hover:border-text-muted transition-colors group">
          <svg className="text-text-muted group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span className="font-bold text-[10px] tracking-wide">{displaySymbol}</span>
        </button>
        
        {/* Live Ticker in Header */}
        {ticker && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-white font-bold text-[11px] tabular-nums tracking-wide">
              {ticker.price.toFixed(getPrecision(activeSymbol))}
            </span>
            <span className={`text-[9px] font-bold ${ticker.change24h >= 0 ? 'text-up' : 'text-down'}`}>
              {ticker.change24h > 0 ? '+' : ''}{ticker.change24h.toFixed(2)}%
            </span>
          </div>
        )}
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <aside className={`shrink-0 bg-[#1e222d] transition-all duration-300 ease-in-out order-2 lg:order-1 overflow-hidden ${isWatchlistOpen ? 'w-full lg:w-[220px] h-[300px] lg:h-full border-b lg:border-b-0 border-r border-border' : 'w-0 h-0 lg:h-full border-none'}`}>
          <MarketWatch />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 order-1 lg:order-2">
          <main className="flex-1 relative min-h-[350px] lg:min-h-0 bg-[#131722]"><ChartPanel /></main>
          <div className={`shrink-0 flex flex-col transition-all duration-300 overflow-hidden border-t border-border ${isBottomPanelOpen ? 'h-36 md:h-44' : 'h-[28px]'}`}>
            <BottomPanel />
          </div>
        </div>
      </div>

      {/* --- FOOTER STATUS BAR --- */}
      <footer className="h-6 shrink-0 bg-[#1e222d] border-t border-border flex items-center px-2 text-[9px] text-text-muted gap-4 z-20">
        <div className="flex items-center gap-1"><span className="text-white">Bal:</span> {balance.toFixed(2)}</div>
        <div className="flex items-center gap-1"><span className="text-white">Eq:</span> {equity.toFixed(2)}</div>
        <div className="flex items-center gap-1"><span className="text-white">Mar:</span> {marginUsed.toFixed(2)}</div>
        <div className="flex items-center gap-1"><span className="text-white">Free:</span> {freeMargin.toFixed(2)}</div>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-white">PnL:</span> 
          <span className={unrealizedPnl >= 0 ? 'text-up font-bold' : 'text-down font-bold'}>
            {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;