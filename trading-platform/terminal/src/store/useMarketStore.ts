import { create } from 'zustand';

export interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
}

export interface WatchlistItem {
  symbol: string;
  displaySymbol: string;
  description: string;
  price: number;
  change24h: number;
  type: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  sl?: number; // NEW
  tp?: number; // NEW
}

export interface HistoryItem {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  time: string;
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'EURUSD', displaySymbol: 'EUR/USD', description: 'Euro vs US Dollar', price: 1.0924, change24h: 0.12, type: 'forex' },
  { symbol: 'GBPUSD', displaySymbol: 'GBP/USD', description: 'British Pound vs US Dollar', price: 1.2645, change24h: -0.05, type: 'forex' },
  { symbol: 'USDJPY', displaySymbol: 'USD/JPY', description: 'US Dollar vs Japanese Yen', price: 151.23, change24h: 0.34, type: 'forex' },
  { symbol: 'AUDCAD', displaySymbol: 'AUD/CAD', description: 'Australian Dollar vs Canadian Dollar', price: 0.8850, change24h: 0.15, type: 'forex' },
  { symbol: 'AUDCHF', displaySymbol: 'AUD/CHF', description: 'Australian Dollar vs Swiss Franc', price: 0.5840, change24h: -0.12, type: 'forex' },
  { symbol: 'AUDJPY', displaySymbol: 'AUD/JPY', description: 'Australian Dollar vs Japanese Yen', price: 98.50, change24h: 0.45, type: 'forex' },
  { symbol: 'XAUUSD', displaySymbol: 'XAU/USD', description: 'Gold vs US Dollar', price: 2165.50, change24h: 1.20, type: 'metal' },
  { symbol: 'BTCUSD', displaySymbol: 'BTC/USD', description: 'Bitcoin vs US Dollar', price: 65019.52, change24h: 1.82, type: 'crypto' },
  { symbol: 'ETHUSD', displaySymbol: 'ETH/USD', description: 'Ethereum vs US Dollar', price: 3512.40, change24h: -0.45, type: 'crypto' },
];

interface MarketState {
  activeSymbol: string;
  ticker: TickerData | null;
  watchlist: WatchlistItem[];
  favorites: string[];
  isWatchlistOpen: boolean;
  isBottomPanelOpen: boolean;
  isSymbolSearchOpen: boolean;
  
  balance: number;
  positions: Position[];
  history: HistoryItem[];
  
  setSymbol: (symbol: string) => void;
  updateTicker: (data: TickerData) => void;
  setWatchlist: (list: WatchlistItem[]) => void;
  batchUpdateWatchlist: (updates: Record<string, number>) => void;
  toggleFavorite: (symbol: string) => void;
  toggleWatchlist: () => void;
  toggleBottomPanel: () => void;
  toggleSymbolSearch: () => void;
  placeOrder: (side: 'buy' | 'sell', size: number, price: number, sl?: number, tp?: number) => void;
  modifyPosition: (id: string, sl?: number, tp?: number) => void; // NEW
  closePosition: (id: string, currentPrice: number) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  activeSymbol: 'EURUSD',
  ticker: null,
  isWatchlistOpen: true,
  isBottomPanelOpen: true,
  isSymbolSearchOpen: false,
  favorites: ['EURUSD', 'BTCUSD', 'XAUUSD'],
  watchlist: DEFAULT_WATCHLIST,
  balance: 10000,
  positions: [],
  history: [],

  setSymbol: (symbol) => set({ activeSymbol: symbol }),
  updateTicker: (data) => set({ ticker: data }),
  setWatchlist: (list) => set({ watchlist: list }),
  
  batchUpdateWatchlist: (updates) => set((state) => ({
    watchlist: state.watchlist.map(item => 
      updates[item.symbol] !== undefined ? { ...item, price: updates[item.symbol] } : item
    )
  })),

  toggleWatchlist: () => set((state) => ({ isWatchlistOpen: !state.isWatchlistOpen })),
  toggleBottomPanel: () => set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  toggleSymbolSearch: () => set((state) => ({ isSymbolSearchOpen: !state.isSymbolSearchOpen })),
  
  toggleFavorite: (symbol) => set((state) => ({
    favorites: state.favorites.includes(symbol)
      ? state.favorites.filter(f => f !== symbol)
      : [...state.favorites, symbol]
  })),
  
  placeOrder: (side, size, price, sl, tp) => set((state) => {
    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: state.activeSymbol,
      side,
      size,
      entryPrice: price,
      sl,
      tp
    };
    const marginRequired = size * 1000; 
    if (state.balance < marginRequired) {
      alert("Insufficient margin!");
      return state;
    }
    return { positions: [newPosition, ...state.positions], balance: state.balance - marginRequired };
  }),

  // NEW: Modify SL/TP
  modifyPosition: (id, sl, tp) => set((state) => ({
    positions: state.positions.map(p => p.id === id ? { ...p, sl, tp } : p)
  })),

  closePosition: (id, currentPrice) => set((state) => {
    const pos = state.positions.find(p => p.id === id);
    if (!pos) return state;
    const isForex = !pos.symbol.includes('BTC') && !pos.symbol.includes('ETH') && !pos.symbol.includes('US500');
    const multiplier = isForex ? 100000 : 1; 
    const priceDiff = pos.side === 'buy' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    const realizedPnl = priceDiff * pos.size * multiplier;
    const marginRefund = pos.size * 1000;
    const historyItem: HistoryItem = {
      id: pos.id, symbol: pos.symbol, side: pos.side, size: pos.size, entryPrice: pos.entryPrice, exitPrice: currentPrice, pnl: realizedPnl, time: new Date().toLocaleTimeString(),
    };
    return { positions: state.positions.filter((p) => p.id !== id), balance: state.balance + marginRefund + realizedPnl, history: [historyItem, ...state.history] };
  }),
}));