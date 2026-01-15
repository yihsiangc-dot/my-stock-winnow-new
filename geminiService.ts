
import { GoogleGenAI } from "@google/genai";
import { Sector, AnalysisResult } from "./types";

// 必須使用 named parameter 初始化，並直接從環境變數讀取 API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSectorDynamics(sector: Sector): Promise<AnalysisResult> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });

  const stockDataString = sector.stocks.map(s => 
    `- ${s.name}(${s.id}): 漲跌 ${s.changePercent.toFixed(2)}%, 量比 ${s.volumeRatio}x, RS強度 ${s.relativeStrength}`
  ).join('\n');

  const prompt = `
    【台股族群監控分析】
    當前時間：${dateStr} ${timeStr}
    族群：[${sector.name}]
    
    即時行情：
    ${stockDataString}

    請利用 Google Search 執行深度分析：
    1. 分析今日族群走勢的核心動能。
    2. 找出具備補漲潛力的個股。
    3. 提供短線操作建議。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // 使用最新穩定模型
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // 正確訪問 .text 屬性 (Getter)
    const text = response.text || "無法取得分析內容。";
    
    // 提取搜尋接地來源 (Grounding)
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '參考來源'
      }
    })).filter((s: any) => s.web.uri !== '') || [];

    return {
      leaderAnalysis: text,
      suggestedLaggards: sector.stocks.filter(s => s.hunterScore > 80).map(s => s.name),
      exitSignals: "跌破開盤價或領頭羊轉弱",
      reasoning: text,
      winProbability: sources.length > 0 ? 80 : 65,
      riskRewardRatio: "1:2.5",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
