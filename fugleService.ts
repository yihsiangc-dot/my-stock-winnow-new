
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
const BASE_URL = '/fugle-api';

export async function fetchFugleQuotes(symbols: string[]): Promise<Partial<Stock>[]> {
  if (KEYS.length === 0) return [];

  const tryFetch = async (key: string, symbol: string) => {
    // 增加 _t 避免瀏覽器快取
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

      // 抓取現價：優先抓 lastTrade，若收盤則抓 closePrice
      const price = data.lastTrade?.price || data.closePrice || data.previousClose || 0;
      const openPrice = data.openPrice || data.previousClose || price;
      const changePercent = (data.changePercent || 0) * 100;
      
      // 開盤強弱 (Opening Momentum) = (現價 - 開盤價) / 開盤價
      // 這能反應開盤 5-30 分鐘後的真實動能，而非僅看昨收對比
      const openingChange = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : 0;
      
      const totalVolume = data.total?.unit || 0;

      return {
        id: symbol,
        price: price,
        change: data.change || 0,
        changePercent: changePercent,
        openingFiveMinChange: openingChange,
        volume: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : `${totalVolume}`,
        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        isRealData: true,
        // 獵人評分：權重包含開盤後的延續性
        hunterScore: Math.min(100, Math.floor(65 + (changePercent * 2) + (openingChange * 5)))
      };
    }));

    const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);
    console.debug(`Synced ${validResults.length} stocks successfully.`);
    return validResults;
  } catch (error) {
    console.error("Fugle Sync Final Failed:", error);
    return [];
  }
}
