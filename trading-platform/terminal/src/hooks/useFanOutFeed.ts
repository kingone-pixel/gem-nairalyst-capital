// terminal/src/hooks/useFanOutFeed.ts
import { useEffect, useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

export function useFanOutFeed() {
  const watchlist = useMarketStore((state) => state.watchlist);
  const batchUpdateWatchlist = useMarketStore((state) => state.batchUpdateWatchlist);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');

  useEffect(() => {
    // ⚠️ REPLACE THIS WITH YOUR ACTUAL CODESPACE PORT 8080 URL
    const WS_URL = 'wss://improved-space-dollop-7rwwgj7w79gcx675-8080.app.github.dev'; 
    
    console.log(`🔌 Attempting to connect to backend: ${WS_URL}`);
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✅ Connected to your Node.js Backend!');
      setStatus('connected');
      const symbolsToWatch = watchlist.map((w) => w.symbol);
      ws.send(JSON.stringify({ type: 'subscribe', symbols: symbolsToWatch }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol && data.price) {
        batchUpdateWatchlist({ [data.symbol]: data.price });
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
      setStatus('failed');
    };

    ws.onclose = () => {
      setStatus('failed');
    }

    return () => ws.close();
  }, [watchlist.length, batchUpdateWatchlist]); 

  return status; // <-- Return the status
}