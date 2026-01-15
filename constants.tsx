
import { Sector } from './types';

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'us_ai_concepts',
    name: 'AI 巨頭概念 (Server/CSP)',
    totalChangePercent: 2.5,
    phase: 'Advancing',
    rotationRisk: 15,
    marketCorrelation: 0.85,
    stocks: [
      { id: '2382', name: '廣達', price: 320.5, change: 8.5, changePercent: 2.72, volume: '22K', isLeader: true, openingFiveMinChange: 1.5, volumeRatio: 1.8, gapPercent: 1.2, confidenceScore: 60, distributionRisk: 10, isStalling: false, relativeStrength: 1.2, hunterScore: 82, supportPrice: 310, resistancePrice: 335 },
      { id: '2317', name: '鴻海', price: 215.5, change: 4.5, changePercent: 2.13, volume: '85K', isLeader: true, openingFiveMinChange: 1.0, volumeRatio: 1.5, gapPercent: 0.8, confidenceScore: 55, distributionRisk: 12, isStalling: false, relativeStrength: 0.8, hunterScore: 78, supportPrice: 205, resistancePrice: 225 },
      { id: '6669', name: '緯穎', price: 2450, change: 95, changePercent: 4.03, volume: '1,200', isLeader: false, openingFiveMinChange: 2.5, volumeRatio: 3.2, gapPercent: 1.8, confidenceScore: 92, distributionRisk: 15, isStalling: false, relativeStrength: 2.5, hunterScore: 95, supportPrice: 2350, resistancePrice: 2550 },
      { id: '3231', name: '緯創', price: 125.5, change: 3.5, changePercent: 2.87, volume: '45K', isLeader: false, openingFiveMinChange: 1.2, volumeRatio: 2.5, gapPercent: 0.5, confidenceScore: 88, distributionRisk: 20, isStalling: false, relativeStrength: 1.5, hunterScore: 89, supportPrice: 118, resistancePrice: 132 },
    ]
  },
  {
    id: 'thermal_mgmt',
    name: '散熱族群',
    totalChangePercent: 4.2,
    phase: 'Climax',
    rotationRisk: 45,
    marketCorrelation: 0.6,
    stocks: [
      { id: '3017', name: '奇鋐', price: 685, change: 32, changePercent: 4.90, volume: '8,500', isLeader: true, openingFiveMinChange: 3.2, volumeRatio: 4.2, gapPercent: 2.5, confidenceScore: 40, distributionRisk: 65, isStalling: true, relativeStrength: 1.5, hunterScore: 45, supportPrice: 650, resistancePrice: 710 },
      { id: '3324', name: '雙鴻', price: 712, change: 28, changePercent: 4.09, volume: '4,200', isLeader: true, openingFiveMinChange: 2.8, volumeRatio: 3.8, gapPercent: 2.1, confidenceScore: 45, distributionRisk: 55, isStalling: false, relativeStrength: 1.2, hunterScore: 52, supportPrice: 680, resistancePrice: 745 },
      { id: '3338', name: '泰碩', price: 72.5, change: 6.5, changePercent: 9.85, volume: '15K', isLeader: false, openingFiveMinChange: 1.5, volumeRatio: 8.5, gapPercent: 1.2, confidenceScore: 98, distributionRisk: 30, isStalling: false, relativeStrength: 5.2, hunterScore: 92, supportPrice: 68, resistancePrice: 75 },
    ]
  },
  {
    id: 'leo_satellite',
    name: '低軌衛星 (LEO)',
    totalChangePercent: 1.5,
    phase: 'Advancing',
    rotationRisk: 18,
    marketCorrelation: 0.4,
    stocks: [
      { id: '3491', name: '昇達科', price: 285, change: 5.5, changePercent: 1.97, volume: '4,800', isLeader: true, openingFiveMinChange: 1.2, volumeRatio: 1.6, gapPercent: 0.8, confidenceScore: 65, distributionRisk: 15, isStalling: false, relativeStrength: 0.5, hunterScore: 72, supportPrice: 275, resistancePrice: 305 },
      { id: '2312', name: '金寶', price: 32.5, change: 1.2, changePercent: 3.83, volume: '55K', isLeader: false, openingFiveMinChange: 2.1, volumeRatio: 4.5, gapPercent: 1.5, confidenceScore: 90, distributionRisk: 25, isStalling: false, relativeStrength: 2.8, hunterScore: 94, supportPrice: 30, resistancePrice: 35 },
      { id: '6285', name: '啟碁', price: 165.5, change: 2.5, changePercent: 1.53, volume: '3,500', isLeader: false, openingFiveMinChange: 0.5, volumeRatio: 1.1, gapPercent: 0.2, confidenceScore: 70, distributionRisk: 10, isStalling: false, relativeStrength: 0.2, hunterScore: 68, supportPrice: 158, resistancePrice: 175 },
    ]
  }
];

export const COLORS = {
  up: '#ef4444', 
  down: '#22c55e', 
  neutral: '#94a3b8',
  accent: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444'
};
