import { METALS, CRYPTO } from './symbols';

export type AssetType = 'forex' | 'crypto' | 'metal';

export function getAssetType(symbol: string): AssetType {
  if (CRYPTO.includes(symbol)) return 'crypto';
  if (METALS.includes(symbol)) return 'metal';
  return 'forex';
}

export function getPrecision(symbol: string): number {
  const type = getAssetType(symbol);
  if (type === 'crypto' || type === 'metal') return 2;
  if (symbol.includes('JPY')) return 3;
  if (symbol.includes('TRY') || symbol.includes('ZAR') || symbol.includes('MXN')) return 4;
  return 5;
}

export function getVolatility(symbol: string): number {
  const type = getAssetType(symbol);
  if (type === 'crypto') return 50; 
  if (type === 'metal') return 1.5;
  if (symbol.includes('JPY')) return 0.05;
  return 0.0005;
}

export function getVolumeLabel(symbol: string): string {
  const type = getAssetType(symbol);
  if (type === 'crypto') return `Volume (${symbol.split('/')[0]})`;
  if (type === 'metal') return 'Volume (oz)';
  return 'Volume (Lots)';
}

// 💰 HOUSE EDGE: SPREAD MARKUP LOGIC
export function getSpread(symbol: string): number {
  const type = getAssetType(symbol);
  const precision = getPrecision(symbol);
  
  // 1. Raw spread from Liquidity Provider
  let rawSpreadPips = 0.1; 

  // 2. Your Markup (Change this to increase your profit)
  const markupPips = 1.5; // 1.5 pips markup on Standard accounts
  
  const totalSpreadPips = rawSpreadPips + markupPips;
  
  // 3. Convert to price format
  if (type === 'forex' && !symbol.includes('JPY')) {
    return totalSpreadPips * 0.0001; // e.g., EURUSD
  }
  if (type === 'forex' && symbol.includes('JPY')) {
    return totalSpreadPips * 0.01; // e.g., USDJPY
  }
  if (type === 'crypto') {
    return totalSpreadPips * 5; // e.g., $5 on BTC
  }
  if (type === 'metal') {
    return totalSpreadPips * 0.50; // e.g., $0.50 on Gold
  }
  return Math.pow(10, -precision) * 2;
}