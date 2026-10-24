// src/hooks/useBiquoteFeed.ts
import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { useMarketStore } from '../store/useMarketStore';

export function useBiquoteFeed() {
  const activeSymbol = useMarketStore((state) => state.activeSymbol);
  const watchlist = useMarketStore((state) => state.watchlist);
  const batchUpdateWatchlist = useMarketStore((state) => state.batchUpdateWatchlist);
  const updateTicker = useMarketStore((state) => state.updateTicker);

  useEffect(() => {
    let connection: signalR.HubConnection;

    const init = async () => {
      try {
        // 1. Build the connection with the correct URL
        connection = new signalR.HubConnectionBuilder()
          .withUrl('https://biquote.io/hubs/tick')
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information) // See connection logs in console
          .build();

        // 2. Listen for the CORRECT event name: 'ReceiveTick'
        connection.on('ReceiveTick', (tick: any) => {
          const symbol = tick.s; // The tick object uses 's' for symbol
          if (!symbol) return;

          // 3. For Forex and Metals, use 'mid'. Do NOT use 'last' (it's always 0 for FX).
          const price = tick.mid;
          
          if (price && !isNaN(price)) {
            batchUpdateWatchlist({ [symbol]: price });

            if (symbol === activeSymbol) {
              updateTicker({
                symbol: activeSymbol,
                price: price,
                change24h: tick.dayDiffPercent || 0,
              });
            }
          }
        });

        // 4. Start the connection
        await connection.start();
        console.log('✅ Biquote SignalR Connected.');

        // 5. Subscribe to all symbols in the watchlist
        const symbolsToSubscribe = watchlist.map(w => w.symbol);
        if (symbolsToSubscribe.length > 0) {
          await connection.invoke('Subscribe', symbolsToSubscribe);
          console.log(`Subscribed to: ${symbolsToSubscribe.join(', ')}`);
        }

      } catch (err) {
        console.error('❌ Biquote Connection Error:', err);
      }
    };

    init();

    return () => {
      if (connection) connection.stop();
    };
  }, [activeSymbol, batchUpdateWatchlist, updateTicker, watchlist.length]);
}