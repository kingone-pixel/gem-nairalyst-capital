// src/utils/symbols.ts
export const FOREX_MAJORS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'
];

export const FOREX_MINORS = [
  'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD',
  'GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD',
  'AUD/JPY', 'AUD/CHF', 'AUD/CAD', 'AUD/NZD',
  'CAD/JPY', 'CAD/CHF', 'CHF/JPY', 'NZD/JPY'
];

export const FOREX_EXOTICS = [
  'USD/TRY', 'USD/ZAR', 'USD/MXN', 'USD/SGD', 'USD/HKD', 'USD/NOK', 'USD/SEK',
  'EUR/TRY', 'EUR/ZAR', 'EUR/PLN', 'EUR/HUF', 'EUR/CZK'
];

export const METALS = ['XAU/USD', 'XAG/USD'];
export const CRYPTO = ['BTC/USD', 'ETH/USD'];

export const ALL_SYMBOLS = [
  ...FOREX_MAJORS, ...FOREX_MINORS, ...FOREX_EXOTICS, ...METALS, ...CRYPTO
];