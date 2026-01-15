
import { Stock } from "./types";

// 使用更新後的雙重備用金鑰
const ENCODED_KEYS = 'ZTU1Y2IxODctYzUxMS00ZjE4LTg3YTMtNmJkNDNkMWJmYWYwIDMzZjc3YTg0LTc5MzMtNGQzOC1hNzlhLTg4M2VkNjI4MjY1MQ==';

function getApiKeys() {
  try { 
    return atob(ENCODED_KEYS).split(' '); 
  } catch (e) { 
    return []; 
  }
}

const KEYS = getApiKeys();
const BASE_URL = '/fugle-api';

export async function fetchFugleQuotes(symbols: string[]): Promise<Partial<Stock>[]> {
  if (KEYS.length === 0) return [];

  // 嘗試使用多把金鑰進行抓取
  const tryFetch = async (key: string, symbol: string) => {
    // 加入時間戳避免快取
    const url = `${BASE_URL}/marketdata/v1.0/stock/intraday/quote/${symbol}?_t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'X-Fugle-Api-Key': key, 
        'Accept': 'application/json' 
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  try {
    const results = await Promise.all(symbols.map(async (symbol) => {
      let data = null;
      // 輪詢金鑰嘗試
      for (const key of KEYS) {
        try {
          data = await tryFetch(key, symbol);
          if (data) break;
        } catch (e) {
          continue; 
        }
      }

      if (!data) return null;

      // 修正：富果 API 在開盤前或收盤後 lastTrade 可能為空，需抓取 closePrice
      const price = data.lastTrade?.price || data.closePrice || data.previousClose || 0;
      const change = data.change || 0;
      const changePercent = (data.changePercent || 0) * 100;
      const totalVolume = data.total?.unit || 0;

      return {
        id: symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : `${totalVolume}`,
        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        isRealData: true,
        // 動態計算獵人評分：漲幅越接近漲停或量能放大的評分越高
        hunterScore: Math.min(100, Math.floor(65 + (changePercent * 4)))
      };
    }));

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error("Fugle Sync Failed:", error);
    return [];
  }
}
