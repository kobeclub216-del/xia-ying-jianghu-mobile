# A4-59-B｜正式整合前的素材與存檔盤點

基準：A4-58 commit `f5b3cb1a1ec21a2f4a1bc55154ccbee01a814917`。正式 `main` 保持不變。

## 已查證的程式入口
- `index.html`：原有角色建立使用 `#creator`、`#nameInput`、`.classBtn`、`#startBtn`；目前只有姓名和職業，沒有性別欄位。
- `home.js`：`homeNew` 會顯示原有創角視窗；`homeContinue` 載入舊存檔；`persist()` 每兩秒寫入 `xiaying-jianghu-mobile:save`，並檢查跨分頁寫入衝突。
- `window.jianghuGame.snapshot()/restore()` 已提供既有遊戲狀態介面；目前未記錄性別。
- 原版職業起始裝備：劍俠 `獵戶...` 以實際 `jobProfiles` 為準（程式中：劍俠、遊俠、武者分別使用劍、弓、長槍）；禁止重新定義數值。
- 既有角色繪製由不同職業的 sprite sheet 與動作幀表負責，`spriteZoom=1.18`；預覽須使用同一套素材及幀表，不能以 emoji 或概念圖取代正式人物。

## 確認可見的男性素材
- `assets/swordsman-a430.webp`
- `assets/swordsman-dodge.webp`
- `assets/swordsman-skills.webp`
- `assets/class-hurt-a437.webp`
- 其他職業素材及幀表須逐一按 `index.html` 現行載入路徑核對後才接線。

## 下一階段實作約束
1. 建立獨立的角色選擇與創角頁；沿用白天山水背景、黑金視窗邊框及既定字體圖示。不得使用 `a4-59-preview.html` 中的 emoji 當正式圖示。
2. 三個角色欄位以穩定 slot ID 管理。姓名去空白、長度與重名檢查；性別及職業建立後固定。
3. 存檔 schema 使用新的命名空間；原 `xiaying-jianghu-mobile:save` 視為唯讀舊存檔，經驗證與複製成功前不得刪除。
4. 每個角色的遊戲快照獨立保存；切換時驗證快照、確保當前存檔寫入成功才切換。避免以單一 `storedSave` 值混用三角色。
5. 新增女性角色須補齊三職業完整幀表（待機、行走、攻擊、受擊、閃避、武學），尺寸、地面定位、方向與命中判定依現有男性動畫校準。未完成的女性素材不可標為已實裝。
6. 測試 iPhone Safari 橫向、觸控、輸入鍵盤、角色刪除、三槽隔離、重新載入、舊存檔轉移；通過後才合併 `main`。

## 目前完成範圍
- `a4-59-preview.html`：獨立可操作介面草稿，無正式存檔寫入；角色圖示仍是佔位符，僅用於流程測試。
- 正式遊戲的三角色儲存、女性動畫、首頁跳轉 **尚未實裝**。
