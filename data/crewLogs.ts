import { storyMissions } from "./storyMissions";

export type CrewLogEvent = {
  id: string;
  missionId: string;
  day: number;
  sequence: number;
  stage: number;
  time: string;
  category: "船員私記" | "系統觀察" | "任務事件" | "家庭牽掛" | "心理狀態";
  icon: string;
  title: string;
  body: string;
  titleEn: string;
  bodyEn: string;
  categoryEn: string;
  signal: string;
};

const profiles: Record<string, { crisis: string; place: string; feeling: string; family: string; system: string; objective: string }> = {
  "A7-LSS-043": { crisis: "氧氣讀數矛盾", place: "生命維持艙", feeling: "疲勞讓每一次判讀都變得沉重", family: "Sophie 畫的太空樹", system: "O₂-A 主感測器", objective: "找出氧氣下降的真正原因" },
  "A7-SWX-118": { crisis: "太陽風提前抵達", place: "艙外天線校準平台", feeling: "倒數聲比呼吸更清楚", family: "Sophie 的學校科展影片", system: "運作正常的雙頻深空天線", objective: "在輻射鋒面抵達前結束例行校準並撤回船艙" },
  "A7-ANO-231": { crisis: "未知窄頻訊號", place: "外環觀測窗", feeling: "好奇與戒心同時拉扯著我", family: "答應寄給 Sophie 的第二顆星", system: "窄頻光譜陣列", objective: "確認亮點是否正在回應我們" },
  "A7-NAV-274": { crisis: "航線偏移與碰撞風險", place: "導航主控席", feeling: "二十一小時未眠讓星圖開始重疊", family: "還沒錄完的睡前故事", system: "自主導航核心", objective: "在四分鐘安全餘裕內修正航線" },
  "A7-PWR-317": { crisis: "主電力匯流排連鎖故障", place: "備援電力艙", feeling: "每熄滅一盞燈，都像失去一條回家的路", family: "Sophie 住院前等待的聲音", system: "備援電池與生命維持匯流排", objective: "在生存、返航與家庭通訊間分配最後電力" },
};

const profilesEn: Record<string, { crisis: string; place: string; feeling: string; family: string; system: string; objective: string }> = {
  "A7-LSS-043": { crisis: "conflicting oxygen readings", place: "life-support bay", feeling: "fatigue makes every judgment feel heavier", family: "Sophie's drawing of a space tree", system: "O₂-A primary sensor", objective: "identify the real cause of the oxygen decline" },
  "A7-SWX-118": { crisis: "the early arrival of the solar wind", place: "external antenna array", feeling: "the countdown is louder than my breathing", family: "Sophie's science-fair video", system: "dual-band deep-space antenna", objective: "return to the cabin before the radiation front arrives" },
  "A7-ANO-231": { crisis: "an unknown narrow-band signal", place: "outer observation window", feeling: "curiosity and caution pull in opposite directions", family: "the second star I promised Sophie", system: "narrow-band spectral array", objective: "confirm whether the light is responding to us" },
  "A7-NAV-274": { crisis: "course deviation and collision risk", place: "navigation console", feeling: "after twenty-one hours awake, the star maps begin to overlap", family: "the unfinished bedtime story", system: "autonomous navigation core", objective: "correct course within the four-minute safety margin" },
  "A7-PWR-317": { crisis: "a cascading main-bus failure", place: "backup power bay", feeling: "every light that goes out feels like another road home disappearing", family: "the voice Sophie is waiting for in hospital", system: "backup battery and life-support bus", objective: "divide the last power among survival, return, and family contact" },
};

const stageNames = ["例行值勤", "異常初現", "交叉確認", "等待地球", "收到指令", "執行程序", "家庭時刻", "危機轉折", "結果回望"];
const stageNamesEn = ["Routine Watch", "First Anomaly", "Cross-check", "Waiting for Earth", "Directive Received", "Procedure in Progress", "Family Moment", "Crisis Turn", "Looking Back"];
const categories: CrewLogEvent["category"][] = ["船員私記", "系統觀察", "任務事件", "心理狀態", "家庭牽掛"];
const categoryEnglish: Record<CrewLogEvent["category"], string> = { 船員私記:"Personal Log", 系統觀察:"System Watch", 任務事件:"Mission Event", 家庭牽掛:"Family Link", 心理狀態:"Mental State" };
const icons = { 船員私記: "✎", 系統觀察: "⌁", 任務事件: "◆", 家庭牽掛: "♡", 心理狀態: "◎" };

const fragments = [
  (p: typeof profiles[string], s: string) => `${s}開始後，我重新檢查${p.system}。${p.crisis}不像單一故障，更像一個要求我們慢下來的警告。`,
  (p: typeof profiles[string]) => `我在${p.place}記下第三組讀數。地球看到這一行時，我可能已經做出下一個選擇。`,
  () => `控制中心仍在光速的另一端。等待不是空白，而是必須自行承擔的十八分鐘。`,
  (p: typeof profiles[string]) => `今天的目標很清楚：${p.objective}。真正困難的是判斷哪些資料值得相信。`,
  (p: typeof profiles[string]) => `${p.feeling}。我提醒自己逐項唸出程序，避免讓直覺代替檢查。`,
  () => `船艙把每個警報都放大了。我關掉一個不必要的提示音，專心聽設備真正的變化。`,
  (p: typeof profiles[string]) => `我想起${p.family}。家庭訊息不會修好設備，卻能提醒我為什麼要把它修好。`,
  () => `新封包只補上了一部分答案。剩下的空缺，仍要由現場觀察和地球指令共同完成。`,
  () => `我把操作結果寫入不可竄改紀錄。若之後有人重看，希望他們看見的不只是數字。`,
  () => `Aurora-7 仍在前進。每一次回覆都晚了一點，但從來沒有失去意義。`,
];
const fragmentsEn = [
  (p: typeof profilesEn[string], s: string) => `After ${s.toLowerCase()} began, I checked the ${p.system} again. ${p.crisis} does not feel like a single failure; it feels like a warning to slow down.`,
  (p: typeof profilesEn[string]) => `I recorded a third set of readings in the ${p.place}. By the time Earth sees this line, I may already have made the next choice.`,
  () => `Mission Control is still on the other side of light-speed delay. Waiting is not empty time; it is eighteen minutes of responsibility I must carry alone.`,
  (p: typeof profilesEn[string]) => `Today's objective is clear: ${p.objective}. The difficult part is deciding which data deserves our trust.`,
  (p: typeof profilesEn[string]) => `${p.feeling}. I read every procedure aloud so instinct cannot replace verification.`,
  () => `The cabin amplifies every alarm. I muted one unnecessary tone and listened for the changes that actually mattered.`,
  (p: typeof profilesEn[string]) => `I thought about ${p.family}. A family message cannot repair equipment, but it can remind me why the repair matters.`,
  () => `The new packet supplied only part of the answer. Field observation and Earth's directive must complete what is missing together.`,
  () => `I wrote the result into the immutable log. If someone reads it later, I hope they see more than numbers.`,
  () => `Aurora-7 is still moving. Every reply arrives late, but none of them has lost its meaning.`,
];

export const crewLogsByMission: Record<string, CrewLogEvent[]> = Object.fromEntries(storyMissions.map((mission) => {
  const profile = profiles[mission.id];
  const profileEn = profilesEn[mission.id];
  const logs = Array.from({ length: 90 }, (_, index): CrewLogEvent => {
    const stage = Math.floor(index / 10);
    const slot = index % 10;
    const category = categories[(slot + stage) % categories.length];
    const minutes = 6 + index * 7;
    const hour = 6 + Math.floor(minutes / 60);
    const minute = minutes % 60;
    return {
      id: `${mission.id}-LOG-${String(index + 1).padStart(3, "0")}`,
      missionId: mission.id,
      day: mission.day,
      sequence: index + 1,
      stage,
      time: `DAY ${mission.day} · ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} SHIP TIME`,
      category,
      icon: icons[category],
      title: `${stageNames[stage]}／${[profile.system, profile.place, profile.crisis, profile.objective, profile.family][slot % 5]}`,
      body: fragments[slot](profile, stageNames[stage]),
      titleEn: `${stageNamesEn[stage]} / ${[profileEn.system, profileEn.place, profileEn.crisis, profileEn.objective, profileEn.family][slot % 5]}`,
      bodyEn: fragmentsEn[slot](profileEn, stageNamesEn[stage]),
      categoryEn: categoryEnglish[category],
      signal: stage < 2 ? "LOCAL ONLY" : stage < 5 ? "QUEUED FOR EARTH" : stage < 8 ? "MISSION LINK" : "ARCHIVED",
    };
  });
  return [mission.id, logs];
}));

export function personalizeCrewLog(log: CrewLogEvent, context: { instruction: string; familyHandled: boolean; academyDone: number; trust: number; morale: number; phase: string; locale: "zh" | "en" }): CrewLogEvent {
  if (log.sequence === 43) return { ...log, title: "地球指令抵達", body: `控制中心的指令終於抵達：${context.instruction} 我會照程序執行，也會把現場變化逐項回報。`, titleEn:"Earth Directive Arrived", bodyEn:`Mission Control's directive finally arrived: ${context.instruction} I will follow procedure and report every change in the field.`, signal: "PLAYER DIRECTIVE" };
  if (log.sequence === 67) return { ...log, title: context.familyHandled ? "家庭封包已核准" : "家庭封包仍在等待", body: context.familyHandled ? "控制中心替我保留了家庭通訊頻寬。那幾秒聲音讓船艙重新像一個有人等待我回去的地方。" : "家庭封包仍停在佇列裡。我理解任務優先，但還是忍不住多看了一次等待圖示。", titleEn:context.familyHandled?"Family Packet Approved":"Family Packet Still Waiting", bodyEn:context.familyHandled?"Mission Control preserved bandwidth for my family. Those few seconds of sound made the cabin feel like a place someone expects me to return from.":"The family packet remains in the queue. I understand mission priority, but I still checked the waiting icon one more time.", signal: context.familyHandled ? "FAMILY LINK ACTIVE" : "FAMILY LINK PENDING" };
  if (log.sequence === 74) return { ...log, title: "教育資料同步", body: `Space Academy 已完成 ${context.academyDone} 題。地球端學到的知識正在變成我們此刻能使用的程序。`, titleEn:"Academy Data Synchronized", bodyEn:`Space Academy has completed ${context.academyDone} questions. Knowledge learned on Earth is becoming procedure we can use here.`, signal: "ACADEMY LINK" };
  if (log.sequence === 88) return { ...log, title: "Cassian 狀態回顧", body: `任務階段：${context.phase}。目前信任指數 ${context.trust}、士氣 ${context.morale}。這些數字無法說完全部，但至少證明我們仍在互相回應。`, titleEn:"Cassian Status Review", bodyEn:`Mission phase: ${context.phase}. Trust is ${context.trust}; morale is ${context.morale}. These numbers cannot tell the whole story, but they prove we are still answering one another.`, signal: "CREW STATE" };
  return log;
}
