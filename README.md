# Fearyn Machining Intelligence Demo

Fearyn.ai 多模態 AI 加工監測平台的互動式產品 demo。以既有 CONGSENSE 行動監控功能為基礎，擴充為可橫跨教學現場與加工廠的完整 SaaS 操作介面。

## 技術棧

- Vite 8 + React 19 + TypeScript 6
- Tailwind CSS 4
- Zod 4（領域資料與表單邊界驗證）
- Zustand 5（依 bounded context 拆分狀態）
- React Router 7（Hash Router，支援靜態網站部署）
- Lucide React
- Vitest + Testing Library

## Demo 功能

- **Demo 登入**：Zod 表單驗證、前端加鹽雜湊與工作階段保護
- **機台總覽**：跨機台 KPI、風險排序與現場洞察
- **機台監控**：搜尋、場域／狀態篩選、即時波形、感測層健康與巡檢任務
- **分析中心**：OEE、可用率、品質、能耗、機台比較與 CSV 匯出
- **告警中心**：事件分級、認領、處置與 Zod 驗證結案流程

## 開始使用

需求：Node.js 24 與 pnpm 9。

```sh
pnpm install
pnpm dev
```

開啟 `http://localhost:4173`。

## 品質檢查

```sh
pnpm test
pnpm lint
pnpm build
```

## 專案結構

```text
src/
├── app/                       # 路由、導覽與 application shell
├── domains/
│   ├── machines/              # 機台資產與狀態
│   ├── monitoring/            # 即時遙測與波形
│   ├── alerts/                # 事件生命週期
│   └── analytics/             # 艦隊層級衍生指標
├── pages/                     # 頁面組裝層，不擁有領域規則
├── shared/                    # 無業務語意的 UI 與工具
└── test/                      # 測試環境設定
```

詳細依賴規則與領域語言請參考 [ARCHITECTURE.md](ARCHITECTURE.md)。視覺決策保存在 [design-system/fearyn-machining-intelligence/MASTER.md](design-system/fearyn-machining-intelligence/MASTER.md)。

## Demo 資料

目前資料由各 bounded context 的 `data/` adapter 提供，進入領域前一律經 Zod schema 驗證。串接正式 API 時，只需替換 adapter，不需修改頁面與 UI 元件。

## 部署

推送至 `main` 後，GitHub Actions 會執行測試、Lint、建置並部署 GitHub Pages。正式網址為 `https://dashboard.fearyn.com`。