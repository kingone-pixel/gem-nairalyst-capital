// src/components/ChartPanel.tsx
import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { createDatafeed } from '../lib/vibeDatafeed';
import * as VibeChart from 'vibechart';

export function ChartPanel() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const activeSymbol = useMarketStore((state) => state.activeSymbol);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    try {
      const ChartClass = (VibeChart as any).Chart || (VibeChart as any).default || (window as any).Chart;
      
      if (!ChartClass) throw new Error("VibeChart library not loaded properly.");

      const chart = new ChartClass({
        container: chartContainerRef.current,
        datafeed: createDatafeed(() => useMarketStore.getState().ticker?.price || 0),
        symbol: activeSymbol,
        interval: '60',
        theme: 'dark',
        // studies: [...] REMOVED! The chart will now start completely clean.
      });

      return () => {
        if (chart && typeof chart.destroy === 'function') chart.destroy();
      };
    } catch (error) {
      console.error("Chart failed:", error);
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = `<div style="color:red; padding:20px;">Chart error. Check console.</div>`;
      }
    }
  }, [activeSymbol]);

  return <div ref={chartContainerRef} className="w-full h-full relative" />;
}