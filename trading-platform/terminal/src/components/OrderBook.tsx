import { useMarketStore } from '../store/useMarketStore';

function generateOrders(currentPrice: number, type: 'bid' | 'ask') {
  const orders = [];
  let total = 0;
  
  for (let i = 1; i <= 10; i++) {
    const priceOffset = i * 5; 
    const price = type === 'bid' ? currentPrice - priceOffset : currentPrice + priceOffset;
    const size = Math.random() * 2.4 + 0.1; 
    total += size;
    orders.push({ price, size, total });
  }
  if (type === 'ask') return orders.reverse();
  return orders;
}

export function OrderBook() {
  const ticker = useMarketStore((state) => state.ticker);
  const currentPrice = ticker?.price || 65000;

  const asks = generateOrders(currentPrice, 'ask');
  const bids = generateOrders(currentPrice, 'bid');
  
  const maxTotal = Math.max(
    asks[asks.length - 1]?.total || 1, 
    bids[bids.length - 1]?.total || 1
  );

  return (
    <div className="flex flex-col h-full bg-bg-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-[10px] text-text-muted uppercase tracking-wider shrink-0">
        <span className="w-1/3 text-left">Price</span>
        <span className="w-1/3 text-right">Size</span>
        <span className="w-1/3 text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex-1 flex flex-col justify-end pb-1 overflow-hidden">
        {asks.map((ask, i) => (
          <div key={`ask-${i}`} className="relative flex items-center justify-between px-3 py-[2px] text-[11px] tabular-nums">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-down/10 pointer-events-none" 
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <span className="relative w-1/3 text-left text-down">{ask.price.toFixed(2)}</span>
            <span className="relative w-1/3 text-right text-text-primary">{ask.size.toFixed(4)}</span>
            <span className="relative w-1/3 text-right text-text-muted">{ask.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="py-1.5 border-y border-border flex items-center justify-between px-3 bg-bg-elevated shrink-0">
        <span className={`font-bold text-base tabular-nums ${ticker && ticker.change24h >= 0 ? 'text-up' : 'text-down'}`}>
          {currentPrice.toFixed(2)}
        </span>
        <span className="text-[10px] text-text-muted">Spread: ~0.01</span>
      </div>

      {/* Bids */}
      <div className="flex-1 pt-1 overflow-hidden">
        {bids.map((bid, i) => (
          <div key={`bid-${i}`} className="relative flex items-center justify-between px-3 py-[2px] text-[11px] tabular-nums">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-up/10 pointer-events-none" 
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <span className="relative w-1/3 text-left text-up">{bid.price.toFixed(2)}</span>
            <span className="relative w-1/3 text-right text-text-primary">{bid.size.toFixed(4)}</span>
            <span className="relative w-1/3 text-right text-text-muted">{bid.total.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}