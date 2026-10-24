// src/lib/vibeDatafeed.ts
import { getPrecision } from '../utils/formatters';

export function createDatafeed(getCurrentPrice: () => number) {
  return {
    // 1. Tell the chart what timeframes are supported
    onReady: (callback: (config: any) => void) => {
      setTimeout(() => {
        callback({
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
          exchanges: [{ value: 'SIM', name: 'Terminal', desc: 'Terminal Data' }],
          symbols_types: [{ name: 'All', value: 'all' }],
        });
      }, 0);
    },

    // 2. Provide metadata for the active symbol (precision, session, etc.)
    resolveSymbol: (symbolName: string, onResolve: (info: any) => void) => {
      const precision = getPrecision(symbolName);
      // Convert precision to pricescale (e.g., 5 decimals = 100000)
      const pricescale = Math.pow(10, precision);

      onResolve({
        name: symbolName,
        ticker: symbolName,
        description: symbolName,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: 'SIM',
        listed_exchange: 'SIM',
        format: 'price',
        minmov: 1,
        pricescale: pricescale,
        has_intraday: true,
        has_daily: true,
        supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
      });
    },

    // 3. Fetch historical bars (initial load & scroll back)
    getBars: (symbolInfo: any, resolution: string, periodParams: any, onResult: any) => {
      try {
        const to = periodParams?.to || Math.floor(Date.now() / 1000);
        const countBack = periodParams?.countBack || 300;
        const precision = getPrecision(symbolInfo.name);
        
        // Anchor historical data to the REAL current price!
        let basePrice = getCurrentPrice() || (precision === 2 ? 100 : 1.0);
        if (isNaN(basePrice) || basePrice === 0) basePrice = 1.09240;

        // Calculate seconds per bar based on timeframe
        let secPerBar = 60;
        if (resolution === '5') secPerBar = 300;
        if (resolution === '15') secPerBar = 900;
        if (resolution === '30') secPerBar = 1800;
        if (resolution === '60') secPerBar = 3600;
        if (resolution === '240') secPerBar = 14400;
        if (resolution === '1D') secPerBar = 86400;

        const bars: any[] = [];
        let currentPrice = basePrice;

        for (let i = countBack; i >= 0; i--) {
          const barTime = (to - i * secPerBar) * 1000; // Must be in milliseconds
          
          // Generate history backwards from the current real price
          const open = currentPrice;
          const close = open - (Math.random() - 0.5) * (basePrice * 0.002);
          const high = Math.max(open, close) + Math.random() * (basePrice * 0.001);
          const low = Math.min(open, close) - Math.random() * (basePrice * 0.001);

          bars.push({ 
            time: barTime, 
            open, 
            high, 
            low, 
            close, 
            volume: Math.random() * 1000 + 100 
          });
          
          currentPrice = close;
        }
        
        onResult(bars, { noData: false });
      } catch (error) {
        console.error("Error generating bars:", error);
        onResult([], { noData: true });
      }
    },

    // 4. Subscribe to real-time updates
    subscribeBars: (symbolInfo: any, resolution: string, onTick: (bar: any) => void, subscriberUID: string) => {
      // Poll the Zustand store for the live price every 100ms
      const interval = setInterval(() => {
        try {
          const currentPrice = getCurrentPrice();
          if (!currentPrice || isNaN(currentPrice)) return;

          const barTime = Math.floor(Date.now() / 60000) * 60000; // Current minute
          
          // Small wicks for realism on the live tick
          const volatility = currentPrice * 0.0001; 

          onTick({
            time: barTime,
            open: currentPrice - volatility,
            high: currentPrice + volatility,
            low: currentPrice - volatility,
            close: currentPrice,
            volume: Math.random() * 100 + 10,
          });
        } catch (err) {
          console.error("Tick error:", err);
        }
      }, 100); // 100ms tick rate for smooth updating

      // Store interval ID so it can be cleaned up
      (window as any)[`_vibe_sub_${subscriberUID}`] = interval;
    },

    // 5. Clean up the subscription when switching symbols
    unsubscribeBars: (subscriberUID: string) => {
      const interval = (window as any)[`_vibe_sub_${subscriberUID}`];
      if (interval) {
        clearInterval(interval);
        delete (window as any)[`_vibe_sub_${subscriberUID}`];
      }
    },
  };
}