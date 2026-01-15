
# 台股族群獵手 (Taiwan Stock Sector Hunter)

這是一個專業級的台股族群監控儀表板，整合了 **Fugle (富果) API** 的實時行情與 **Google Gemini AI** 的深度市場分析。

## 🚀 快速開始

### 1. 本地開發
```bash
# 安裝相依套件
npm install

# 建立環境變數檔案
echo "API_KEY=您的_GEMINI_API_KEY" > .env

# 啟動開發伺服器
npm run dev
```

### 2. 部署至 Vercel
1. 將此專案推送至 GitHub。
2. 在 Vercel 儀表板點擊 "Add New Project" 並匯入 Repo。
3. **重要**：在 `Environment Variables` 中新增 `API_KEY`。
4. 部署完成後，`/fugle-api` 代理會自動生效，解決 CORS 限制。

## 🛠 技術架構
- **前端**: React 19 + TypeScript + Tailwind CSS
- **AI 分析**: Google Gemini 3.0 Flash (支援 Google Search 真實檢索)
- **行情來源**: 富果 Fugle MarketData API (Snapshot 模式)
- **部署**: Vercel (透過 `vercel.json` 進行 API 重寫代理)

## ⚠️ 注意事項
- 本專案僅供技術交流與研究使用，投資請謹慎評估風險。
- 真實價格功能需在 Vercel 部署環境下運行以避開瀏覽器 CORS 限制。
