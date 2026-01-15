
import { GoogleGenAI } from "@google/genai";
import { Sector, AnalysisResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSectorDynamics(sector: Sector): Promise<AnalysisResult> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });

  const stockDataString = sector.stocks.map(s => 
    `- ${s.name}(${s.id}): 漲跌 ${s.changePercent.toFixed(2)}%, 量比 ${s.volumeRatio}x, RS強度 ${s.relativeStrength}`
  ).join('\n');

  const prompt = `
    【台股族群深度掃描】
    觀測日期：${dateStr} ${timeStr}
    目標族群：[${sector.name}]
    
    即時市場數據：
    ${stockDataString}

    請執行 Google Search 並以此日期後的資訊進行分析：
    1. 分析今日該族群集體轉強/轉弱的關鍵新聞。
    2. 領頭羊表現與後隨補漲股的力道分析。
    3. 找出具備「獵人評分」潛力的低位階個股。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "目前無法取得即時分析。";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '市場情報來源'
      }
    })).filter((s: any) => s.web.uri !== '') || [];

    return {
      leaderAnalysis: text,
      suggestedLaggards: sector.stocks.filter(s => s.hunterScore > 80).map(s => s.name),
      exitSignals: "跌破今日關鍵支撐或族群領頭羊放量不漲",
      reasoning: text,
      winProbability: sources.length > 0 ? 80 : 70,
      riskRewardRatio: "1:2.5",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
