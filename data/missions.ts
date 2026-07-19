export type CommandId = "oxygen" | "adam" | "course" | "power" | "sleep" | "hold";

export type MissionEvidence = {
  id: string;
  tag: string;
  text: string;
  detail: string;
  quality: number;
};

export type MissionClue = {
  at: number;
  time: string;
  label: string;
  transcript: string;
  evidenceId: string;
};

export type MissionOutcome = {
  title: string;
  body: string;
  result: string;
  oxygen: number;
  power: number;
};

export type Mission = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  ship: string;
  location: string;
  distanceKm: number;
  planetImage: string;
  sceneImage: string;
  delayMinutes: number;
  earthPerShipMinute: number;
  transmissionTime: string;
  earthReceiveTime: string;
  initial: { hull: number; oxygen: number; power: number };
  ratesPerShipMinute: { hull: number; oxygen: number; power: number };
  threat: { name: string; etaMinutes: number; uncertainty: string };
  crew: { primary: string; secondary: string; primaryStatus: string };
  evidence: MissionEvidence[];
  clues: MissionClue[];
  recommendedCommand: CommandId;
  bestEvidence: string[];
  outcomes: Record<CommandId, MissionOutcome>;
};

export const missions: Mission[] = [
  {
    id: "jupiter-relay",
    number: "271",
    title: "木星軌道洩漏",
    subtitle: "JUPITER ORBITAL EMERGENCY",
    ship: "DISTANT VOYAGER — 07",
    location: "木星外圍軌道",
    distanceKm: 489_240_000,
    planetImage: "/game/planets/jupiter.webp",
    sceneImage: "/game/backgrounds/maintenance-bay.webp",
    delayMinutes: 27.18,
    earthPerShipMinute: 1.63,
    transmissionTime: "08:20:11",
    earthReceiveTime: "08:47:22",
    initial: { hull: 72, oxygen: 48, power: 61 },
    ratesPerShipMinute: { hull: .08, oxygen: .7, power: .15 },
    threat: { name: "木星磁暴鋒面", etaMinutes: 12.8, uncertainty: "±4 分" },
    crew: { primary: "ADAM", secondary: "NOAH", primaryStatus: "受傷" },
    evidence: [
      { id: "oxygen-rate", tag: "遙測", text: "氧氣以 0.7%／船上分鐘下降", detail: "可靠度 94%", quality: 94 },
      { id: "noah-repair", tag: "影像", text: "Noah 已開始手動隔離洩漏", detail: "可靠度 78%", quality: 78 },
      { id: "storm", tag: "環境", text: "磁暴鋒面將在 12m 46s 後接觸", detail: "誤差 ±4 分", quality: 71 },
      { id: "adam-vitals", tag: "醫療", text: "Adam 受傷，但生命徵象暫時穩定", detail: "可靠度 86%", quality: 86 },
      { id: "shared-power", tag: "系統", text: "推進器與生命維持共用主電源", detail: "工程手冊", quality: 100 },
    ],
    clues: [
      { at: 12, time: "00:12", label: "壓力波動", transcript: "艙壓仍在下降，速率大約每分鐘 0.7%。", evidenceId: "oxygen-rate" },
      { at: 35, time: "00:35", label: "手動隔離", transcript: "氧氣歧管疑似洩漏——我正在嘗試手動隔離。", evidenceId: "noah-repair" },
      { at: 62, time: "01:03", label: "磁暴讀數", transcript: "外部磁場快速增強，鋒面比預報更早。", evidenceId: "storm" },
      { at: 84, time: "01:26", label: "醫療回報", transcript: "Adam 還清醒，生命徵象暫時穩定。", evidenceId: "adam-vitals" },
    ],
    recommendedCommand: "oxygen",
    bestEvidence: ["oxygen-rate", "noah-repair"],
    outcomes: {
      oxygen: { title: "艙壓已穩定", body: "Noah 在指令抵達前完成旁路隔離。你的指令讓修復程序提前完成。", result: "全員存活", oxygen: 41, power: 46 },
      adam: { title: "Adam 已接受救治", body: "醫療資源成功送達，但氧氣洩漏仍持續了一段時間。", result: "Adam 穩定", oxygen: 29, power: 52 },
      course: { title: "航道修正完成", body: "飛船避開磁暴主鋒面，但推進器點火使洩漏加劇。", result: "磁暴風險降低", oxygen: 25, power: 39 },
      power: { title: "備援電力上線", body: "生命維持獲得額外續航，Adam 仍在等待救援。", result: "能源充足", oxygen: 31, power: 74 },
      sleep: { title: "船員進入休眠", body: "耗氧下降，但無人完成關鍵手動修復。", result: "船體受損", oxygen: 38, power: 67 },
      hold: { title: "原計畫持續執行", body: "Noah 自行完成修復，但 Adam 的傷勢惡化。", result: "任務部分成功", oxygen: 33, power: 55 },
    },
  },
  {
    id: "neutron-shadow",
    number: "418",
    title: "中子星陰影",
    subtitle: "NEUTRON STAR SHADOW PASS",
    ship: "KEPLER SENTINEL — 12",
    location: "PSR J1748 接近航道",
    distanceKm: 323_760_000,
    planetImage: "/game/planets/neutron-star.webp",
    sceneImage: "/game/backgrounds/engine-room.webp",
    delayMinutes: 18,
    earthPerShipMinute: 4.2,
    transmissionTime: "03:14:08",
    earthReceiveTime: "03:32:08",
    initial: { hull: 83, oxygen: 76, power: 43 },
    ratesPerShipMinute: { hull: .22, oxygen: .18, power: 1.1 },
    threat: { name: "脈衝輻射束", etaMinutes: 9.5, uncertainty: "±40 秒" },
    crew: { primary: "MIRA", secondary: "ELIAS", primaryStatus: "輻射暴露" },
    evidence: [
      { id: "power-drain", tag: "遙測", text: "護盾每船上分鐘消耗 1.1% 能源", detail: "可靠度 97%", quality: 97 },
      { id: "pulse-window", tag: "天文", text: "下一次輻射束將掃過目前航道", detail: "誤差 ±40 秒", quality: 91 },
      { id: "engine-hot", tag: "影像", text: "主推進器冷卻環已過熱", detail: "可靠度 82%", quality: 82 },
      { id: "mira-dose", tag: "醫療", text: "Mira 的曝露量尚未達急性門檻", detail: "可靠度 88%", quality: 88 },
      { id: "shadow-route", tag: "導航", text: "星體陰影區可遮蔽下一次脈衝", detail: "模擬資料", quality: 95 },
    ],
    clues: [
      { at: 18, time: "00:18", label: "護盾耗能", transcript: "護盾電量下降太快，再撐一輪就會見底。", evidenceId: "power-drain" },
      { at: 41, time: "00:42", label: "冷卻警報", transcript: "主推進器溫度超標，不能長時間全推力。", evidenceId: "engine-hot" },
      { at: 67, time: "01:08", label: "陰影航道", transcript: "導航找到星體陰影區，短促點火就能進入。", evidenceId: "shadow-route" },
      { at: 88, time: "01:30", label: "脈衝倒數", transcript: "下一束脈衝九分鐘後掃過這裡。", evidenceId: "pulse-window" },
    ],
    recommendedCommand: "course",
    bestEvidence: ["pulse-window", "shadow-route"],
    outcomes: {
      oxygen: { title: "生命維持已強化", body: "氧氣系統穩定，但護盾在下一束脈衝前耗盡。", result: "任務受挫", oxygen: 72, power: 12 },
      adam: { title: "Mira 已接受治療", body: "醫療處置成功，飛船卻仍暴露在輻射航道上。", result: "船員穩定", oxygen: 70, power: 16 },
      course: { title: "進入星體陰影", body: "短促點火成功，飛船在護盾耗盡前進入安全陰影區。", result: "脈衝已避開", oxygen: 71, power: 24 },
      power: { title: "非必要系統離線", body: "能源續航增加，但位置仍在脈衝束邊緣。", result: "護盾勉強維持", oxygen: 73, power: 38 },
      sleep: { title: "休眠程序中斷", body: "輻射警報喚醒船員，錯過最佳航道修正窗口。", result: "船體受損", oxygen: 75, power: 9 },
      hold: { title: "原航線維持", body: "護盾吸收脈衝後過載，主要科學資料遺失。", result: "任務失敗", oxygen: 68, power: 4 },
    },
  },
];
