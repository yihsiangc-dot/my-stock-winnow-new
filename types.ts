
export interface Stock {
  id: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  isLeader: boolean;
  openingFiveMinChange: number;
  volumeRatio: number;      
  gapPercent: number;       
  confidenceScore: number;  
  distributionRisk: number; 
  isStalling: boolean;      
  relativeStrength: number; 
  hunterScore: number;      
  supportPrice: number;     
  resistancePrice: number;
  // 新增狀態追蹤
  lastUpdated?: string;     
  isRealData?: boolean;
}

export type SectorPhase = 'Accumulation' | 'Advancing' | 'Climax' | 'Distribution';

export interface Sector {
  id: string;
  name: string;
  stocks: Stock[];
  totalChangePercent: number;
  phase: SectorPhase;       
  rotationRisk: number;     
  marketCorrelation: number;
}

export interface AnalysisResult {
  leaderAnalysis: string;
  suggestedLaggards: string[];
  exitSignals?: string;      
  reasoning: string;
  winProbability: number;
  riskRewardRatio: string;
  sources?: { web: { uri: string; title: string } }[];
}
