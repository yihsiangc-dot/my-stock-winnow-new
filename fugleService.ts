
import { Stock } from "./types";

// 使用您提供的新金鑰
const ENCODED_KEYS = 'ODllZTQxZjgtYzY4ZS00YjQ4LTk0MjEtNzZmODAwODU3ZGVlIDFjNjg1MjNlLTllN2ItNDlhZi05OGZkLTQxZDA3NDhkZmQ0ZA==';

function getApiKeys() {
  try { 
    return atob(ENCODED_KEYS).split(' '); 
  } catch (e) { 
    return []; 
  }
}

const KEYS = getApiKeys();
// 統一使用代理路徑
const BASE_URL = '/fugle-api';

export async function fetchFugleQuotes(symbols: string[]): Promise<Partial<Stock>[]> {
  if (KEYS.length === 0) return [];

  const tryFetch = async (key: string, symbol: string) => {
    // 加上時間戳確保不抓取緩存
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
      for (const key of KEYS) {
        try {
          data = await tryFetch(key, symbol);
          if (data) break;
        } catch (e) {
          continue; 
        }
      }

      if (!data) return null;

      const price = data.lastTrade?.price || data.closePrice || data.previousClose || 0;
      const openPrice = data.openPrice || data.previousClose || price;
      const changePercent = (data.changePercent || 0) * 100;
      
      // 計算「開盤後漲幅」：這能反映開盤 5 分鐘後的真實動能
      const openingFiveMinChange = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : 0;
      
      const totalVolume = data.total?.unit || 0;

      return {
        id: symbol,
        price: price,
        change: data.change || 0,
        changePercent: changePercent,
        openingFiveMinChange: openingFiveMinChange,
        volume: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : `${totalVolume}`,
        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        isRealData: true,
        // 獵人評分邏輯優化：若開盤後持續走強，分數會大幅提高
        hunterScore: Math.min(100, Math.floor(60 + (changePercent * 3) + (openingFiveMinChange * 5)))
      };
    }));

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error("Fugle Sync Failed:", error);
    return [];
  }
}
