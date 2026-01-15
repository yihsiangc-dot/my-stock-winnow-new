
import { Stock } from "./types";

const ENCODED_KEYS = 'MzNmNzdhODQtNzkzMy00ZDM4LWE3OWEtODgzZWQ2MjgyNjUxIGU1NWNiMTg3LWM1MTEtNGYxOC04N2EzLTZiZDQzZDFiZmFmMA==';

function getApiKey() {
  try { return atob(ENCODED_KEYS).split(' ')[0]; } catch (e) { return ''; }
}

const FUGLE_API_KEY = getApiKey();
const BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'https://api.fugle.tw'
  : '/fugle-api';

export async function fetchFugleQuotes(symbols: string[]): Promise<Partial<Stock>[]> {
  if (!FUGLE_API_KEY) return [];
  try {
    const results = await Promise.all(symbols.map(async (symbol) => {
      const url = `${BASE_URL}/marketdata/v1.0/stock/intraday/quote/${symbol}`;
      const response = await fetch(url, {
        headers: { 'X-Fugle-Api-Key': FUGLE_API_KEY, 'Accept': 'application/json' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: symbol,
        price: data.lastTrade?.price || data.closePrice || 0,
        change: data.change || 0,
        changePercent: (data.changePercent || 0) * 100,
        volume: data.total?.unit ? `${(data.total.unit / 1000).toFixed(1)}K` : '0K',
        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        isRealData: true
      };
    }));
    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) { return []; }
}
