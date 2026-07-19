export type MissionResult = { title:string; quote:string; result:string; resource:string; tag:string; lesson:string };
export type MissionFollowup = { alert:string; question:string; options:[string,string,string]; best:number };

export const missionFollowups:Record<string,MissionFollowup>={
  "A7-LSS-043":{alert:"備用 O₂-B 顯示正常，但主感測器仍持續下降",question:"Cassian 已打開過濾器維修面板，是否立即阻止拆卸？",options:["立即停止拆卸，先鎖定主感測器故障","允許拆卸過濾器確認","關閉備用感測器重新測量"],best:0},
  "A7-SWX-118":{alert:"第一份召回封包遺失 28%，Cassian 只收到『完成…返回』",question:"太陽風鋒面還有六分鐘抵達，如何補救？",options:["雙頻重送三步驟撤離代碼","等待 Cassian 回覆確認","允許完成校準量測後撤離"],best:0},
  "A7-ANO-231":{alert:"第三次被動觀測後，未知訊號提前 11 秒回應",question:"訊號可能正在回應 Aurora-7，下一步是？",options:["保持距離、封存原始資料並停止主動雷達","立即發送數學序列","讓 Aurora-7 低速接近亮點"],best:0},
  "A7-NAV-274":{alert:"NAV-AI 發現第二顆碎片，原點火方案需增加 0.6 秒",question:"Cassian 反應測試已低於安全門檻，是否交回人工控制？",options:["維持 AI 接管並更新避碰脈衝","交由 Cassian 手動修正","停止點火等待地球重算"],best:0},
  "A7-PWR-317":{alert:"BATT-3 隔離後溫度仍上升，家庭語音通道等待供電",question:"剩餘電力只能支援一項非生命系統，如何分配？",options:["保留返航導航並排程 15 KB 緊急語音","恢復全部樣本冷藏","維持高功率即時家庭視訊"],best:0},
};

export const missionResults:Record<string,{best:MissionResult;partial:MissionResult}>={
  "A7-LSS-043":{
    best:{title:"主感測器故障已確認",quote:"備用感測器顯示 20.8%，艙壓與 CO₂ 都正常。你替我避開了一次不必要的拆卸。謝謝，Control。",result:"完全成功",resource:"電力 −2%",tag:"識破感測器誤報",lesson:"多源交叉比對排除了假警報，Cassian 沒有在疲勞狀態下冒險拆卸。"},
    partial:{title:"氧氣異常暫時受控",quote:"讀數穩住了，但我們耗掉更多電力，也還不能完全確定主感測器是否可靠。",result:"部分成功",resource:"電力 −7%",tag:"保守隔離",lesson:"任務安全完成，但缺少交叉證據使後續維修成本增加。"}},
  "A7-SWX-118":{
    best:{title:"Cassian 已進入輻射避難區",quote:"雙頻封包缺了幾段，但撤離順序重複得很清楚。我在風暴抵達前關上了氣閘。",result:"完全成功",resource:"校準資料已封存",tag:"風暴前撤離",lesson:"簡短、重複且有順序的指令在封包遺失時仍能正確執行。"},
    partial:{title:"撤離完成但暴露量升高",quote:"我把最後一組校準值存好才返回。設備一直正常，但醫療系統要求我接受輻射觀察。",result:"代價成功",resource:"健康 −9%",tag:"有限輻射暴露",lesson:"任務保存了例行校準資料，但延後撤離增加了船員健康風險。"}},
  "A7-ANO-231":{
    best:{title:"未知訊號已完成三次驗證",quote:"它不是儀器雜訊。每次被動觀測後，它都在七十三秒再次出現；原始資料已封存。",result:"重大發現",resource:"機密完整度 A",tag:"第二顆星",lesson:"保存原始資料與重複觀測讓未知發現保持可驗證，也避免過早接觸。"},
    partial:{title:"未知訊號仍無法定性",quote:"我們取得更多影像，但主動接近讓訊號頻率改變。現在很難分辨那是回應，還是我們造成的干擾。",result:"資料受污染",resource:"機密風險 +12%",tag:"觀測者效應",lesson:"缺少被動基準使科學判讀留下無法排除的假設。"}},
  "A7-NAV-274":{
    best:{title:"自動避碰點火完成",quote:"NAV-AI 執行了 2.4 秒短脈衝。我們避開小行星，而我終於可以離開導航席。",result:"安全通過",resource:"燃料 −6%",tag:"四分鐘餘裕",lesson:"可逆、自動且受限制的決策降低了疲勞操作與碰撞的雙重風險。"},
    partial:{title:"航線已修正但助推窗口遺失",quote:"我們安全了，只是晚了幾秒。重力助推窗口已經關閉，返航時間會再增加。",result:"安全優先",resource:"航程 +19 日",tag:"錯失窗口",lesson:"船員安全獲得保障，但等待或人工操作付出了航程代價。"}},
  "A7-PWR-317":{
    best:{title:"熱失控電池已隔離",quote:"BATT-3 已離線，生命維持恢復穩定。我也收到 Sophie 的語音——我會活著回去回答她。",result:"最佳終局",resource:"可用電力 28%",tag:"最後一盞燈",lesson:"先保住生命安全，再為返航與家庭保留最低通道，讓任務仍有未來。"},
    partial:{title:"Aurora-7 進入低功耗狀態",quote:"我們還活著，但樣本、返航與家庭訊息只能保住其中一部分。我已經做了選擇。",result:"苦澀終局",resource:"可用電力 17%",tag:"不可逆分配",lesson:"終局取捨反映玩家一路建立的信任、風險態度與家庭優先順序。"}}
};
