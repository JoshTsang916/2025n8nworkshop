# VibeCoding Prompt: Josh's n8n Workshop Landing Page (GitHub Pages Ready)

請協助我開發一個 **響應式 (RWD) 靜態網站**，用於「n8n 自動化實戰工作坊」報名。
專案結構必須包含三個獨立檔案：`index.html`、`style.css`、`script.js`。
此網站將直接部署於 **GitHub Pages**，請確保不使用任何需要編譯 (Build process) 的框架，僅使用原生 HTML/CSS/JS。

## 1. 檔案結構與技術堆疊
* **index.html**: 頁面結構與內容。
* **style.css**: 樣式表 (可引入 Tailwind CSS CDN 以加速開發，但客製化樣式寫在這裡)。
* **script.js**: 處理動態背景、表單送出邏輯與聊天視窗載入。
* **路徑引用**: 請確保 HTML 中引用 CSS 與 JS 時使用**相對路徑** (`./style.css`, `./script.js`)，以免 GitHub Pages 路徑錯誤。

## 2. 視覺風格 (Visual Identity)
* **主題**: **n8n Workflow Editor** 風格 (Dark Mode)。
* **色票**:
    * 背景色: `#202020` (深灰)
    * 卡片/節點色: `#2D2D2D`
    * 強調色 (Trigger): `#FF6D5A` (n8n 橘紅)
    * 成功色: `#00E676` (螢光綠)
    * 文字: `#FFFFFF` (白) & `#B0B0B0` (淺灰)
* **背景動畫 (重點)**:
    * 請在 `script.js` 中使用 **原生 HTML5 Canvas API** 繪製一個全螢幕背景。
    * 效果：模擬 n8n 的介面，畫面上有多個隨機分佈的微小圓點 (Nodes)，點與點之間若距離夠近則會有細線連接 (Connections)。
    * 動態：這些點會緩慢漂浮，連線會隨著點的移動而生滅，營造「數據流動」的科技感。
    * **限制**: 絕對不要使用 WebGL 或 Three.js 等重型函式庫，僅用 2D Context，確保輕量且在 GitHub Pages 完美運行。

## 3. 頁面內容 (index.html)

### A. Header / Hero
* **主標題**: Josh的 n8n 自動化實戰工作坊 | 用 AI 來創造
* **副標題**: 打造你的 24 小時數位員工，從零開始的自動化實戰。

### B. 資訊卡片 (Info Section)
* 設計成類似 n8n 的「Note」節點樣式。
* 內容：
    * 📅 **時間**: 2025年 (待定)
    * 📍 **地點**: (待定)
    * ⚠️ **課前須知**: 「本課程包含預錄影片作業，報名後請務必檢查信箱並於課前完成設定。」

### C. 報名表單 (Form Section)
* 外觀模仿 n8n 的 **Webhook 節點** 參數設定面板。
* **欄位**:
    1.  `name`: 姓名 (必填)
    2.  `email`: Email (必填)
    3.  `job` : 目前職業
    4. `problem`:  想解決的問題 (必填)
* **按鈕**: "Execute Workflow" 風格按鈕，文字為「確認報名」。

### D. 嵌入式 Chat (右下角)
* 預留一個 `div` 或直接在 JS 動態載入 n8n Chat 腳本。

## 4. 功能邏輯 (script.js)

### A. 背景動畫
* 實作上述的 Canvas 粒子連線動畫。

### B. 表單提交 (AJAX)
* 監聽表單 submit 事件，阻擋預設跳轉。
* 顯示 Loading 狀態 (按鈕變暗或出現轉圈動畫)。
* 將資料轉為 JSON，使用 `fetch()` 發送 **POST** 請求。
* **Webhook URL 設定**: 在 `script.js` 最上方定義常數 `const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL';` 以便修改。
* **成功處理**: 隱藏表單，顯示綠色的「成功節點」樣式訊息：「報名成功！請前往信箱查看通知。」
* **失敗處理**: 顯示錯誤提示。

### C. Chat 載入
* 在 `script.js` 最上方定義常數 `const CHAT_WEBHOOK_URL = 'YOUR_CHAT_WEBHOOK_URL';`。
* 動態插入 n8n 官方 Chat 嵌入程式碼 (如果有的話)，並套用該 URL。

## 5. 輸出要求
請分別提供 `index.html`, `style.css`, `script.js` 的完整程式碼，不要省略。