
import { Stock } from "./types";

// Base64 編碼的金鑰處理
const ENCODED_KEYS = 'MzNmNzdhODQtNzkzMy00ZDM4LWE3OWEtODgzZWQ2MjgyNjUxIGU1NWNiMTg3LWM1MTEtNGYxOC04N2EzLTZiZDQzZDFiZmFmMA==';

function getApiKey() {
  try { 
    return atob(ENCODED_KEYS).split(' ')[0]; 
  } catch (e) { 
    return ''; 
  }
}

const FUGLE_API_KEY = getApiKey();
// 統一使用 /fugle-api，本地由 vite.config.ts 代理，雲端由 vercel.json 代理
const BASE_URL = '/fugle-api';

export async function fetchFugleQuotes(symbols: string[]): Promise<Partial<Stock>[]> {
  if (!FUGLE_API_KEY) {
    console.error("Fugle API Key is missing");
    return [];
  }

  try {
    const results = await Promise.all(symbols.map(async (symbol) => {
      // 使用富果新版行情快照 API
      const url = `${BASE_URL}/marketdata/v1.0/stock/intraday/quote/${symbol}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'X-Fugle-Api-Key': FUGLE_API_KEY, 
          'Accept': 'application/json' 
        }
      });

      if (!response.ok) {
        console.warn(`Fugle API Error [${symbol}]: Status ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      // 解析富果返回的數據結構
      const price = data.lastTrade?.price || data.closePrice || 0;
      const change = data.change || 0;
      const changePercent = (data.changePercent || 0) * 100;
      const volumeUnit = data.total?.unit || 0;

      return {
        id: symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: volumeUnit >= 1000 ? `${(volumeUnit / 1000).toFixed(1)}K` : `${volumeUnit}`,
        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        isRealData: true,
        // 動態計算獵人評分 (簡單範例)
        hunterScore: Math.min(100, Math.floor(70 + (changePercent * 5)))
      };
    }));

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error("Fugle Service Exception:", error);
    return [];
  }
}
