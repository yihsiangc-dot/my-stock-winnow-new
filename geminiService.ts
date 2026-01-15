
import { GoogleGenAI } from "@google/genai";
import { Sector, AnalysisResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSectorDynamics(sector: Sector): Promise<AnalysisResult> {
  const leader = sector.stocks.find(s => s.isLeader) || sector.stocks[0];
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });

  const stockDataString = sector.stocks.map(s => 
    `- ${s.name}(${s.id}): 漲跌 ${s.changePercent.toFixed(2)}%, 量比 ${s.volumeRatio}x, RS強度 ${s.relativeStrength}`
  ).join('\n');

  const prompt = `
    觀測族群：[${sector.name}]
    數據：${stockDataString}
    請分析領頭羊與補漲股動態。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "分析中...";
    return {
      leaderAnalysis: text,
      suggestedLaggards: sector.stocks.filter(s => s.hunterScore > 85).map(s => s.name),
      winProbability: 75,
      riskRewardRatio: "1:2.5",
      reasoning: text
    };
  } catch (error) {
    throw error;
  }
}
