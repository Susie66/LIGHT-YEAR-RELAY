"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./academy-review.css";
import "./side-comms.css";
import "./family-media.css";
import "./family-awaiting.css";
import { academyModules, academyQuestions } from "../data/academy";
import { storyMissions } from "../data/storyMissions";
import { missionCommands } from "../data/missionCommands";
import { missionCommandsEnglish } from "../data/missionCommandsEnglish";
import { missionStatus } from "../data/missionStatus";
import { crewLogsByMission, personalizeCrewLog } from "../data/crewLogs";
import { missionFollowups, missionResults } from "../data/missionResults";
import {
  missionFollowupsEnglish,
  missionResultsEnglish,
} from "../data/missionResultsEnglish";
import {
  academyModulesEnglish,
  academyQuestionsEnglish,
} from "../data/academyEnglish";
import { sideEvents, type SideEvent } from "../data/sideEvents";
import { missionEnglish } from "../data/missionTranslations";
import { familyRelayMedia, familyRelayOptions } from "../data/familyRelay";

type Phase = "review" | "compose" | "sending" | "verification" | "result";
type ChoiceKey = "goal" | "action" | "risk" | "tone";
const initialSelection = {
  goal: "source",
  action: "crosscheck",
  risk: "safe",
  tone: "care",
};
const initialGameImages = [
  "/game/backgrounds/deep-space.webp",
  "/game/missions/lss-043-oxygen-console.webp",
  "/game/crew/cassian-avatar.webp",
  "/game/family/sophie_space_tree.webp",
];
const isTaiwanLocale = (language: string) => {
  try {
    return new Intl.Locale(language).region === "TW";
  } catch {
    return /(?:^|-)TW(?:-|$)/i.test(language);
  }
};
const missionMedia: Record<
  string,
  {
    scene: string;
    video?: string;
    audio: string;
    ship: string;
    celestial: { name: string; src: string }[];
  }
> = {
  "A7-LSS-043": {
    scene: "/game/missions/lss-043-oxygen-console.webp",
    audio: "/game/audio/missions/oxygen-recycling-anomaly.mp3",
    ship: "/game/ships/distant-voyager-07/front.webp",
    celestial: [
      { name: "EARTH", src: "/game/planets/earth.webp" },
      { name: "MARS", src: "/game/planets/mars.webp" },
    ],
  },
  "A7-SWX-118": {
    scene: "/game/missions/swx-118-solar-storm.webp",
    video: "/game/missions/solar_wind_sweeps_past_Aurora-7.mp4",
    audio: "/game/audio/missions/solar-storm-warning.mp3",
    ship: "/game/ships/distant-voyager-07/side.webp",
    celestial: [
      { name: "SUN", src: "/game/planets/sun.webp" },
      { name: "JUPITER STORM", src: "/game/planets/jupiter-storm.webp" },
    ],
  },
  "A7-ANO-231": {
    scene: "/game/missions/ano-231-second-star.webp",
    video: "/game/missions/movement_of_an_unknown_second_star.mp4",
    audio: "/game/audio/missions/unknown-light-detected.mp3",
    ship: "/game/ships/distant-voyager-07/top.webp",
    celestial: [
      { name: "NEBULA", src: "/game/planets/nebula.webp" },
      { name: "BLACK HOLE", src: "/game/planets/black-hole.webp" },
      { name: "NEUTRON STAR", src: "/game/planets/neutron-star.webp" },
    ],
  },
  "A7-NAV-274": {
    scene: "/game/missions/nav-274-navigation-alert.webp",
    audio: "/game/audio/missions/navigation-assistance-requested.mp3",
    ship: "/game/ships/distant-voyager-07/rear.webp",
    celestial: [{ name: "SATURN", src: "/game/planets/saturn.webp" }],
  },
  "A7-PWR-317": {
    scene: "/game/missions/pwr-317-power-failure.webp",
    audio: "/game/audio/missions/power-failure_return-decision.mp3",
    ship: "/game/ships/distant-voyager-07/front.webp",
    celestial: [
      { name: "EARTH RETURN VECTOR", src: "/game/planets/earth.webp" },
    ],
  },
};
const familyAvatars = [
  "/game/family/sophie-avatar.webp",
  "/game/family/sophie-avatar.webp",
  "/game/family/sophie-avatar.webp",
  "/game/family/sophie-elena-avatar.webp",
  "/game/family/elena-avatar.webp",
];
const familyInboundMedia: Record<
  string,
  {
    type: "photo" | "video" | "audio" | "text";
    titleZh: string;
    titleEn: string;
    descriptionZh: string;
    descriptionEn: string;
    file: string;
    size: string;
    src?: string;
    poster?: string;
    transcriptZh?: string;
    transcriptEn?: string;
  }
> = {
  "A7-LSS-043": {
    type: "photo",
    titleZh: "Sophie 的太空樹畫作",
    titleEn: "SOPHIE'S SPACE-TREE DRAWING",
    descriptionZh:
      "Sophie 畫下爸爸在太空種樹並製造氧氣的想像，作為任務一收到的家庭端附件。",
    descriptionEn:
      "Sophie imagines her father growing an oxygen-producing tree in space. This is the family attachment received during Mission 01.",
    file: "sophie_space_tree.webp",
    size: "30 KB",
    src: "/game/family/sophie_space_tree.webp",
  },
  "A7-SWX-118": {
    type: "video",
    titleZh: "Sophie 的學校科展影片",
    titleEn: "SOPHIE'S SCHOOL SCIENCE-FAIR VIDEO",
    descriptionZh: "家庭端傳來 Sophie 在學校科展介紹並發射手作火箭的影片。",
    descriptionEn:
      "The family sends a video of Sophie presenting and launching her handmade rocket at the school science fair.",
    file: "sophie-rocket-fair.mp4",
    size: "80 KB",
    src: "/game/family/sophie-rocket-fair.mp4",
    poster: "/game/family/sophie-rocket-fair.webp",
  },
  "A7-ANO-231": {
    type: "text",
    titleZh: "Sophie 的文字回覆",
    titleEn: "SOPHIE'S TEXT REPLY",
    descriptionZh:
      "家庭端回覆被封鎖的第二顆星照片，Sophie 詢問爸爸是否又有不能告訴她的秘密。",
    descriptionEn:
      "The family replies to the restricted second-star photograph. Sophie asks whether her father is keeping another secret.",
    file: "sophie-reply-packet.txt",
    size: "2 KB",
    transcriptZh: "爸爸，你是不是又有不能告訴我的秘密？",
    transcriptEn: "Dad, do you have another secret you cannot tell me?",
  },
  "A7-NAV-274": {
    type: "text",
    titleZh: "睡前故事請求",
    titleEn: "BEDTIME STORY REQUEST",
    descriptionZh:
      "Elena 與 Sophie 傳來睡前故事請求，也提醒疲憊的 Cassian 應先休息。",
    descriptionEn:
      "Elena and Sophie send a bedtime-story request while reminding the exhausted Cassian to rest first.",
    file: "bedtime_story_request.txt",
    size: "2 KB",
    transcriptZh: "故事可以晚一點，爸爸要先去睡覺。這次換我提醒你。",
    transcriptEn:
      "The story can wait. Dad needs to sleep first. This time I am reminding you.",
  },
  "A7-PWR-317": {
    type: "audio",
    titleZh: "Elena 的緊急家庭語音",
    titleEn: "ELENA'S EMERGENCY FAMILY MESSAGE",
    descriptionZh:
      "Elena 從地球端傳來醫療緊急語音，通知 Sophie 即將接受治療並希望先聽見爸爸的聲音。",
    descriptionEn:
      "Elena sends an urgent medical voice message from Earth: Sophie is about to receive treatment and wants to hear her father's voice first.",
    file: "urgent_hospital_message.opus",
    size: "15 KB",
    transcriptZh: "Sophie 已準備接受治療。她想在進去以前聽一次爸爸的聲音。",
    transcriptEn:
      "Sophie is ready for treatment. She wants to hear her father's voice once before she goes in.",
  },
};
const communicationLogs = [
  {
    id: "COM-317-08",
    kind: "太空人通訊",
    icon: "◉",
    time: "DAY 317 · 14:36 UTC",
    from: "Cassian → Mission Control",
    title: "氧氣循環效率下降 18%",
    summary: "Cassian 回報生命維持系統異常，附上主感測器與艙壓遙測。",
    file: "LSS_TELEMETRY_317.csv",
    size: "18 KB",
    level: "LEVEL 3",
    status: "等待玩家指令",
    action: "玩家開啟系統數據、感測器讀數與維修紀錄，尚未傳送正式指令。",
  },
  {
    id: "FAM-317-04",
    kind: "家庭互動",
    icon: "♡",
    time: "DAY 317 · 13:10 UTC",
    from: "Sophie → Cassian",
    title: "Sophie 的木星特洛伊小行星畫作",
    summary: "Sophie 詢問小行星是否真的會跟著木星一起繞太陽。",
    file: "sophie_trojan_drawing.jpg",
    size: "30 KB",
    level: "LEVEL 0",
    status: "安全掃描通過",
    action: "玩家核准家庭附件並排入下一次上行封包，消耗家庭頻寬 30 KB。",
  },
  {
    id: "SEC-316-11",
    kind: "附件傳遞",
    icon: "▧",
    time: "DAY 316 · 20:42 UTC",
    from: "Cassian → Vale Family",
    title: "木星窗外照片／敏感設備入鏡",
    summary: "原始照片右下角包含未公開的光譜儀控制面板。",
    file: "jupiter_window_RAW.heic",
    size: "42 KB",
    level: "LEVEL 3",
    status: "裁切後核准",
    action:
      "玩家裁切右下角 18% 畫面，保留木星景象並移除任務設備；安全評價 +2。",
  },
  {
    id: "FAM-315-02",
    kind: "家庭互動",
    icon: "♫",
    time: "DAY 315 · 08:05 UTC",
    from: "Elena Vale → Cassian",
    title: "家庭生日語音",
    summary: "家人錄製 38 秒生日祝福，內容不含任務資訊。",
    file: "birthday_message.opus",
    size: "15 KB",
    level: "LEVEL 0",
    status: "已傳送",
    action: "玩家將家庭封包設為優先傳輸，Cassian 士氣 +3、家庭連結 +2。",
  },
  {
    id: "COM-313-07",
    kind: "太空人通訊",
    icon: "◉",
    time: "DAY 313 · 17:28 UTC",
    from: "Mission Control → Cassian",
    title: "太陽風暴避難指令",
    summary: "要求停止艙外活動、隔離非必要電路並進入輻射避難區。",
    file: "SOLAR_PROTOCOL_A7.txt",
    size: "2 KB",
    level: "LEVEL 2",
    status: "執行成功",
    action:
      "玩家選擇安全優先與堅定命令；Cassian 在風暴抵達前 11 分鐘完成避難。",
  },
  {
    id: "SEC-309-03",
    kind: "管理日誌",
    icon: "⌁",
    time: "DAY 309 · 11:52 UTC",
    from: "Mission Control Audit",
    title: "家庭影片壓縮與延後傳送",
    summary: "80 KB 校園活動影片超出本月剩餘家庭頻寬。",
    file: "school_fair_video.mp4",
    size: "80 → 46 KB",
    level: "LEVEL 0",
    status: "壓縮／延後",
    action: "玩家套用 Academy 解鎖的低幀率壓縮，並保留封包至下月額度重置。",
  },
];
const uniqueCommunicationLogs = (logs: typeof communicationLogs) =>
  logs.filter(
    (log, index) =>
      index ===
      logs.findIndex(
        (item) =>
          item.kind === log.kind &&
          item.title === log.title &&
          item.file === log.file,
      ),
  );

function Meter({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <b className={danger ? "danger" : ""}>{value}%</b>
      </div>
      <i>
        <em className={danger ? "danger" : ""} style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("review");
  const [selection, setSelection] = useState(initialSelection);
  const [activeData, setActiveData] = useState("telemetry");
  const [seconds, setSeconds] = useState(12);
  const [trust, setTrust] = useState(68);
  const [morale, setMorale] = useState(70);
  const [bandwidth, setBandwidth] = useState(68);
  const [tab, setTab] = useState("任務控制");
  const [notice, setNotice] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [infoPanel, setInfoPanel] = useState<
    "credits" | "tutorial" | "news" | null
  >(null);
  const [locale, setLocale] = useState<"zh" | "en">("zh");
  const [musicVolume, setMusicVolume] = useState(45);
  const audioRef = useRef<HTMLAudioElement>(null);
  const missionAudioRef = useRef<HTMLAudioElement>(null);
  const ambienceAudioRef = useRef<HTMLAudioElement>(null);
  const [missionAudioPlaying, setMissionAudioPlaying] = useState(false);
  const [gameImagesReady, setGameImagesReady] = useState(false);
  const [gameLoadProgress, setGameLoadProgress] = useState(0);
  const [enteringGame, setEnteringGame] = useState(false);
  const [showSlowLoading, setShowSlowLoading] = useState(false);
  const [localNow, setLocalNow] = useState<Date | null>(null);
  const [missionTimeMinutes, setMissionTimeMinutes] = useState(
    (43 - 1) * 1440 + 8 * 60 + 20,
  );
  const [academyOpen, setAcademyOpen] = useState(false);
  const [academyIndex, setAcademyIndex] = useState(0);
  const [academyAnswer, setAcademyAnswer] = useState<number | null>(null);
  const [academyDone, setAcademyDone] = useState(93);
  const [reviewPool, setReviewPool] = useState<number[]>([]);
  const [academyMode, setAcademyMode] = useState<"course" | "review">("course");
  const [commsOpen, setCommsOpen] = useState(false);
  const [logFilter, setLogFilter] = useState("全部");
  const [selectedLog, setSelectedLog] = useState("");
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [gameLogs, setGameLogs] = useState<
    (typeof communicationLogs)[number][]
  >(() => communicationLogs.slice(0, 0));
  const [logsHydrated, setLogsHydrated] = useState(false);
  const [crewLogsOpen, setCrewLogsOpen] = useState(false);
  const [crewLogFilter, setCrewLogFilter] = useState("全部");
  const [selectedCrewLog, setSelectedCrewLog] = useState("");
  const [crewLogProgress, setCrewLogProgress] = useState<
    Record<string, number>
  >({});
  const [reviewedData, setReviewedData] = useState<Record<string, string[]>>(
    {},
  );
  const [followupChoice, setFollowupChoice] = useState<number | null>(null);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [mainMissionResolvedIds, setMainMissionResolvedIds] = useState<
    string[]
  >([]);
  const [requiredSideInteractions, setRequiredSideInteractions] = useState<
    Record<string, number>
  >({});
  const [familyRelayOpen, setFamilyRelayOpen] = useState(false);
  const [familyRelayChoice, setFamilyRelayChoice] = useState("edit");
  const [familyRelayPhase, setFamilyRelayPhase] = useState<
    "review" | "transmitting" | "awaiting" | "result"
  >("review");
  const [familyRelayCountdown, setFamilyRelayCountdown] = useState(8);
  const [familyBond, setFamilyBond] = useState(62);
  const [honesty, setHonesty] = useState(70);
  const [familyRelayResults, setFamilyRelayResults] = useState<
    Record<string, string>
  >({});
  const [familyRelayReplyUnlocked, setFamilyRelayReplyUnlocked] = useState<
    string[]
  >([]);
  const [familyRelayReady, setFamilyRelayReady] = useState<
    Record<
      string,
      { missionMinute: number; realAt: number; interaction: number }
    >
  >({});
  const [missionGateOpen, setMissionGateOpen] = useState(false);
  const [activeSideEvent, setActiveSideEvent] = useState<SideEvent | null>(
    null,
  );
  const [seenSideEvents, setSeenSideEvents] = useState<string[]>([]);
  const [sideEventReply, setSideEventReply] = useState("");
  const [sideCommsOpen, setSideCommsOpen] = useState(false);
  const [selectedPrivateCrew, setSelectedPrivateCrew] = useState("Cassian");
  const [interactionCount, setInteractionCount] = useState(0);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [overviewMissionIndex, setOverviewMissionIndex] = useState(0);
  const activeMission = storyMissions[activeMissionIndex];
  const missionText = (mission: (typeof storyMissions)[number]) =>
    locale === "zh" ? mission : { ...mission, ...missionEnglish[mission.id] };
  const activeMissionText = missionText(activeMission);
  const overviewMission = storyMissions[overviewMissionIndex] ?? activeMission;
  const overviewMissionText = missionText(overviewMission);
  const missionDay = Math.floor(missionTimeMinutes / 1440) + 1;
  const missionMinuteOfDay = missionTimeMinutes % 1440;
  const missionClock = `${String(Math.floor(missionMinuteOfDay / 60)).padStart(2, "0")}:${String(missionMinuteOfDay % 60).padStart(2, "0")}`;
  const localDate = localNow
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-TW" : "en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(localNow)
    : "-- / -- / --";
  const localClock = localNow
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-TW" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(localNow)
    : "--:--:--";
  const advanceMissionTime = (minutes: number) =>
    setMissionTimeMinutes((value) => value + minutes);
  const missionChoiceSet = (
    locale === "zh" ? missionCommands : missionCommandsEnglish
  )[activeMission.id];
  const activeStatus = missionStatus[activeMission.id];
  const currentFollowup = (
    locale === "zh" ? missionFollowups : missionFollowupsEnglish
  )[activeMission.id];
  const reviewedCount = (reviewedData[activeMission.id] ?? []).length;
  const localizedResults =
    locale === "zh" ? missionResults : missionResultsEnglish;
  const currentResult =
    localizedResults[activeMission.id][
      selection.action === missionChoiceSet.action[0].id &&
      followupChoice === currentFollowup.best
        ? "best"
        : "partial"
    ];
  const archivedMissionIds = completedMissionIds;
  const familyMedia = familyRelayMedia[activeMission.id];
  const selectedFamilyOption =
    familyRelayOptions.find((option) => option.id === familyRelayChoice) ??
    familyRelayOptions[1];
  const familySubmitted = Boolean(familyRelayResults[activeMission.id]);
  const familyProcessed = familyRelayReplyUnlocked.includes(activeMission.id);
  const familyPending = familySubmitted && !familyProcessed;
  const familyReady = familyRelayReady[activeMission.id];
  const familyWaitSeconds = familyReady
    ? Math.max(0, Math.ceil((familyReady.realAt - localNow.getTime()) / 1000))
    : 0;
  const savedFamilyOption = familyRelayOptions.find(
    (option) => option.id === familyRelayResults[activeMission.id],
  );
  const displayedFamilyOption =
    familyRelayPhase === "result" && savedFamilyOption
      ? savedFamilyOption
      : selectedFamilyOption;
  const selectedFamilyNote =
    familyMedia.publicSafe && selectedFamilyOption.id === "original"
      ? locale === "zh"
        ? "原始照片已通過公開科普審查，不含任務機密，可安全完整傳送。"
        : "The original public-outreach photo has passed review and contains no classified mission information."
      : locale === "zh"
        ? selectedFamilyOption.noteZh
        : selectedFamilyOption.noteEn;
  const selectedFamilySecurity = familyMedia.publicSafe
    ? "LOW"
    : selectedFamilyOption.security;
  const requiredSideCount = 2;
  const handledRequiredSideCount =
    requiredSideInteractions[activeMission.id] ?? 0;
  const mainMissionResolved = mainMissionResolvedIds.includes(activeMission.id);
  const familyIncomingImage =
    activeMission.id === "A7-LSS-043"
      ? "/game/family/sophie_space_tree.webp"
      : activeMission.id === "A7-SWX-118"
        ? "/game/family/sophie-rocket-fair.webp"
        : "";
  const privateCrew = [
    {
      name: "Cassian",
      role: "SYSTEMS",
      avatar: "/game/crew/cassian-avatar.webp",
    },
    { name: "Mira", role: "MEDICAL", avatar: "/game/crew/mira-avatar.webp" },
    { name: "Noah", role: "NAVIGATION", avatar: "/game/crew/noah-avatar.webp" },
    { name: "Olivia", role: "SCIENCE", avatar: "/game/crew/elena-avatar.webp" },
    { name: "Jun", role: "FLIGHT", avatar: "/game/crew/jun-avatar.webp" },
  ];
  const statusEnglish: Record<string, typeof activeStatus> = {
    "A7-LSS-043": {
      ...activeStatus,
      ship: { ...activeStatus.ship, radiationNote: "Within safe limits" },
      crew: { ...activeStatus.crew, condition: "Fatigued / vitals stable" },
      objectives: {
        primary: "Diagnose the oxygen-cycle anomaly",
        primaryNote: "Confirm a real leak or sensor false alarm",
        secondary: "Calibrate the O₂-A primary sensor",
        secondaryNote: "Avoid unnecessary manual dismantling",
        risk: "Oxygen reading continues to fall",
      },
    },
    "A7-SWX-118": {
      ...activeStatus,
      ship: {
        ...activeStatus.ship,
        radiationNote: "Solar storm rising rapidly",
      },
      crew: {
        ...activeStatus.crew,
        condition: "External calibration / radiation alert",
      },
      objectives: {
        primary: "Recall the EVA crew member",
        primaryNote: "Reach shelter before storm arrival",
        secondary: "Maintain a clear recall transmission",
        secondaryNote: "Routine calibration must not delay evacuation",
        risk: "Directive packet integrity is only 72%",
      },
    },
    "A7-ANO-231": {
      ...activeStatus,
      ship: {
        ...activeStatus.ship,
        radiationNote: "Unknown signal causing localized noise",
      },
      crew: {
        ...activeStatus.crew,
        condition: "Highly focused / emotionally elevated",
      },
      objectives: {
        primary: "Verify the periodic narrow-band signal",
        primaryNote: "Repeat observations and exclude instrument error",
        secondary: "Isolate the Level 5 image",
        secondaryNote: "Review Cassian's family photograph",
        risk: "Unknown source may be responding to radar",
      },
    },
    "A7-NAV-274": {
      ...activeStatus,
      ship: {
        ...activeStatus.ship,
        radiationNote: "Normal deep-space background",
      },
      crew: {
        ...activeStatus.crew,
        condition: "Awake 21 hours / impaired judgment risk",
      },
      objectives: {
        primary: "Exit the projected collision corridor",
        primaryNote: "Only four minutes of safety margin remain",
        secondary: "Preserve the gravity-assist window",
        secondaryNote: "Limit fuel and journey losses",
        risk: "Uncatalogued asteroid entering the route",
      },
    },
    "A7-PWR-317": {
      ...activeStatus,
      ship: {
        ...activeStatus.ship,
        radiationNote: "Low power affecting shielding telemetry",
      },
      crew: {
        ...activeStatus.crew,
        condition: "Family crisis / extreme stress",
      },
      objectives: {
        primary: "Isolate the thermal-runaway battery",
        primaryNote: "Preserve life support and fire suppression",
        secondary: "Allocate return and sample power",
        secondaryNote: "Three systems cannot remain active together",
        risk: "Safe power remaining: 06h 18m",
      },
    },
  };
  const displayedStatus =
    locale === "zh" ? activeStatus : statusEnglish[activeMission.id];
  const activeMissionMedia = missionMedia[activeMission.id];
  const ambienceVariant = String(
    ((activeMissionIndex + interactionCount) % 4) + 1,
  ).padStart(2, "0");
  const ambienceSrc =
    phase === "sending"
      ? `/game/audio/ambience/radio-static${ambienceVariant}.mp3`
      : activeMissionIndex === 1
        ? `/game/audio/ambience/solar-storm-interference${ambienceVariant}.mp3`
        : `/game/audio/ambience/console-ambient-hum${ambienceVariant}.mp3`;
  const playClip = useCallback(
    (src: string) => {
      const clip = new Audio(src);
      clip.volume = Math.min(1, Math.max(0.15, musicVolume / 100));
      void clip.play().catch(() => undefined);
    },
    [musicVolume],
  );
  useEffect(() => {
    if (phase !== "sending") return;
    const timer = window.setTimeout(() => {
      if (seconds <= 1) {
        playClip("/game/audio/ambience/cabin-alert.mp3");
        setPhase("verification");
        setFollowupChoice(null);
        advanceMissionTime(19);
        setCrewLogProgress((v) => ({
          ...v,
          [activeMission.id]: Math.min(90, (v[activeMission.id] ?? 0) + 8),
        }));
        return;
      }
      setSeconds((v) => v - 1);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [phase, seconds, activeMission.id, playClip]);
  useEffect(() => {
    if (familyRelayPhase !== "transmitting") return;
    const timer = window.setTimeout(() => {
      if (familyRelayCountdown <= 1) {
        const option = selectedFamilyOption;
        const title = activeMissionText.familyTitle;
        const action = selectedFamilyNote;
        const id = `FAM-${missionDay}-${String(gameLogs.length + 1).padStart(2, "0")}`;
        const packetFile = familyMedia.file ?? activeMission.familyFile;
        const methodLabel = locale === "zh" ? option.labelZh : option.labelEn;
        const log = {
          id,
          kind: "家庭互動" as const,
          icon: "♡",
          time: `DAY ${missionDay} · ${missionClock} SHIP TIME`,
          from: "Cassian Vale ↔ Vale Family",
          title: `FAMILY RELAY · ${title}`,
          summary:
            locale === "zh"
              ? `Cassian 的家庭封包已採用「${methodLabel}」送往 ${familyMedia.familyFrom}。`
              : `Cassian’s family packet was processed with “${methodLabel}” and relayed to ${familyMedia.familyFrom}.`,
          file: packetFile,
          size: `${option.bandwidth} KB`,
          level: activeMission.security,
          status: locale === "zh" ? "等待家庭回覆" : "AWAITING FAMILY REPLY",
          action,
        };
        const attachmentLog = {
          ...log,
          id: `ATT-${missionDay}-${String(gameLogs.length + 2).padStart(2, "0")}`,
          kind: "附件傳遞" as const,
          icon: "▧",
          from: "Cassian Vale → Mission Control → Vale Family",
          title:
            locale === "zh"
              ? `附件封包：${familyMedia.kindZh}`
              : `ATTACHMENT PACKET: ${familyMedia.kindEn}`,
          summary:
            locale === "zh"
              ? familyMedia.descriptionZh
              : familyMedia.descriptionEn,
          status: locale === "zh" ? "附件已處理" : "ATTACHMENT PROCESSED",
        };
        const auditLog = {
          ...log,
          id: `AUD-${missionDay}-${String(gameLogs.length + 3).padStart(2, "0")}`,
          kind: "管理日誌" as const,
          icon: "⌁",
          from: "Mission Control Audit",
          title:
            locale === "zh"
              ? `玩家決策：${methodLabel}`
              : `PLAYER DECISION: ${methodLabel}`,
          summary:
            locale === "zh"
              ? `玩家對 ${packetFile} 執行「${methodLabel}」。${action}`
              : `The player applied “${methodLabel}” to ${packetFile}. ${action}`,
          status: locale === "zh" ? "決策已記錄" : "DECISION LOGGED",
          action:
            locale === "zh"
              ? `實際操作：${methodLabel}。頻寬 ${option.bandwidth} KB；安全風險 ${familyMedia.publicSafe ? "LOW" : option.security}；家庭連結 ${option.bond >= 0 ? "+" : ""}${option.bond}；坦誠度 ${option.honesty >= 0 ? "+" : ""}${option.honesty}。`
              : `ACTION: ${methodLabel}. Bandwidth ${option.bandwidth} KB; security risk ${familyMedia.publicSafe ? "LOW" : option.security}; family bond ${option.bond >= 0 ? "+" : ""}${option.bond}; honesty ${option.honesty >= 0 ? "+" : ""}${option.honesty}.`,
        };
        const waitSeconds = 45 + Math.floor(Math.random() * 46);
        playClip("/game/audio/ui/family-packet-complete.mp3");
        setFamilyRelayPhase("awaiting");
        setFamilyRelayResults((value) => ({
          ...value,
          [activeMission.id]: option.id,
        }));
        setFamilyRelayReady((value) => ({
          ...value,
          [activeMission.id]: {
            missionMinute: missionTimeMinutes + option.delay + 60,
            realAt: Date.now() + waitSeconds * 1000,
            interaction: interactionCount + 2,
          },
        }));
        setBandwidth((value) => Math.max(0, value - option.bandwidth));
        setFamilyBond((value) =>
          Math.max(0, Math.min(100, value + option.bond)),
        );
        setHonesty((value) =>
          Math.max(0, Math.min(100, value + option.honesty)),
        );
        setTrust((value) => Math.max(0, Math.min(100, value + option.trust)));
        setMorale((value) => Math.max(0, Math.min(100, value + option.morale)));
        setMissionTimeMinutes((value) => value + option.delay);
        setGameLogs((value) => [
          auditLog,
          attachmentLog,
          log,
          ...value.filter(
            (item) =>
              item.file !== packetFile ||
              !(["家庭互動", "附件傳遞", "管理日誌"] as string[]).includes(
                item.kind,
              ),
          ),
        ]);
        setSelectedLog(id);
        setCrewLogProgress((value) => ({
          ...value,
          [activeMission.id]: Math.min(90, (value[activeMission.id] ?? 0) + 3),
        }));
        return;
      }
      setFamilyRelayCountdown((value) => value - 1);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [
    familyRelayPhase,
    familyRelayCountdown,
    selectedFamilyOption,
    activeMission.id,
    activeMission.familyFile,
    activeMission.security,
    activeMissionText.familyTitle,
    locale,
    missionDay,
    missionClock,
    gameLogs.length,
    selectedFamilyNote,
    playClip,
    missionTimeMinutes,
    interactionCount,
    familyMedia.file,
    familyMedia.familyFrom,
    familyMedia.kindZh,
    familyMedia.kindEn,
    familyMedia.descriptionZh,
    familyMedia.descriptionEn,
    familyMedia.publicSafe,
  ]);
  useEffect(() => {
    if (!familyPending || familyProcessed || !familyReady) return;
    const ready =
      Date.now() >= familyReady.realAt ||
      missionTimeMinutes >= familyReady.missionMinute ||
      interactionCount >= familyReady.interaction;
    if (!ready) return;
    const timer = window.setTimeout(() => {
      const reply = locale === "zh" ? familyMedia.replyZh : familyMedia.replyEn;
      playClip("/game/audio/ui/family-packet-received.mp3");
      setFamilyRelayReplyUnlocked((value) =>
        value.includes(activeMission.id) ? value : [...value, activeMission.id],
      );
      setFamilyRelayPhase((value) => (familyRelayOpen ? "result" : value));
      setGameLogs((value) =>
        value.map((item) =>
          item.kind === "家庭互動" &&
          item.file === (familyMedia.file ?? activeMission.familyFile)
            ? {
                ...item,
                status: locale === "zh" ? "家庭已回覆" : "FAMILY REPLIED",
                summary: `${item.summary} ${reply}`,
                action: `${item.action} ${reply}`,
              }
            : item,
        ),
      );
      setCrewLogProgress((value) => ({
        ...value,
        [activeMission.id]: Math.min(90, (value[activeMission.id] ?? 0) + 8),
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    localNow,
    familyPending,
    familyProcessed,
    familyReady,
    missionTimeMinutes,
    interactionCount,
    locale,
    familyMedia.replyZh,
    familyMedia.replyEn,
    playClip,
    activeMission.id,
    activeMission.familyFile,
    activeMissionText.familyTitle,
    familyRelayOpen,
    familyMedia.file,
  ]);
  useEffect(() => {
    if (activeSideEvent || !sideEventReply) return;
    const timer = window.setTimeout(() => {
      if (!mainMissionResolved) {
        setSideEventReply("");
        return;
      }
      const nextCount = Math.min(
        requiredSideCount,
        handledRequiredSideCount + 1,
      );
      setRequiredSideInteractions((value) => ({
        ...value,
        [activeMission.id]: nextCount,
      }));
      setSideEventReply("");
      if (nextCount < requiredSideCount) {
        const available = sideEvents.filter(
          (event) => !seenSideEvents.includes(event.id),
        );
        const nextEvent =
          available[
            (activeMissionIndex * 43 + nextCount * 19 + interactionCount * 5) %
              Math.max(1, available.length)
          ];
        if (nextEvent) {
          setSeenSideEvents((value) => [...value, nextEvent.id]);
          setSelectedPrivateCrew(nextEvent.from);
          setActiveSideEvent(nextEvent);
          playClip("/game/audio/ui/private-message-received.mp3");
        }
      } else {
        setNotice(
          locale === "zh"
            ? "必要船員互動已完成，可返回任務結果正式結案"
            : "REQUIRED CREW CONTACTS COMPLETE — RETURN TO THE MISSION RESULT",
        );
        window.setTimeout(() => setNotice(""), 2200);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    activeSideEvent,
    sideEventReply,
    mainMissionResolved,
    requiredSideCount,
    handledRequiredSideCount,
    activeMission.id,
    activeMissionIndex,
    interactionCount,
    seenSideEvents,
    playClip,
    locale,
  ]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume / 100;
  }, [musicVolume]);
  useEffect(() => {
    if (ambienceAudioRef.current)
      ambienceAudioRef.current.volume = Math.min(
        0.28,
        (musicVolume / 100) * 0.28,
      );
  }, [musicVolume]);
  useEffect(() => {
    const audio = ambienceAudioRef.current;
    if (!audio) return;
    if (showIntro) {
      audio.pause();
      return;
    }
    audio.load();
    void audio.play().catch(() => undefined);
    return () => audio.pause();
  }, [ambienceSrc, showIntro]);
  useEffect(() => {
    const audio = missionAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setMissionAudioPlaying(false);
    const nextMedia =
      missionMedia[
        storyMissions[
          Math.min(activeMissionIndex + 1, storyMissions.length - 1)
        ].id
      ];
    const assets = [
      activeMissionMedia.scene,
      nextMedia.scene,
      ...nextMedia.celestial.map((item) => item.src),
    ];
    assets.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [activeMission.id, activeMissionIndex, activeMissionMedia.scene]);
  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    const loadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          completed += 1;
          if (!cancelled)
            setGameLoadProgress(
              Math.round((completed / initialGameImages.length) * 100),
            );
          resolve();
        };
        image.onload = finish;
        image.onerror = finish;
        image.src = src;
        if (image.complete) finish();
      });
    void Promise.all(initialGameImages.map(loadImage)).then(() => {
      if (!cancelled) setGameImagesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!enteringGame || gameImagesReady) return;
    const timer = window.setTimeout(() => setShowSlowLoading(true), 350);
    return () => window.clearTimeout(timer);
  }, [enteringGame, gameImagesReady]);
  useEffect(() => {
    if (!enteringGame || !gameImagesReady) return;
    const timer = window.setTimeout(() => {
      setShowSlowLoading(false);
      setShowIntro(false);
      setEnteringGame(false);
      setHasSavedGame(true);
      setTab(locale === "zh" ? "任務控制" : "Mission Control");
    }, 120);
    return () => window.clearTimeout(timer);
  }, [enteringGame, gameImagesReady, locale]);
  useEffect(() => {
    const initial = window.setTimeout(() => setLocalNow(new Date()), 0);
    const timer = window.setInterval(() => setLocalNow(new Date()), 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedLocale = window.localStorage.getItem(
          "light-year-relay:locale",
        );
        const detected = window.navigator.languages.some(isTaiwanLocale)
          ? "zh"
          : "en";
        const nextLocale =
          savedLocale === "zh" || savedLocale === "en" ? savedLocale : detected;
        setLocale(nextLocale);
        setTab(nextLocale === "zh" ? "任務控制" : "Mission Control");
        const save = window.localStorage.getItem(
          "light-year-relay:game-save:v1",
        );
        const legacy = JSON.parse(
          window.localStorage.getItem(
            "light-year-relay:communication-logs:v1",
          ) || "[]",
        );
        setHasSavedGame(
          Boolean(save) || (Array.isArray(legacy) && legacy.length > 0),
        );
      } catch {
        setHasSavedGame(false);
      } finally {
        setLogsHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!logsHydrated) return;
    const timer = window.setTimeout(
      () => setGameLogs((logs) => uniqueCommunicationLogs(logs)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [logsHydrated]);
  useEffect(() => {
    if (!logsHydrated || showIntro) return;
    const save = {
      activeMissionIndex,
      academyDone,
      reviewPool,
      bandwidth,
      trust,
      morale,
      gameLogs,
      crewLogProgress,
      seenSideEvents,
      interactionCount,
      missionTimeMinutes,
      completedMissionIds,
      mainMissionResolvedIds,
      requiredSideInteractions,
      familyBond,
      honesty,
      familyRelayResults,
      familyRelayReplyUnlocked,
      familyRelayReady,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(
      "light-year-relay:game-save:v1",
      JSON.stringify(save),
    );
    window.localStorage.setItem(
      "light-year-relay:communication-logs:v1",
      JSON.stringify(gameLogs),
    );
  }, [
    activeMissionIndex,
    academyDone,
    reviewPool,
    bandwidth,
    trust,
    morale,
    gameLogs,
    crewLogProgress,
    seenSideEvents,
    interactionCount,
    missionTimeMinutes,
    completedMissionIds,
    mainMissionResolvedIds,
    requiredSideInteractions,
    familyBond,
    honesty,
    familyRelayResults,
    familyRelayReplyUnlocked,
    familyRelayReady,
    logsHydrated,
    showIntro,
  ]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const set = missionCommands[activeMission.id];
      setSelection({
        goal: set.goal[0].id,
        action: set.action[0].id,
        risk: set.risk[0].id,
        tone: set.tone[0].id,
      });
      setActiveData("telemetry");
      setFollowupChoice(null);
      setPhase("review");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeMission.id]);
  useEffect(() => {
    if (phase !== "review" || showIntro) return;
    const timer = window.setTimeout(
      () =>
        setReviewedData((v) => {
          const current = v[activeMission.id] ?? [];
          if (current.includes(activeData)) return v;
          advanceMissionTime(6);
          return { ...v, [activeMission.id]: [...current, activeData] };
        }),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [activeData, activeMission.id, phase, showIntro]);
  useEffect(() => {
    if (showIntro || phase !== "review") return;
    const dataIndex = ["telemetry", "sensors", "maintenance", "vitals"].indexOf(
      activeData,
    );
    if (dataIndex >= 0)
      playClip(`/game/audio/ambience/document-load0${dataIndex + 1}.mp3`);
  }, [activeData, phase, showIntro, playClip]);
  const instruction = useMemo(() => {
    const clause = (key: ChoiceKey) =>
      missionChoiceSet[key].find((option) => option.id === selection[key])
        ?.clause ?? "";
    return `${clause("tone")} ${clause("goal")} ${clause("action")} ${clause("risk")}`;
  }, [missionChoiceSet, selection]);
  const advanceCrewLogs = (amount = 1) => {
    setCrewLogProgress((v) => ({
      ...v,
      [activeMission.id]: Math.min(90, (v[activeMission.id] ?? 0) + amount),
    }));
    const nextInteraction = interactionCount + 1;
    setInteractionCount(nextInteraction);
    if (nextInteraction % 3 === 0 && !activeSideEvent) {
      const available = sideEvents.filter(
        (event) => !seenSideEvents.includes(event.id),
      );
      const event =
        available[
          (activeMissionIndex * 37 + nextInteraction * 11) %
            Math.max(1, available.length)
        ];
      if (event) {
        playClip("/game/audio/ui/private-message-received.mp3");
        setSeenSideEvents((v) => [...v, event.id]);
        setSideEventReply("");
        setActiveSideEvent(event);
      }
    }
  };
  const choose = (key: ChoiceKey, id: string) => {
    setSelection((v) => ({ ...v, [key]: id }));
    advanceCrewLogs(1);
    advanceMissionTime(3);
  };
  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const currentQuestion = (
    locale === "zh" ? academyQuestions : academyQuestionsEnglish
  )[academyIndex];
  const displayedAcademyModules =
    locale === "zh" ? academyModules : academyModulesEnglish;
  const answerQuestion = (answer: number) => {
    if (academyAnswer !== null) return;
    setAcademyAnswer(answer);
    setAcademyDone((v) => Math.min(150, v + 1));
    advanceCrewLogs(1);
    advanceMissionTime(8);
    if (answer !== currentQuestion.answer)
      setReviewPool((v) =>
        v.includes(currentQuestion.id) ? v : [...v, currentQuestion.id],
      );
    else if (academyMode === "review")
      setReviewPool((v) => v.filter((id) => id !== currentQuestion.id));
  };
  const nextQuestion = () => {
    setAcademyAnswer(null);
    if (academyMode === "review") {
      const answeredCorrectly = academyAnswer === currentQuestion.answer;
      const remaining = answeredCorrectly
        ? reviewPool.filter((id) => id !== currentQuestion.id)
        : reviewPool;
      if (remaining.length === 0) {
        setAcademyMode("course");
        setAcademyIndex((value) => (value + 1) % academyQuestions.length);
        toast(
          locale === "zh"
            ? "複習池已清空，所有錯題都已通過"
            : "REVIEW POOL CLEARED",
        );
        return;
      }
      const currentPosition = remaining.indexOf(currentQuestion.id);
      const nextId =
        remaining[
          currentPosition >= 0 ? (currentPosition + 1) % remaining.length : 0
        ];
      setAcademyIndex(
        Math.max(
          0,
          academyQuestions.findIndex((question) => question.id === nextId),
        ),
      );
      return;
    }
    setAcademyIndex((v) => (v + 1) % academyQuestions.length);
  };
  const openReviewPool = () => {
    setAcademyMode("review");
    setAcademyAnswer(null);
    const firstReviewIndex = academyQuestions.findIndex(
      (question) => question.id === reviewPool[0],
    );
    if (firstReviewIndex >= 0) setAcademyIndex(firstReviewIndex);
  };
  const localizeCommunicationLog = (
    log: (typeof communicationLogs)[number],
  ) => {
    if (
      locale === "zh" ||
      !/[\u3400-\u9fff]/.test(
        `${log.title}${log.summary}${log.status}${log.action}`,
      )
    )
      return log;
    const kindName =
      log.kind === "家庭互動"
        ? "FAMILY RELAY"
        : log.kind === "太空人通訊"
          ? "CREW COMMUNICATION"
          : log.kind === "附件傳遞"
            ? "ATTACHMENT TRANSFER"
            : "CONTROL AUDIT";
    const status = log.status.includes("等待")
      ? "PENDING"
      : log.status.includes("傳送")
        ? "TRANSMITTED"
        : log.status.includes("完成") || log.status.includes("成功")
          ? "COMPLETE"
          : "RECORDED";
    return {
      ...log,
      title: `${kindName} · ${log.file}`,
      summary: `A ${kindName.toLowerCase()} record was created during mission operations. Open the attached packet and audit entry for transmission details.`,
      status,
      action: `Mission Control recorded this player action in the immutable operational audit for ${log.file}.`,
    };
  };
  const uniqueGameLogs = useMemo(
    () => uniqueCommunicationLogs(gameLogs),
    [gameLogs],
  );
  const visibleLogs = (
    logFilter === "全部"
      ? uniqueGameLogs
      : uniqueGameLogs.filter((log) => log.kind === logFilter)
  ).map(localizeCommunicationLog);
  const activeSourceLog =
    uniqueGameLogs.find((log) => log.id === selectedLog) ?? uniqueGameLogs[0];
  const activeLog = activeSourceLog
    ? localizeCommunicationLog(activeSourceLog)
    : {
        id: "—",
        kind: "管理日誌" as const,
        icon: "◎",
        time: locale === "zh" ? "尚未建立" : "NOT ESTABLISHED",
        from: "MISSION CONTROL",
        title: locale === "zh" ? "尚無遊玩紀錄" : "NO MISSION RECORDS",
        summary:
          locale === "zh"
            ? "完成任務操作後，相關通訊、附件與玩家管理動作會自動寫入這裡。"
            : "Communications, attachments, and player actions will be recorded here after mission operations.",
        file: "NO PACKET",
        size: "0 KB",
        level: "—",
        status: locale === "zh" ? "等待操作" : "AWAITING ACTION",
        action:
          locale === "zh"
            ? "目前沒有可顯示的玩家操作。"
            : "No player action is available to display.",
      };
  const attachmentMission =
    storyMissions.find((mission) => {
      const media = familyRelayMedia[mission.id];
      return (
        activeLog.file === mission.familyFile ||
        activeLog.file === media.file ||
        activeLog.title.includes(mission.id) ||
        activeLog.title.includes(mission.title) ||
        activeLog.title.includes(missionEnglish[mission.id].title)
      );
    }) ?? activeMission;
  const attachmentMedia = familyRelayMedia[attachmentMission.id];
  const inboundFamilyMedia = familyInboundMedia[attachmentMission.id];
  const attachmentIsInboundFamily = activeLog.kind === "家庭互動";
  const attachmentIsFamily =
    attachmentIsInboundFamily ||
    activeLog.file === attachmentMission.familyFile ||
    activeLog.file === attachmentMedia.file;
  const attachmentTitle = attachmentIsInboundFamily
    ? locale === "zh"
      ? inboundFamilyMedia.titleZh
      : inboundFamilyMedia.titleEn
    : attachmentIsFamily
      ? locale === "zh"
        ? attachmentMedia.kindZh
        : attachmentMedia.kindEn
      : locale === "zh"
        ? missionText(attachmentMission).title
        : missionEnglish[attachmentMission.id].title;
  const attachmentDescription = attachmentIsInboundFamily
    ? locale === "zh"
      ? inboundFamilyMedia.descriptionZh
      : inboundFamilyMedia.descriptionEn
    : attachmentIsFamily
      ? locale === "zh"
        ? attachmentMedia.descriptionZh
        : attachmentMedia.descriptionEn
      : locale === "zh"
        ? missionText(attachmentMission).report
        : missionEnglish[attachmentMission.id].report;
  const attachmentFile = attachmentIsInboundFamily
    ? inboundFamilyMedia.file
    : activeLog.file;
  const attachmentSize = attachmentIsInboundFamily
    ? inboundFamilyMedia.size
    : activeLog.size;
  const familyHandled = gameLogs.some(
    (log) =>
      log.kind === "家庭互動" && log.time.includes(`DAY ${activeMission.day}`),
  );
  const unlockedCrewLogCount = Math.min(
    90,
    crewLogProgress[activeMission.id] ?? 0,
  );
  const missionCrewLogs = useMemo(
    () =>
      crewLogsByMission[activeMission.id]
        .slice(0, unlockedCrewLogCount)
        .map((log) =>
          personalizeCrewLog(log, {
            instruction,
            familyHandled,
            academyDone,
            trust,
            morale,
            phase,
            locale,
          }),
        )
        .reverse(),
    [
      activeMission.id,
      unlockedCrewLogCount,
      instruction,
      familyHandled,
      academyDone,
      trust,
      morale,
      phase,
      locale,
    ],
  );
  const visibleCrewLogs =
    crewLogFilter === "全部"
      ? missionCrewLogs
      : missionCrewLogs.filter((log) => log.category === crewLogFilter);
  const activeCrewLog =
    missionCrewLogs.find((log) => log.id === selectedCrewLog) ??
    missionCrewLogs[0];
  const addGameLog = (
    kind: (typeof communicationLogs)[number]["kind"],
    title: string,
    action: string,
    file = "CONTROL_ACTION.log",
    size = "2 KB",
    level = "LEVEL 1",
    status = "已記錄",
  ) => {
    const id = `${kind === "家庭互動" ? "FAM" : kind === "太空人通訊" ? "COM" : "AUD"}-${missionDay}-${String(gameLogs.length + 1).padStart(2, "0")}`;
    const log = {
      id,
      kind,
      icon: kind === "家庭互動" ? "♡" : kind === "太空人通訊" ? "◉" : "⌁",
      time: `DAY ${missionDay} · ${missionClock} SHIP TIME`,
      from:
        kind === "家庭互動"
          ? "Mission Control → Vale Family"
          : kind === "太空人通訊"
            ? "Mission Control → Cassian"
            : "Mission Control Audit",
      title,
      summary: action,
      file,
      size,
      level,
      status,
      action,
    };
    setGameLogs((v) => [
      log,
      ...v.filter(
        (item) =>
          !(item.kind === kind && item.title === title && item.file === file),
      ),
    ]);
    setSelectedLog(id);
    advanceMissionTime(
      kind === "家庭互動" ? 12 : kind === "太空人通訊" ? 5 : 10,
    );
    advanceCrewLogs(kind === "家庭互動" ? 8 : kind === "太空人通訊" ? 12 : 3);
  };
  const queueRequiredSideEvent = () => {
    if (activeSideEvent) return;
    const available = sideEvents.filter(
      (event) => !seenSideEvents.includes(event.id),
    );
    const event =
      available[
        (activeMissionIndex * 41 +
          handledRequiredSideCount * 17 +
          interactionCount * 7) %
          Math.max(1, available.length)
      ];
    if (event) {
      playClip("/game/audio/ui/private-message-received.mp3");
      setSeenSideEvents((value) => [...value, event.id]);
      setSideEventReply("");
      setSelectedPrivateCrew(event.from);
      setActiveSideEvent(event);
    }
  };
  const finishMission = () => {
    if (!mainMissionResolved) {
      setMainMissionResolvedIds((value) =>
        value.includes(activeMission.id) ? value : [...value, activeMission.id],
      );
      addGameLog(
        "管理日誌",
        locale === "zh"
          ? `主線處置完成：${activeMission.title}`
          : `MAIN DIRECTIVE RESOLVED: ${activeMissionText.title}`,
        `${currentResult.title}／${currentResult.result}。${currentResult.lesson}`,
        "MISSION_RESULT.json",
        "6 KB",
        "LEVEL 2",
        locale === "zh" ? "等待支線結案" : "AWAITING SIDE OPERATIONS",
      );
    }
    if (!familySubmitted || handledRequiredSideCount < requiredSideCount) {
      if (handledRequiredSideCount < requiredSideCount)
        queueRequiredSideEvent();
      setMissionGateOpen(true);
      return;
    }
    setCompletedMissionIds((value) =>
      value.includes(activeMission.id) ? value : [...value, activeMission.id],
    );
    if (activeMissionIndex < storyMissions.length - 1) {
      const nextIndex = activeMissionIndex + 1;
      const next = storyMissions[nextIndex];
      setActiveMissionIndex(nextIndex);
      setOverviewMissionIndex(nextIndex);
      setMissionTimeMinutes((value) =>
        Math.max(value + 60, (next.day - 1) * 1440 + 8 * 60),
      );
      setMorale(missionStatus[next.id].crew.morale);
      setTrust(missionStatus[next.id].crew.trust);
      setActiveData("telemetry");
      setPhase("review");
      toast(
        locale === "zh"
          ? `任務已結案，新任務解鎖：${next.title}`
          : `MISSION CLOSED — NEW MISSION UNLOCKED: ${missionText(next).title}`,
      );
    } else {
      setShowIntro(true);
      toast(
        locale === "zh"
          ? "Aurora-7 主線任務已完成"
          : "AURORA-7 STORY ARC COMPLETE",
      );
    }
  };
  const startMusic = () => {
    void audioRef.current?.play().catch(() => undefined);
    void ambienceAudioRef.current?.play().catch(() => undefined);
  };
  const toggleMissionReport = () => {
    const audio = missionAudioRef.current;
    if (!audio) return;
    audio.volume = Math.min(1, Math.max(0.2, musicVolume / 100));
    if (audio.paused) {
      void audio
        .play()
        .then(() => setMissionAudioPlaying(true))
        .catch(() => undefined);
    } else {
      audio.pause();
      setMissionAudioPlaying(false);
    }
  };
  const openGame = () => {
    startMusic();
    setResumePrompt(false);
    setShowSlowLoading(false);
    setEnteringGame(true);
  };
  const chooseLocale = (nextLocale: "zh" | "en") => {
    window.localStorage.setItem("light-year-relay:locale", nextLocale);
    setLocale(nextLocale);
    setTab(nextLocale === "zh" ? "任務控制" : "Mission Control");
  };
  const startNewGame = () => {
    window.localStorage.removeItem("light-year-relay:game-save:v1");
    window.localStorage.removeItem("light-year-relay:communication-logs:v1");
    setGameLogs([]);
    setCrewLogProgress({});
    setSeenSideEvents([]);
    setInteractionCount(0);
    setActiveSideEvent(null);
    setSelectedLog("");
    setSelectedCrewLog("");
    setActiveMissionIndex(0);
    setOverviewMissionIndex(0);
    setCompletedMissionIds([]);
    setMainMissionResolvedIds([]);
    setRequiredSideInteractions({});
    setFamilyRelayResults({});
    setFamilyRelayReplyUnlocked([]);
    setFamilyRelayReady({});
    setFamilyBond(62);
    setHonesty(70);
    setFamilyRelayPhase("review");
    setMissionTimeMinutes((43 - 1) * 1440 + 8 * 60 + 20);
    setAcademyDone(0);
    setReviewPool([]);
    setBandwidth(100);
    setTrust(missionStatus[storyMissions[0].id].crew.trust);
    setMorale(missionStatus[storyMissions[0].id].crew.morale);
    setActiveData("telemetry");
    setPhase("review");
    setHasSavedGame(false);
    openGame();
  };
  const continueGame = () => {
    try {
      const raw = window.localStorage.getItem("light-year-relay:game-save:v1");
      if (raw) {
        const save = JSON.parse(raw);
        const savedResults =
          save.familyRelayResults && typeof save.familyRelayResults === "object"
            ? save.familyRelayResults
            : {};
        const savedMissionIndex = Math.min(
          4,
          Math.max(0, Number(save.activeMissionIndex) || 0),
        );
        setActiveMissionIndex(savedMissionIndex);
        setOverviewMissionIndex(savedMissionIndex);
        setMissionTimeMinutes(
          Number(save.missionTimeMinutes) || (43 - 1) * 1440 + 8 * 60 + 20,
        );
        setCompletedMissionIds(
          Array.isArray(save.completedMissionIds)
            ? save.completedMissionIds
            : [],
        );
        setMainMissionResolvedIds(
          Array.isArray(save.mainMissionResolvedIds)
            ? save.mainMissionResolvedIds
            : [],
        );
        setRequiredSideInteractions(
          save.requiredSideInteractions &&
            typeof save.requiredSideInteractions === "object"
            ? save.requiredSideInteractions
            : {},
        );
        setFamilyRelayResults(savedResults);
        setFamilyRelayReplyUnlocked(
          Array.isArray(save.familyRelayReplyUnlocked)
            ? save.familyRelayReplyUnlocked
            : Object.keys(savedResults),
        );
        setFamilyRelayReady(
          save.familyRelayReady && typeof save.familyRelayReady === "object"
            ? save.familyRelayReady
            : {},
        );
        setFamilyBond(Number(save.familyBond) || 62);
        setHonesty(Number(save.honesty) || 70);
        setAcademyDone(Number(save.academyDone) || 0);
        setReviewPool(Array.isArray(save.reviewPool) ? save.reviewPool : []);
        setBandwidth(Number(save.bandwidth) || 100);
        setTrust(Number(save.trust) || 68);
        setMorale(Number(save.morale) || 70);
        setCrewLogProgress(
          save.crewLogProgress && typeof save.crewLogProgress === "object"
            ? save.crewLogProgress
            : {},
        );
        setSeenSideEvents(
          Array.isArray(save.seenSideEvents) ? save.seenSideEvents : [],
        );
        setInteractionCount(Number(save.interactionCount) || 0);
        const logs = Array.isArray(save.gameLogs) ? save.gameLogs : [];
        setGameLogs(logs);
        setSelectedLog(logs[0]?.id ?? "");
      } else {
        const legacy = JSON.parse(
          window.localStorage.getItem(
            "light-year-relay:communication-logs:v1",
          ) || "[]",
        );
        setGameLogs(Array.isArray(legacy) ? legacy : []);
        setSelectedLog(legacy[0]?.id ?? "");
      }
      openGame();
    } catch {
      startNewGame();
    }
  };
  const requestStart = () => {
    let saved = hasSavedGame;
    try {
      const save = window.localStorage.getItem("light-year-relay:game-save:v1");
      const legacy = JSON.parse(
        window.localStorage.getItem("light-year-relay:communication-logs:v1") ||
          "[]",
      );
      saved = Boolean(save) || (Array.isArray(legacy) && legacy.length > 0);
    } catch {
      saved = false;
    }
    if (saved) setResumePrompt(true);
    else startNewGame();
  };
  const navItems =
    locale === "zh"
      ? ["任務控制", "資料總覽", "通訊記錄", "船組日誌", "教育課程", "設定"]
      : [
          "Mission Control",
          "Data Overview",
          "Communications",
          "Crew Log",
          "Academy",
          "Settings",
        ];
  return (
    <>
      <audio
        ref={audioRef}
        src="/game/audio/music/星際回聲.mp3"
        loop
        preload="auto"
      />
      <audio
        ref={missionAudioRef}
        src={activeMissionMedia.audio}
        preload="metadata"
        onEnded={() => setMissionAudioPlaying(false)}
      />
      <audio ref={ambienceAudioRef} src={ambienceSrc} loop preload="metadata" />
      {missionsOpen && (
        <aside
          className="mission-asset-rack"
          aria-label={
            locale === "zh" ? "任務視覺參考" : "Mission visual references"
          }
        >
          <header>
            <span>VISUAL REFERENCE FEED</span>
            <b>{activeMission.id}</b>
          </header>
          <div>
            <figure
              style={{ backgroundImage: `url('${activeMissionMedia.ship}')` }}
            >
              <figcaption>
                DISTANT VOYAGER-07 ·{" "}
                {activeMissionIndex === 0 || activeMissionIndex === 4
                  ? "FRONT"
                  : activeMissionIndex === 1
                    ? "SIDE"
                    : activeMissionIndex === 2
                      ? "TOP"
                      : "REAR"}
              </figcaption>
            </figure>
            {activeMissionMedia.celestial.map((item) => (
              <figure
                key={item.name}
                style={{ backgroundImage: `url('${item.src}')` }}
              >
                <figcaption>{item.name}</figcaption>
              </figure>
            ))}
          </div>
        </aside>
      )}
      <div className="orientation-guard" role="alert" aria-live="polite">
        <div className="orientation-stars" />
        <div className="orientation-scan" />
        <section>
          <div className="orientation-mark">
            <i />
            <span>↻</span>
          </div>
          <small>DISPLAY ORIENTATION PROTOCOL</small>
          <h1>{locale === "zh" ? "請將手機轉為橫式" : "ROTATE YOUR DEVICE"}</h1>
          <p>
            {locale === "zh"
              ? "深空任務控制台需要橫向顯示。偵測到橫式後，系統將自動解除鎖定。"
              : "The deep-space control console requires landscape mode. Access will unlock automatically when detected."}
          </p>
          <div className="orientation-status">
            <i />{" "}
            {locale === "zh" ? "等待橫式訊號" : "AWAITING LANDSCAPE SIGNAL"}
          </div>
        </section>
        <footer>LYR // MOBILE DISPLAY GATE　·　AURORA-7</footer>
      </div>
      {showSlowLoading && (
        <div
          className="network-loading"
          role="alert"
          aria-live="assertive"
          aria-busy="true"
        >
          <div className="network-loading-grid" />
          <section>
            <div className="loading-orbit">
              <i>✦</i>
              <em />
              <em />
              <em />
            </div>
            <small>DEEP SPACE RELAY // LINK ACQUISITION</small>
            <h2>
              {locale === "zh"
                ? "通訊連線不穩定"
                : "UNSTABLE COMMUNICATION LINK"}
            </h2>
            <p>
              {locale === "zh"
                ? "正在接收任務影像與船員資料，請稍候保持連線。"
                : "Receiving mission imagery and crew telemetry. Please maintain the connection."}
            </p>
            <div className="loading-signal">
              <i style={{ width: `${Math.max(8, gameLoadProgress)}%` }} />
            </div>
            <footer>
              <span>
                {locale === "zh"
                  ? "建立深空通訊"
                  : "ESTABLISHING DEEP-SPACE RELAY"}
              </span>
              <b>{gameLoadProgress}%</b>
            </footer>
          </section>
        </div>
      )}
      {showIntro ? (
        <main
          className="game-intro"
          lang={locale === "zh" ? "zh-Hant" : "en"}
          onPointerDown={startMusic}
        >
          <div className="intro-vignette" />
          <div className="intro-grid" />
          <div
            className={`intro-logo ${locale}`}
            aria-label={
              locale === "zh" ? "光年回信 Light-Year Relay" : "Light-Year Relay"
            }
          >
            <small>DEEP SPACE COMMUNICATION SYSTEM</small>
            <div className="logo-title">
              <i />
              <h1>{locale === "zh" ? "光年回信" : "LIGHT-YEAR RELAY"}</h1>
              <i />
            </div>
            <div className="logo-subtitle">
              <i />
              <span>
                {locale === "zh" ? "LIGHT-YEAR RELAY" : "光 年 回 信"}
              </span>
              <i />
            </div>
            <p>
              <i />{" "}
              {locale === "zh"
                ? "跨越光年的指令，改變他的未來"
                : "A SIGNAL ACROSS LIGHT-YEARS CAN CHANGE HIS FUTURE"}{" "}
              <i />
            </p>
          </div>
          <section className="intro-copy">
            <p>
              {locale === "zh"
                ? "當距離超過光年，"
                : "WHEN DISTANCE SPANS LIGHT-YEARS,"}
              <br />
              {locale === "zh"
                ? "回信，就是最強的連結。"
                : "A REPLY BECOMES THE STRONGEST BOND."}
            </p>
          </section>
          <section
            className="intro-status"
            aria-label={locale === "zh" ? "任務狀態" : "Mission status"}
          >
            <header>{locale === "zh" ? "任務狀態" : "MISSION STATUS"}</header>
            <div>
              <span>▣　{locale === "zh" ? "任務日" : "MISSION DAY"}</span>
              <b>
                317 <small>DAYS</small>
              </b>
            </div>
            <div>
              <span>◉　{locale === "zh" ? "通訊延遲" : "COMMS DELAY"}</span>
              <b>18m 24s</b>
            </div>
            <div>
              <span>✥　{locale === "zh" ? "太空船狀態" : "VESSEL STATUS"}</span>
              <b>{locale === "zh" ? "穩定" : "STABLE"}</b>
            </div>
            <div>
              <span>♙　{locale === "zh" ? "太空人狀態" : "CREW STATUS"}</span>
              <b>{locale === "zh" ? "良好" : "GOOD"}</b>
            </div>
          </section>
          <section className="intro-news">
            <header>
              <span>{locale === "zh" ? "最新消息" : "LATEST MESSAGES"}</span>
              <button>{locale === "zh" ? "更多" : "MORE"}　›</button>
            </header>
            <div>
              <i className="news-ok">●</i>
              <time>14:36</time>
              <p>
                <b>Cassian {locale === "zh" ? "回報" : "REPORT"}：</b>
                {locale === "zh"
                  ? "氧氣循環效率下降 18%。"
                  : "Oxygen circulation efficiency decreased by 18%."}
              </p>
            </div>
            <div>
              <i className="news-warn">▲</i>
              <time>14:21</time>
              <p>
                {locale === "zh"
                  ? "太陽風活動增強，預計 3 小時後抵達。"
                  : "Solar wind activity rising; arrival in 3 hours."}
              </p>
            </div>
            <div>
              <i className="news-alert">●</i>
              <time>13:47</time>
              <p>
                <b>Mission Control</b>{" "}
                {locale === "zh"
                  ? "已更新任務計畫。"
                  : "updated the mission plan."}
              </p>
            </div>
            <div>
              <i>●</i>
              <time>13:10</time>
              <p>
                <b>Sophie</b>{" "}
                {locale === "zh"
                  ? "傳送新圖作與語音訊息。"
                  : "sent a new drawing and voice message."}
              </p>
            </div>
            <div>
              <i>●</i>
              <time>12:05</time>
              <p>
                {locale === "zh"
                  ? "已接收科學資料：木衛二表面熱異常。"
                  : "Science data received: Europa thermal anomaly."}
              </p>
            </div>
          </section>
          <nav
            className="intro-utilities"
            aria-label={locale === "zh" ? "其他功能" : "Utilities"}
          >
            <button onClick={() => setInfoPanel("credits")}>
              <i>♙</i>
              <b>{locale === "zh" ? "製作團隊" : "CREDITS"}</b>
              <small>CREDITS</small>
            </button>
            <button onClick={() => setInfoPanel("tutorial")}>
              <i>▧</i>
              <b>{locale === "zh" ? "教學指南" : "TUTORIAL"}</b>
              <small>TUTORIAL</small>
            </button>
            <button onClick={() => setInfoPanel("news")}>
              <i>▭</i>
              <b>{locale === "zh" ? "最新消息" : "NEWS"}</b>
              <small>NEWS</small>
            </button>
          </nav>
          <section className="intro-actions">
            <button className="intro-enter" onClick={requestStart}>
              <i>▶</i>
              <span>
                <b>{locale === "zh" ? "接收傳輸" : "RECEIVE TRANSMISSION"}</b>
                <small>
                  {locale === "zh"
                    ? "接收來自 Aurora-7 的最新傳輸訊號。"
                    : "Receive the latest transmission from Aurora-7."}
                </small>
              </span>
            </button>
            <button
              className="intro-continue"
              disabled={!hasSavedGame}
              onClick={continueGame}
            >
              <i>↻</i>
              <span>
                <b>{locale === "zh" ? "繼續任務" : "RESUME MISSION"}</b>
                <small>
                  {hasSavedGame
                    ? locale === "zh"
                      ? "讀取本機任務紀錄"
                      : "LOAD LOCAL MISSION SAVE"
                    : locale === "zh"
                      ? "目前沒有本機紀錄"
                      : "NO LOCAL SAVE FOUND"}
                </small>
              </span>
            </button>
            <button
              className="intro-settings-button"
              onClick={() => setShowSettings(true)}
            >
              <i>⚙</i>
              <span>
                <b>{locale === "zh" ? "設定" : "SETTINGS"}</b>
                <small>
                  {locale === "zh"
                    ? "音樂與介面語言"
                    : "AUDIO & INTERFACE LANGUAGE"}
                </small>
              </span>
            </button>
          </section>
          <footer className="intro-footer">
            <span>EARTH MISSION CONTROL CENTER</span>
            <span>UTC 2049 / 06 / 22　14:38:27</span>
            <b>VERSION 1.0.0</b>
          </footer>
          {resumePrompt && (
            <div className="settings-backdrop">
              <section
                className="save-choice-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="save-choice-title"
              >
                <div className="save-orbit">
                  <i>✦</i>
                  <em />
                </div>
                <small>LOCAL MISSION SAVE DETECTED</small>
                <h2 id="save-choice-title">
                  {locale === "zh"
                    ? "偵測到上次任務進度"
                    : "PREVIOUS MISSION SAVE DETECTED"}
                </h2>
                <p>
                  {locale === "zh"
                    ? "本機保存了 Aurora-7 的任務狀態、Cassian 數值、家庭頻寬、教育進度與通訊紀錄。你要繼續上次進度，還是清除所有紀錄並重新開始？"
                    : "This device contains Aurora-7 mission status, Cassian's condition, family bandwidth, academy progress, and communication records. Continue the saved mission or clear it and begin again?"}
                </p>
                <div className="save-summary">
                  <span>STORAGE</span>
                  <b>LOCAL DEVICE</b>
                  <span>STATUS</span>
                  <b className="save-ok">VERIFIED</b>
                </div>
                <div className="save-choice-actions">
                  <button onClick={() => setResumePrompt(false)}>
                    {locale === "zh" ? "返回" : "BACK"}
                  </button>
                  <button className="new-game-danger" onClick={startNewGame}>
                    {locale === "zh"
                      ? "清除紀錄／開始新遊戲"
                      : "CLEAR SAVE / NEW GAME"}
                  </button>
                  <button className="continue-save" onClick={continueGame}>
                    {locale === "zh" ? "繼續上次進度" : "CONTINUE MISSION"}　→
                  </button>
                </div>
                <small className="save-warning">
                  {locale === "zh"
                    ? "開始新遊戲將清除目前瀏覽器中的所有遊玩紀錄。"
                    : "Starting a new game permanently clears this browser's current mission record."}
                </small>
              </section>
            </div>
          )}
          {showSettings && (
            <div
              className="settings-backdrop"
              onClick={() => setShowSettings(false)}
            >
              <section
                className="settings-modal"
                role="dialog"
                aria-modal="true"
                aria-label={locale === "zh" ? "設定" : "Settings"}
                onClick={(event) => event.stopPropagation()}
              >
                <header>
                  <div>
                    <small>SYSTEM CONFIGURATION</small>
                    <h2>{locale === "zh" ? "設定" : "SETTINGS"}</h2>
                  </div>
                  <button
                    aria-label={locale === "zh" ? "關閉" : "Close"}
                    onClick={() => setShowSettings(false)}
                  >
                    ×
                  </button>
                </header>
                <label className="volume-setting">
                  <span>
                    <b>{locale === "zh" ? "背景音樂" : "BACKGROUND MUSIC"}</b>
                    <small>
                      {locale === "zh" ? "星際回聲" : "INTERSTELLAR ECHO"}
                    </small>
                  </span>
                  <output>{musicVolume}%</output>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(event) =>
                      setMusicVolume(Number(event.target.value))
                    }
                  />
                </label>
                <div className="language-setting">
                  <span>
                    <b>{locale === "zh" ? "介面語言" : "INTERFACE LANGUAGE"}</b>
                    <small>
                      {locale === "zh"
                        ? "選擇遊戲顯示語言"
                        : "CHOOSE DISPLAY LANGUAGE"}
                    </small>
                  </span>
                  <div>
                    <button
                      className={locale === "zh" ? "selected" : ""}
                      onClick={() => chooseLocale("zh")}
                    >
                      繁體中文
                    </button>
                    <button
                      className={locale === "en" ? "selected" : ""}
                      onClick={() => chooseLocale("en")}
                    >
                      ENGLISH
                    </button>
                  </div>
                </div>
                <button
                  className="settings-done"
                  onClick={() => setShowSettings(false)}
                >
                  {locale === "zh" ? "套用設定" : "APPLY SETTINGS"}
                </button>
              </section>
            </div>
          )}
          {infoPanel && (
            <div
              className="settings-backdrop"
              onClick={() => setInfoPanel(null)}
            >
              <section
                className={`tech-info-modal ${infoPanel}`}
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
              >
                <header>
                  <div>
                    <small>LYR // INFORMATION NODE</small>
                    <h2>
                      {infoPanel === "credits"
                        ? locale === "zh"
                          ? "製作團隊"
                          : "CREDITS"
                        : infoPanel === "tutorial"
                          ? locale === "zh"
                            ? "教學指南"
                            : "MISSION TUTORIAL"
                          : locale === "zh"
                            ? "最新消息"
                            : "LATEST NEWS"}
                    </h2>
                  </div>
                  <span>
                    NODE-0
                    {infoPanel === "credits"
                      ? "1"
                      : infoPanel === "tutorial"
                        ? "2"
                        : "3"}
                  </span>
                  <button
                    aria-label={locale === "zh" ? "關閉" : "Close"}
                    onClick={() => setInfoPanel(null)}
                  >
                    ×
                  </button>
                </header>
                <div className="tech-info-body">
                  {infoPanel === "news" && (
                    <div className="empty-transmission">
                      <i>◎</i>
                      <b>
                        {locale === "zh"
                          ? "暫時無新消息"
                          : "NO NEW TRANSMISSIONS"}
                      </b>
                      <p>
                        {locale === "zh"
                          ? "深空訊息佇列已完成同步。目前所有頻道保持靜默，系統將持續監聽來自 Aurora-7 的回傳封包。"
                          : "The deep-space message queue is synchronized. All channels are currently silent while the system continues monitoring return packets from Aurora-7."}
                      </p>
                      <small>CHANNEL STATUS · STANDBY</small>
                    </div>
                  )}
                  {infoPanel === "tutorial" && (
                    <>
                      <div className="lore-block">
                        <small>YOUR ASSIGNMENT // 2049</small>
                        <h3>
                          {locale === "zh"
                            ? "你是地球深空任務控制中心的通訊指揮官"
                            : "YOU ARE AN EARTH DEEP-SPACE COMMUNICATIONS OFFICER"}
                        </h3>
                        <p>
                          {locale === "zh"
                            ? "Aurora-7 正航向人類從未抵達的深空。光年級距離讓每一次訊息都來自過去，而你的回覆抵達時，船員早已身處另一個未來。你的任務，是在有限資料與漫長延遲中替太空人做出可靠判斷，也要運用珍貴的家庭通訊頻寬，協助他們與地球上的家人維繫情感。你守護的不只是任務，更是太空人仍與家園相連的理由。"
                            : "Aurora-7 is travelling beyond every frontier humanity has reached. Across light-year distances, every message comes from the past—and your reply arrives in another future. Your mission is to make reliable decisions with limited data and immense delay, while using precious family-relay bandwidth to help the crew remain emotionally connected to loved ones on Earth. You are protecting more than a mission: you are preserving their reason to stay connected to home."}
                        </p>
                      </div>
                      <div className="tutorial-steps">
                        <div>
                          <i>01</i>
                          <b>
                            {locale === "zh"
                              ? "閱讀延遲情報"
                              : "REVIEW DELAYED INTEL"}
                          </b>
                          <p>
                            {locale === "zh"
                              ? "檢查船況、船員狀態與通訊紀錄。"
                              : "Inspect vessel, crew, and communications data."}
                          </p>
                        </div>
                        <div>
                          <i>02</i>
                          <b>
                            {locale === "zh"
                              ? "組合任務指令"
                              : "COMPOSE A DIRECTIVE"}
                          </b>
                          <p>
                            {locale === "zh"
                              ? "選擇目標、行動、風險與溝通語氣。"
                              : "Choose objectives, actions, risk, and tone."}
                          </p>
                        </div>
                        <div>
                          <i>03</i>
                          <b>
                            {locale === "zh"
                              ? "守護家庭連結"
                              : "PRESERVE FAMILY BONDS"}
                          </b>
                          <p>
                            {locale === "zh"
                              ? "分配有限頻寬，協助太空人接收與回覆家人的訊息。"
                              : "Allocate limited bandwidth so the crew can receive and answer messages from home."}
                          </p>
                        </div>
                        <div>
                          <i>04</i>
                          <b>
                            {locale === "zh"
                              ? "承擔未來結果"
                              : "FACE THE FUTURE"}
                          </b>
                          <p>
                            {locale === "zh"
                              ? "每項指令與回信都無法撤回；等待回傳並承擔結果。"
                              : "Commands and personal replies cannot be recalled once sent."}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {infoPanel === "credits" && (
                    <div className="credits-content">
                      <div className="credits-orbit">
                        <i>✦</i>
                      </div>
                      <small>LIGHT-YEAR RELAY // CREATOR RECORD</small>
                      <h3>
                        MADE BY <b>SUSIE</b>
                      </h3>
                      <p>
                        {locale === "zh"
                          ? "《光年回信》由 Susie 製作，從世界觀、任務節奏到深空控制介面，皆以玩家在延遲通訊中做出選擇的體驗為核心。"
                          : "Light-Year Relay was created by Susie. Its world, mission rhythm, and deep-space control interface are built around the experience of making consequential choices through delayed communication."}
                      </p>
                      <div className="collaboration-line">
                        <span>GPT</span>
                        <i>×</i>
                        <span>CODEX</span>
                      </div>
                      <p>
                        {locale === "zh"
                          ? "製作過程由 Susie 主導創意與設計方向，並與 GPT、Codex 協作進行內容發想、介面建構與程式實作。這是一段由人類想像力與 AI 工具共同完成的深空訊號。"
                          : "Susie led the creative and design direction, collaborating with GPT and Codex on ideation, interface construction, and implementation—a deep-space signal shaped by human imagination and AI tools."}
                      </p>
                    </div>
                  )}
                </div>
                <footer>
                  <span>EARTH MISSION CONTROL CENTER</span>
                  <b>SECURE DATA LINK</b>
                </footer>
              </section>
            </div>
          )}
        </main>
      ) : (
        <main
          className="console"
          data-phase={phase}
          data-reviewed={reviewedCount}
          lang={locale === "zh" ? "zh-Hant" : "en"}
        >
          {notice && <div className="toast">{notice}</div>}
          {showExitConfirm && (
            <div
              className="exit-confirm-backdrop"
              onClick={() => setShowExitConfirm(false)}
            >
              <section
                className="exit-confirm"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="exit-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="exit-symbol">✦</div>
                <small>MISSION CONTROL // SESSION GATE</small>
                <h2 id="exit-title">
                  {locale === "zh"
                    ? "是否離開目前遊戲？"
                    : "LEAVE CURRENT SESSION?"}
                </h2>
                <p>
                  {locale === "zh"
                    ? "你將返回光年回信進入頁面。目前任務狀態會保留於本次連線中。"
                    : "You will return to the Light-Year Relay entrance. Current mission state will remain available during this session."}
                </p>
                <div>
                  <button onClick={() => setShowExitConfirm(false)}>
                    {locale === "zh" ? "否，留在任務中" : "NO, STAY IN MISSION"}
                  </button>
                  <button
                    className="confirm-leave"
                    onClick={() => {
                      setShowExitConfirm(false);
                      setShowIntro(true);
                    }}
                  >
                    {locale === "zh" ? "是，離開遊戲" : "YES, LEAVE GAME"}
                  </button>
                </div>
              </section>
            </div>
          )}
          {missionGateOpen && (
            <div
              className="mission-gate-overlay"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="mission-gate-title"
            >
              <section className="mission-gate-card">
                <div className="mission-gate-signal">
                  <i>◇</i>
                  <em />
                </div>
                <small>{activeMission.id} · COMPLETION CHECK</small>
                <h2 id="mission-gate-title">
                  {locale === "zh"
                    ? "任務仍在收尾階段"
                    : "MISSION CLOSEOUT IN PROGRESS"}
                </h2>
                <p>
                  {locale === "zh"
                    ? "主線處置完成後，仍需處理家庭封包與船員訊息，才能正式結案並解鎖下一個任務。"
                    : "After resolving the main directive, complete the family packet and required crew communications before the next mission can unlock."}
                </p>
                <div className="mission-gate-checks">
                  <span className="done">
                    <i>✓</i>
                    <b>{locale === "zh" ? "主線任務處置" : "MAIN DIRECTIVE"}</b>
                    <em>{locale === "zh" ? "已完成" : "COMPLETE"}</em>
                  </span>
                  <span className={familySubmitted ? "done" : ""}>
                    <i>{familySubmitted ? "✓" : "!"}</i>
                    <b>CASSIAN VALE · FAMILY RELAY</b>
                    <em>
                      {familySubmitted
                        ? locale === "zh"
                          ? "封包已送出"
                          : "PACKET SENT"
                        : locale === "zh"
                          ? "等待處理"
                          : "ACTION REQUIRED"}
                    </em>
                  </span>
                  <span
                    className={
                      handledRequiredSideCount >= requiredSideCount
                        ? "done"
                        : ""
                    }
                  >
                    <i>
                      {handledRequiredSideCount >= requiredSideCount
                        ? "✓"
                        : "!"}
                    </i>
                    <b>
                      {locale === "zh"
                        ? "必要船員訊息互動"
                        : "REQUIRED CREW CONTACTS"}
                    </b>
                    <em>
                      {handledRequiredSideCount} / {requiredSideCount}
                    </em>
                  </span>
                </div>
                <footer>
                  <button onClick={() => setMissionGateOpen(false)}>
                    {locale === "zh" ? "留在任務結果" : "BACK TO RESULT"}
                  </button>
                  <button
                    className="mission-gate-primary"
                    onClick={() => {
                      setMissionGateOpen(false);
                      if (!familySubmitted) {
                        setFamilyRelayPhase("review");
                        setFamilyRelayOpen(true);
                      } else {
                        queueRequiredSideEvent();
                        setSideCommsOpen(true);
                      }
                    }}
                  >
                    {!familySubmitted
                      ? locale === "zh"
                        ? "前往處理 FAMILY RELAY"
                        : "OPEN FAMILY RELAY"
                      : locale === "zh"
                        ? "處理船員訊息"
                        : "OPEN CREW MESSAGE"}
                    　→
                  </button>
                </footer>
              </section>
            </div>
          )}
          {showSettings && (
            <div
              className="settings-backdrop dashboard-settings"
              onClick={() => setShowSettings(false)}
            >
              <section
                className="settings-modal"
                role="dialog"
                aria-modal="true"
                aria-label={locale === "zh" ? "設定" : "Settings"}
                onClick={(event) => event.stopPropagation()}
              >
                <header>
                  <div>
                    <small>SYSTEM CONFIGURATION</small>
                    <h2>{locale === "zh" ? "設定" : "SETTINGS"}</h2>
                  </div>
                  <button
                    aria-label={locale === "zh" ? "關閉" : "Close"}
                    onClick={() => setShowSettings(false)}
                  >
                    ×
                  </button>
                </header>
                <label className="volume-setting">
                  <span>
                    <b>{locale === "zh" ? "背景音樂" : "BACKGROUND MUSIC"}</b>
                    <small>
                      {locale === "zh" ? "星際回聲" : "INTERSTELLAR ECHO"}
                    </small>
                  </span>
                  <output>{musicVolume}%</output>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(event) =>
                      setMusicVolume(Number(event.target.value))
                    }
                  />
                </label>
                <div className="language-setting">
                  <span>
                    <b>{locale === "zh" ? "介面語言" : "INTERFACE LANGUAGE"}</b>
                    <small>
                      {locale === "zh"
                        ? "選擇遊戲顯示語言"
                        : "CHOOSE DISPLAY LANGUAGE"}
                    </small>
                  </span>
                  <div>
                    <button
                      className={locale === "zh" ? "selected" : ""}
                      onClick={() => chooseLocale("zh")}
                    >
                      繁體中文
                    </button>
                    <button
                      className={locale === "en" ? "selected" : ""}
                      onClick={() => chooseLocale("en")}
                    >
                      ENGLISH
                    </button>
                  </div>
                </div>
                <button
                  className="settings-done"
                  onClick={() => setShowSettings(false)}
                >
                  {locale === "zh" ? "套用設定" : "APPLY SETTINGS"}
                </button>
              </section>
            </div>
          )}
          <header className="topbar">
            <button
              className="brand"
              onClick={() => setShowExitConfirm(true)}
              aria-label={locale === "zh" ? "離開遊戲" : "Leave game"}
            >
              <span>✦</span>
              <div>
                <b>
                  LIGHT-YEAR RELAY <em>{locale === "zh" ? "光年回信" : ""}</em>
                </b>
                <small>
                  {locale === "zh"
                    ? "地球深空任務控制中心"
                    : "EARTH DEEP SPACE CONTROL"}
                </small>
              </div>
            </button>
            <nav>
              {navItems.map((item, index) => (
                <button
                  key={item}
                  className={tab === item ? "active" : ""}
                  onClick={() => {
                    setTab(item);
                    if (index === 1) setMissionsOpen(true);
                    else if (index === 2) setCommsOpen(true);
                    else if (index === 3) setCrewLogsOpen(true);
                    else if (index === 4) setAcademyOpen(true);
                    else if (index === 5) setShowSettings(true);
                    else if (index !== 0)
                      toast(
                        `${item} ${locale === "zh" ? "模組已記錄於本次原型" : "module is available in this prototype"}`,
                      );
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="clock">
              <span>
                {locale === "zh" ? "任務日" : "MISSION DAY"}{" "}
                <b>{missionDay} DAYS</b>
              </span>
              <span>
                {localDate}{" "}
                <b>
                  {localClock} {locale === "zh" ? "本地" : "LOCAL"}
                </b>
              </span>
              <i>▦</i>
            </div>
          </header>
          <section className="status-ribbon">
            <span>
              <i className="ok" /> AURORA-7 ONLINE
            </span>
            <span>
              {locale === "zh" ? "距離地球" : "DISTANCE FROM EARTH"}{" "}
              <b>814,206,381 KM</b>
            </span>
            <span>
              {locale === "zh" ? "單程延遲" : "ONE-WAY DELAY"} <b>18m 24s</b>
            </span>
            <span>
              {locale === "zh" ? "當前節點" : "CURRENT NODE"}{" "}
              <b>DSN–TROJAN 03</b>
            </span>
            <strong>● {locale === "zh" ? "通訊中" : "COMMUNICATING"}</strong>
          </section>
          <div className="main-grid">
            <aside className="left-rail">
              <section className="panel ship-state">
                <header>
                  <span>VESSEL STATUS</span>
                  <b>{locale === "zh" ? "太空船狀態" : "VESSEL STATUS"}</b>
                </header>
                <Meter
                  label={locale === "zh" ? "電力" : "Power"}
                  value={displayedStatus.ship.power}
                  danger={displayedStatus.ship.power < 50}
                />
                <Meter
                  label={locale === "zh" ? "氧氣循環" : "Oxygen circulation"}
                  value={displayedStatus.ship.oxygen}
                  danger={displayedStatus.ship.oxygen < 65}
                />
                <Meter
                  label={locale === "zh" ? "船體完整度" : "Hull integrity"}
                  value={displayedStatus.ship.hull}
                  danger={displayedStatus.ship.hull < 85}
                />
                <Meter
                  label={
                    locale === "zh" ? "通訊穩定度" : "Communication stability"
                  }
                  value={displayedStatus.ship.comms}
                  danger={displayedStatus.ship.comms < 60}
                />
                <div className="radiation">
                  <span>
                    {locale === "zh" ? "輻射暴露" : "RADIATION EXPOSURE"}
                  </span>
                  <b>{displayedStatus.ship.radiation}</b>
                  <small className={activeMissionIndex === 1 ? "danger" : ""}>
                    {displayedStatus.ship.radiationNote}
                  </small>
                </div>
              </section>
              <section className="panel objectives">
                <header>
                  <span>TODAY / DAY {missionDay}</span>
                  <b>{locale === "zh" ? "今日任務" : "TODAY TASKS"}</b>
                </header>
                {phase !== "result" ? (
                  <>
                    <div className="objective critical">
                      <i>01</i>
                      <p>
                        <b>{displayedStatus.objectives.primary}</b>
                        <span>{displayedStatus.objectives.primaryNote}</span>
                      </p>
                    </div>
                    <div className="objective">
                      <i>02</i>
                      <p>
                        <b>{displayedStatus.objectives.secondary}</b>
                        <span>{displayedStatus.objectives.secondaryNote}</span>
                      </p>
                    </div>
                    <div className="mission-risk">
                      <span>RISK</span>
                      <b>{displayedStatus.objectives.risk}</b>
                    </div>
                  </>
                ) : (
                  <div className="objectives-cleared">
                    <i>✓</i>
                    <b>
                      {locale === "zh"
                        ? "今日任務已完成"
                        : "TODAY'S TASKS COMPLETE"}
                    </b>
                    <span>
                      {locale === "zh"
                        ? "項目已移至五任務總覽的完成紀錄。"
                        : "Items were moved to the completed mission archive."}
                    </span>
                  </div>
                )}
                <button onClick={() => setMissionsOpen(true)}>
                  {locale === "zh"
                    ? "開啟五任務總覽"
                    : "OPEN FIVE-MISSION OVERVIEW"}{" "}
                  <b>↗</b>
                </button>
              </section>
              <section className="panel academy-mini">
                <span>ACADEMY UNLOCK</span>
                <b>{activeMissionText.academy.split("：")[0]} Lv. 2</b>
                <p>{activeMissionText.academy}</p>
              </section>
            </aside>
            <section className="mission-center">
              <div className="video-feed panel">
                <div className="feed-title">
                  <span>
                    {locale === "zh" ? "現場影像" : "LIVE FEED"}　
                    <small>CAM-01 · {activeMission.id}</small>
                  </span>
                  <div className="feed-link-status">
                    <em>
                      MISSION {String(activeMissionIndex + 1).padStart(2, "0")}
                    </em>
                    <b>● {locale === "zh" ? "通訊中" : "COMMUNICATING"}</b>
                  </div>
                </div>
                <div
                  className="video-bg mission-scene"
                  style={{
                    backgroundImage: `linear-gradient(90deg,rgba(0,7,14,.18),rgba(0,7,14,.28)),url('${activeMissionMedia.scene}')`,
                  }}
                >
                  {activeMissionMedia.video && (
                    <video
                      className="mission-scene-video"
                      src={activeMissionMedia.video}
                      poster={activeMissionMedia.scene}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  )}
                  <div className="scanlines" />
                  <span className="rec">● LIVE / 14:36 UTC</span>
                  <span className="cam">
                    AURORA-7 · MISSION REPORT 0{activeMissionIndex + 1}
                  </span>
                  <div className="identity">
                    <small>AURORA-7 / CREW 01</small>
                    <b>CASSIAN VALE</b>
                    <span>{activeMissionText.subtitle}</span>
                  </div>
                  <blockquote>
                    <b>Cassian　14:36</b>
                    {activeMissionText.report}
                  </blockquote>
                </div>
                <div className="feed-meta">
                  <span>
                    {locale === "zh"
                      ? "任務回報已接收"
                      : "MISSION REPORT RECEIVED"}
                  </span>
                  <b>
                    {locale === "zh" ? "封包完整度" : "PACKET INTEGRITY"} 97.8%
                  </b>
                  <button
                    className={missionAudioPlaying ? "audio-playing" : ""}
                    onClick={toggleMissionReport}
                  >
                    {missionAudioPlaying
                      ? locale === "zh"
                        ? "Ⅱ 暫停語音"
                        : "Ⅱ PAUSE REPORT"
                      : locale === "zh"
                        ? "▷ 播放主線語音"
                        : "▷ PLAY MISSION REPORT"}
                  </button>
                </div>
              </div>
              <div className="comms panel">
                <header>
                  <div>
                    <span>MISSION COMMUNICATION</span>
                    <b>
                      {locale === "zh"
                        ? "建立任務控制指令"
                        : "COMPOSE MISSION DIRECTIVE"}
                    </b>
                  </div>
                  <div className="steps">
                    <i className={phase === "review" ? "active" : "done"}>
                      1 {locale === "zh" ? "資料" : "DATA"}
                    </i>
                    <i
                      className={
                        phase === "compose"
                          ? "active"
                          : ["sending", "verification", "result"].includes(
                                phase,
                              )
                            ? "done"
                            : ""
                      }
                    >
                      2 {locale === "zh" ? "指令" : "DIRECTIVE"}
                    </i>
                    <i
                      className={
                        phase === "sending"
                          ? "active"
                          : ["verification", "result"].includes(phase)
                            ? "done"
                            : ""
                      }
                    >
                      3 {locale === "zh" ? "傳送" : "SEND"}
                    </i>
                    <i
                      className={
                        phase === "verification"
                          ? "active"
                          : phase === "result"
                            ? "done"
                            : ""
                      }
                    >
                      4 {locale === "zh" ? "確認" : "VERIFY"}
                    </i>
                    <i className={phase === "result" ? "active" : ""}>
                      5 {locale === "zh" ? "結果" : "RESULT"}
                    </i>
                  </div>
                </header>
                {phase === "review" && (
                  <div className="review-layout">
                    <div className="data-tabs">
                      {[
                        [
                          "telemetry",
                          locale === "zh" ? "系統數據" : "SYSTEM DATA",
                        ],
                        [
                          "sensors",
                          locale === "zh" ? "感測器讀數" : "SENSOR READINGS",
                        ],
                        [
                          "maintenance",
                          locale === "zh" ? "維修紀錄" : "MAINTENANCE LOG",
                        ],
                        [
                          "vitals",
                          locale === "zh" ? "生命徵象" : "VITAL SIGNS",
                        ],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          className={activeData === id ? "active" : ""}
                          onClick={() => setActiveData(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="data-sheet">
                      {activeData === "telemetry" && (
                        <>
                          <h3>
                            {locale === "zh"
                              ? "生命維持系統／即時遙測"
                              : "LIFE SUPPORT / LIVE TELEMETRY"}
                          </h3>
                          <div className="reading alert">
                            <span>
                              {locale === "zh"
                                ? "主 O₂ 感測器"
                                : "PRIMARY O₂ SENSOR"}
                            </span>
                            <b>18.7%</b>
                            <small>↓ 0.4% / 10m</small>
                          </div>
                          <div className="reading">
                            <span>
                              {locale === "zh" ? "艙內壓力" : "CABIN PRESSURE"}
                            </span>
                            <b>101.2 kPa</b>
                            <small>{locale === "zh" ? "穩定" : "STABLE"}</small>
                          </div>
                          <div className="reading">
                            <span>
                              {locale === "zh" ? "CO₂ 濃度" : "CO₂ LEVEL"}
                            </span>
                            <b>0.53%</b>
                            <small>{locale === "zh" ? "正常" : "NORMAL"}</small>
                          </div>
                          <p className="analysis-note">
                            {locale === "zh"
                              ? "系統提示：若氧氣確實流失，艙壓通常會同步下降。目前資料存在矛盾。"
                              : "SYSTEM NOTE: A real oxygen leak should also reduce cabin pressure. Current readings conflict."}
                          </p>
                        </>
                      )}
                      {activeData === "sensors" && (
                        <>
                          <h3>
                            {locale === "zh" ? "感測器狀態" : "SENSOR STATUS"}
                          </h3>
                          <div className="reading alert">
                            <span>
                              {locale === "zh"
                                ? "O₂–A 主感測器"
                                : "O₂–A PRIMARY SENSOR"}
                            </span>
                            <b>
                              {locale === "zh" ? "漂移警告" : "DRIFT WARNING"}
                            </b>
                            <small>
                              {locale === "zh"
                                ? "校準逾期 16h"
                                : "CALIBRATION OVERDUE 16h"}
                            </small>
                          </div>
                          <div className="reading">
                            <span>
                              {locale === "zh"
                                ? "O₂–B 備用感測器"
                                : "O₂–B BACKUP SENSOR"}
                            </span>
                            <b>{locale === "zh" ? "待機" : "STANDBY"}</b>
                            <small>
                              {locale === "zh"
                                ? "可遠端啟用"
                                : "REMOTE ACTIVATION AVAILABLE"}
                            </small>
                          </div>
                        </>
                      )}
                      {activeData === "maintenance" && (
                        <>
                          <h3>
                            {locale === "zh" ? "維修紀錄" : "MAINTENANCE LOG"}
                          </h3>
                          <p className="log-line">
                            DAY 039　
                            {locale === "zh"
                              ? "主感測器電源出現 0.8 秒波動"
                              : "Primary sensor power fluctuated for 0.8 seconds"}
                          </p>
                          <p className="log-line">
                            DAY 041　
                            {locale === "zh"
                              ? "過濾器壓差測試正常"
                              : "Filter pressure-differential test normal"}
                          </p>
                          <p className="log-line">
                            DAY 042　
                            {locale === "zh"
                              ? "例行校準因科學作業延後"
                              : "Routine calibration deferred for science operations"}
                          </p>
                        </>
                      )}
                      {activeData === "vitals" && (
                        <>
                          <h3>
                            Cassian{" "}
                            {locale === "zh" ? "生命徵象" : "VITAL SIGNS"}
                          </h3>
                          <div className="reading">
                            <span>
                              {locale === "zh" ? "血氧" : "BLOOD OXYGEN"}
                            </span>
                            <b>97%</b>
                            <small>{locale === "zh" ? "正常" : "NORMAL"}</small>
                          </div>
                          <div className="reading">
                            <span>
                              {locale === "zh" ? "心率" : "HEART RATE"}
                            </span>
                            <b>84 bpm</b>
                            <small>
                              {locale === "zh"
                                ? "輕微升高"
                                : "SLIGHTLY ELEVATED"}
                            </small>
                          </div>
                          <div className="reading alert">
                            <span>
                              {locale === "zh" ? "疲勞指數" : "FATIGUE INDEX"}
                            </span>
                            <b>68%</b>
                            <small>
                              {locale === "zh"
                                ? "需避免高負荷作業"
                                : "AVOID HIGH-LOAD OPERATIONS"}
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      className="primary-action"
                      onClick={() => setPhase("compose")}
                    >
                      {locale === "zh"
                        ? "資料檢視完成／建立指令"
                        : "DATA REVIEW COMPLETE / COMPOSE DIRECTIVE"}{" "}
                      <b>→</b>
                    </button>
                  </div>
                )}
                {phase === "compose" && (
                  <div className="composer">
                    <div className="choice-columns">
                      {(["goal", "action", "risk", "tone"] as ChoiceKey[]).map(
                        (key, index) => (
                          <section key={key}>
                            <h3>
                              <i>0{index + 1}</i>
                              {
                                (locale === "zh"
                                  ? [
                                      "處理目標",
                                      "執行方式",
                                      "風險態度",
                                      "溝通語氣",
                                    ]
                                  : [
                                      "OBJECTIVE",
                                      "EXECUTION",
                                      "RISK POSTURE",
                                      "COMMUNICATION TONE",
                                    ])[index]
                              }
                            </h3>
                            {missionChoiceSet[key].map((option) => (
                              <button
                                key={option.id}
                                className={
                                  selection[key] === option.id ? "selected" : ""
                                }
                                onClick={() => choose(key, option.id)}
                              >
                                <i>{selection[key] === option.id ? "✓" : ""}</i>
                                <span>
                                  <b>{option.label}</b>
                                  <small>{option.detail}</small>
                                </span>
                              </button>
                            ))}
                          </section>
                        ),
                      )}
                    </div>
                    <div className="generated">
                      <span>
                        GENERATED CONTROL DIRECTIVE / {activeMission.id}
                      </span>
                      <p>{instruction}</p>
                      <small>
                        {locale === "zh"
                          ? "此指令預計於 18 分 24 秒後抵達。"
                          : "ESTIMATED DIRECTIVE ARRIVAL IN 18m 24s. "}
                        {missionChoiceSet.etaNote}
                      </small>
                    </div>
                    <div className="compose-actions">
                      <button onClick={() => setPhase("review")}>
                        {locale === "zh" ? "← 返回資料" : "← BACK TO DATA"}
                      </button>
                      <button
                        className="primary-action"
                        onClick={() => {
                          setSeconds(12);
                          setPhase("sending");
                          addGameLog(
                            "太空人通訊",
                            locale === "zh"
                              ? `已傳送：${activeMission.title}`
                              : `TRANSMITTED: ${activeMissionText.title}`,
                            instruction,
                            "CONTROL_DIRECTIVE.txt",
                            "2 KB",
                            "LEVEL 2",
                            locale === "zh" ? "傳送中" : "TRANSMITTING",
                          );
                        }}
                      >
                        {locale === "zh"
                          ? "確認並傳送指令"
                          : "CONFIRM AND SEND DIRECTIVE"}{" "}
                        <b>→</b>
                      </button>
                    </div>
                  </div>
                )}
                {phase === "sending" && (
                  <div className="transmitting">
                    <span>UPLINK TRANSMISSION IN PROGRESS</span>
                    <h2>
                      {locale === "zh"
                        ? "指令正在穿越深空通訊網路"
                        : "DIRECTIVE CROSSING THE DEEP-SPACE NETWORK"}
                    </h2>
                    <div className="route">
                      <i className="done">
                        EARTH
                        <small>
                          {locale === "zh" ? "控制中心" : "CONTROL"}
                        </small>
                      </i>
                      <em />
                      <i className={seconds < 10 ? "done" : ""}>
                        LUNA
                        <small>
                          {locale === "zh" ? "月球中繼" : "LUNAR RELAY"}
                        </small>
                      </i>
                      <em />
                      <i className={seconds < 7 ? "done" : ""}>
                        MARS
                        <small>
                          {locale === "zh" ? "火星中繼" : "MARS RELAY"}
                        </small>
                      </i>
                      <em />
                      <i className={seconds < 4 ? "done" : ""}>
                        DSN-03
                        <small>
                          {locale === "zh" ? "深空節點" : "DEEP-SPACE NODE"}
                        </small>
                      </i>
                      <em />
                      <i className={seconds === 0 ? "done" : ""}>
                        AURORA-7
                        <small>{locale === "zh" ? "接收端" : "RECEIVER"}</small>
                      </i>
                    </div>
                    <div className="uplink-progress">
                      <i style={{ width: `${((12 - seconds) / 12) * 100}%` }} />
                    </div>
                    <b className="eta">
                      SIMULATED ETA · 00:{seconds.toString().padStart(2, "0")}
                    </b>
                    <p>
                      {locale === "zh"
                        ? "真實單程延遲 18m 42s · 指令送出後無法撤回"
                        : "ACTUAL ONE-WAY DELAY 18m 42s · DIRECTIVE CANNOT BE RECALLED"}
                    </p>
                  </div>
                )}
                {phase === "verification" && (
                  <div className="verification-card">
                    <span>
                      NEW RETURN PACKET /{" "}
                      {locale === "zh" ? "現場狀況更新" : "FIELD STATUS UPDATE"}
                    </span>
                    <h2>{currentFollowup.alert}</h2>
                    <p>{currentFollowup.question}</p>
                    <div>
                      {currentFollowup.options.map((option, index) => (
                        <button
                          key={option}
                          className={followupChoice === index ? "selected" : ""}
                          onClick={() => setFollowupChoice(index)}
                        >
                          <i>{String.fromCharCode(65 + index)}</i>
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                    <small>
                      {locale === "zh"
                        ? "這是新的現場資訊。請根據先前資料與已送出的指令做第二次判斷。"
                        : "This is new field information. Reassess the situation using prior data and the directive already sent."}
                    </small>
                    <button
                      className="primary-action"
                      disabled={followupChoice === null}
                      onClick={() => {
                        setTrust((v) =>
                          Math.min(
                            100,
                            v +
                              (followupChoice === currentFollowup.best
                                ? 4
                                : -2),
                          ),
                        );
                        setMorale((v) =>
                          Math.min(
                            100,
                            Math.max(
                              0,
                              v +
                                (followupChoice === currentFollowup.best
                                  ? 3
                                  : -2),
                            ),
                          ),
                        );
                        advanceCrewLogs(12);
                        advanceMissionTime(14);
                        setPhase("result");
                      }}
                    >
                      {locale === "zh"
                        ? "確認後續處置／等待結果"
                        : "CONFIRM FOLLOW-UP / AWAIT RESULT"}{" "}
                      <b>→</b>
                    </button>
                  </div>
                )}
                {phase === "result" && (
                  <div className="result-card">
                    <span>RETURN PACKET / {activeMission.id}</span>
                    <h2>{currentResult.title}</h2>
                    <blockquote>
                      {locale === "zh"
                        ? `「${currentResult.quote}」`
                        : `“${currentResult.quote}”`}
                    </blockquote>
                    <div className="result-grid">
                      <div>
                        <span>
                          {locale === "zh" ? "任務結果" : "MISSION OUTCOME"}
                        </span>
                        <b>{currentResult.result}</b>
                      </div>
                      <div>
                        <span>
                          {locale === "zh" ? "資源影響" : "RESOURCE IMPACT"}
                        </span>
                        <b>{currentResult.resource}</b>
                      </div>
                      <div>
                        <span>
                          {locale === "zh" ? "Cassian 信任" : "CASSIAN TRUST"}
                        </span>
                        <b className="positive">
                          {followupChoice === currentFollowup.best
                            ? "+4"
                            : "−2"}
                        </b>
                      </div>
                      <div>
                        <span>
                          {locale === "zh" ? "事件標記" : "EVENT TAG"}
                        </span>
                        <b>{currentResult.tag}</b>
                      </div>
                    </div>
                    <p className="lesson">{currentResult.lesson}</p>
                    <button className="primary-action" onClick={finishMission}>
                      {mainMissionResolved
                        ? familySubmitted &&
                          handledRequiredSideCount >= requiredSideCount
                          ? activeMissionIndex < storyMissions.length - 1
                            ? locale === "zh"
                              ? "正式結案／解鎖下一任務"
                              : "CLOSE MISSION / UNLOCK NEXT"
                            : locale === "zh"
                              ? "完成旅程／返回主畫面"
                              : "COMPLETE JOURNEY / RETURN"
                          : locale === "zh"
                            ? "檢查任務收尾進度"
                            : "CHECK CLOSEOUT PROGRESS"
                        : locale === "zh"
                          ? "完成主線／進入任務收尾"
                          : "RESOLVE MAIN DIRECTIVE / BEGIN CLOSEOUT"}{" "}
                      <b>→</b>
                    </button>
                  </div>
                )}
              </div>
            </section>
            <aside className="right-rail">
              <section className="panel astronaut-state">
                <header>
                  <span>CREW / 01</span>
                  <b>Cassian Vale</b>
                  <small>{displayedStatus.crew.condition}</small>
                </header>
                <div
                  className={`portrait mission-${activeMissionIndex + 1}`}
                  style={{
                    backgroundImage: "url(/game/crew/cassian-avatar.webp)",
                  }}
                />
                <Meter
                  label={locale === "zh" ? "士氣" : "Morale"}
                  value={morale}
                  danger={morale < 45}
                />
                <Meter
                  label={locale === "zh" ? "健康" : "Health"}
                  value={displayedStatus.crew.health}
                  danger={displayedStatus.crew.health < 78}
                />
                <Meter
                  label={locale === "zh" ? "疲勞" : "Fatigue"}
                  value={displayedStatus.crew.fatigue}
                  danger={displayedStatus.crew.fatigue > 70}
                />
                <Meter
                  label={locale === "zh" ? "壓力" : "Stress"}
                  value={displayedStatus.crew.stress}
                  danger={displayedStatus.crew.stress > 75}
                />
                <Meter
                  label={locale === "zh" ? "信任度" : "Trust"}
                  value={trust}
                  danger={trust < 50}
                />
              </section>
              <section
                className={`panel family family-entry ${familyProcessed ? "processed" : familyPending ? "waiting" : "pending"}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!familySubmitted)
                    playClip("/game/audio/ui/family-packet-received.mp3");
                  setFamilyRelayPhase(
                    familyProcessed
                      ? "result"
                      : familyPending
                        ? "awaiting"
                        : "review",
                  );
                  setFamilyRelayOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setFamilyRelayPhase(
                      familyProcessed
                        ? "result"
                        : familyPending
                          ? "awaiting"
                          : "review",
                    );
                    setFamilyRelayOpen(true);
                  }
                }}
              >
                <header>
                  <div>
                    <span>FAMILY RELAY</span>
                    <b>{activeMissionText.familyTitle}</b>
                  </div>
                  <strong>
                    {familyProcessed
                      ? locale === "zh"
                        ? "已回覆"
                        : "REPLIED"
                      : familyPending
                        ? locale === "zh"
                          ? "等待回覆"
                          : "AWAITING"
                        : activeMission.security}
                  </strong>
                </header>
                <div
                  className={`drawing ${familyIncomingImage ? "has-image" : ""}`}
                  style={
                    familyIncomingImage
                      ? { backgroundImage: `url(${familyIncomingImage})` }
                      : undefined
                  }
                >
                  <div>{["♃", "🚀", "✦", "☾", "♡"][activeMissionIndex]}</div>
                  <p>
                    TO DAD
                    <br />
                    <b>COME HOME SOON</b>
                  </p>
                </div>
                <p>{activeMissionText.familyMessage}</p>
                <div className="bandwidth">
                  <span>
                    {locale === "zh" ? "家庭連結／坦誠度" : "BOND / HONESTY"}
                  </span>
                  <b>
                    {familyBond} / {honesty}
                  </b>
                  <i>
                    <em style={{ width: `${familyBond}%` }} />
                  </i>
                  <small>
                    {activeMission.familyFile} · {activeMission.familySize}
                  </small>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!familySubmitted)
                      playClip("/game/audio/ui/family-packet-received.mp3");
                    setFamilyRelayPhase(
                      familyProcessed
                        ? "result"
                        : familyPending
                          ? "awaiting"
                          : "review",
                    );
                    setFamilyRelayOpen(true);
                  }}
                >
                  {familyProcessed
                    ? locale === "zh"
                      ? "查看家庭回覆"
                      : "VIEW FAMILY REPLY"
                    : familyPending
                      ? locale === "zh"
                        ? "封包傳輸中"
                        : "PACKET IN TRANSIT"
                      : locale === "zh"
                        ? "開啟家庭事件"
                        : "OPEN FAMILY EVENT"}{" "}
                  <b>→</b>
                </button>
              </section>
              <section className="panel academy">
                <header>
                  <span>SPACE ACADEMY</span>
                  <b>{locale === "zh" ? "本月進度" : "MONTHLY PROGRESS"}</b>
                </header>
                <div className="academy-progress">
                  <b>{academyDone}</b>
                  <span>/ 150 {locale === "zh" ? "題" : "QUESTIONS"}</span>
                  <i>
                    <em style={{ width: `${academyDone / 1.5}%` }} />
                  </i>
                </div>
                <p>
                  {locale === "zh" ? "完整題庫" : "FULL LIBRARY"}{" "}
                  <b>300 {locale === "zh" ? "題" : "QUESTIONS"}</b> ·{" "}
                  {locale === "zh" ? "複習池" : "REVIEW POOL"}{" "}
                  {reviewPool.length} {locale === "zh" ? "題" : "ITEMS"}
                </p>
                <small>
                  {locale === "zh"
                    ? "下一階段：120 題／再 +10 KB"
                    : "NEXT STAGE: 120 / +10 KB"}
                </small>
                <button onClick={() => setAcademyOpen(true)}>
                  {locale === "zh" ? "進入課程" : "ENTER ACADEMY"} <b>→</b>
                </button>
              </section>
            </aside>
          </div>
          {missionsOpen && (
            <div
              className="mission-overview-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={
                locale === "zh" ? "五任務總覽" : "Five-mission overview"
              }
            >
              <section className="mission-overview">
                <header>
                  <div>
                    <span>AURORA-7 NARRATIVE OPERATIONS</span>
                    <h2>
                      {locale === "zh" ? "任務總覽" : "MISSION OVERVIEW"}{" "}
                      <small>5 STORY MISSIONS</small>
                    </h2>
                  </div>
                  <b>MISSION ARC　01—05</b>
                  <button
                    aria-label={
                      locale === "zh"
                        ? "關閉任務總覽"
                        : "Close mission overview"
                    }
                    onClick={() => {
                      setMissionsOpen(false);
                      setTab(locale === "zh" ? "任務控制" : "Mission Control");
                    }}
                  >
                    ×
                  </button>
                </header>
                <div className="mission-overview-body">
                  <nav>
                    {storyMissions.map((mission, index) => {
                      const text = missionText(mission);
                      const isCompleted = completedMissionIds.includes(
                        mission.id,
                      );
                      const isCurrent = index === activeMissionIndex;
                      const isViewable = isCompleted || isCurrent;
                      return (
                        <button
                          key={mission.id}
                          aria-current={
                            overviewMissionIndex === index ? "step" : undefined
                          }
                          className={`${overviewMissionIndex === index ? "active" : ""} ${!isViewable ? "locked" : ""}`}
                          disabled={!isViewable}
                          onClick={() => setOverviewMissionIndex(index)}
                        >
                          <i>0{index + 1}</i>
                          <div>
                            <small>MISSION DAY {mission.day}</small>
                            <b>{text.title}</b>
                            <span>{text.subtitle}</span>
                          </div>
                          <em
                            className={
                              isCompleted
                                ? "done"
                                : isCurrent
                                  ? "live"
                                  : "locked"
                            }
                          >
                            {isCompleted
                              ? locale === "zh"
                                ? "已完成"
                                : "COMPLETE"
                              : isCurrent
                                ? locale === "zh"
                                  ? mainMissionResolved
                                    ? "收尾進行中"
                                    : "進行中"
                                  : mainMissionResolved
                                    ? "CLOSEOUT IN PROGRESS"
                                    : "IN PROGRESS"
                                : locale === "zh"
                                  ? "未解鎖"
                                  : "LOCKED"}
                          </em>
                        </button>
                      );
                    })}
                  </nav>
                  <main>
                    <div className="mission-hero">
                      <span>
                        {overviewMission.id} · {overviewMissionText.difficulty}
                      </span>
                      <h3>{overviewMissionText.title}</h3>
                      <p>{overviewMissionText.theme}</p>
                    </div>
                    <section className="mission-brief-grid">
                      <article>
                        <span>
                          {locale === "zh"
                            ? "MISSION REPORT／任務內容"
                            : "MISSION REPORT"}
                        </span>
                        <p>{overviewMissionText.report}</p>
                      </article>
                      <article className="major">
                        <span>
                          {locale === "zh"
                            ? "MAJOR EVENT／大事件"
                            : "MAJOR EVENT"}
                        </span>
                        <p>{overviewMissionText.bigEvent}</p>
                      </article>
                      <article className="family-event">
                        <span>
                          {locale === "zh"
                            ? "FAMILY RELAY／家庭事件"
                            : "FAMILY RELAY"}
                        </span>
                        <h4>{overviewMissionText.familyTitle}</h4>
                        <p>{overviewMissionText.familyMessage}</p>
                        <small>
                          ▧ {overviewMission.familyFile}　·　
                          {overviewMission.familySize}　·　
                          {overviewMission.security}
                        </small>
                      </article>
                      <article>
                        <span>
                          {locale === "zh"
                            ? "DECISION OPTIONS／互動資料"
                            : "DECISION OPTIONS"}
                        </span>
                        <ul>
                          {overviewMissionText.decisions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    </section>
                    <div className="mission-bottom">
                      <div>
                        <span>ACADEMY LINK</span>
                        <b>{overviewMissionText.academy}</b>
                      </div>
                      <div className="effect-tags">
                        {overviewMissionText.effects.map((effect) => (
                          <i key={effect}>{effect}</i>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setOverviewMissionIndex(activeMissionIndex);
                          setMissionsOpen(false);
                          setTab(
                            locale === "zh" ? "任務控制" : "Mission Control",
                          );
                          toast(
                            locale === "zh"
                              ? `繼續目前進度：${activeMissionText.title}`
                              : `CONTINUING CURRENT PROGRESS: ${activeMissionText.title}`,
                          );
                        }}
                      >
                        {locale === "zh"
                          ? "繼續目前進度　→"
                          : "CONTINUE CURRENT PROGRESS →"}
                      </button>
                    </div>
                  </main>
                </div>
              </section>
            </div>
          )}
          {commsOpen && (
            <div
              className="comms-archive-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={locale === "zh" ? "通訊紀錄" : "Communication log"}
            >
              <section className="comms-archive">
                <header>
                  <div>
                    <span>DEEP SPACE COMMUNICATION ARCHIVE</span>
                    <h2>
                      {locale === "zh" ? "通訊紀錄" : "COMMUNICATION LOG"}{" "}
                      <small>COMMUNICATION LOG</small>
                    </h2>
                  </div>
                  <div className="archive-security">
                    <i /> SECURE ARCHIVE　<b>{gameLogs.length} RECORDS</b>
                  </div>
                  <button
                    aria-label={
                      locale === "zh"
                        ? "關閉通訊紀錄"
                        : "Close communication log"
                    }
                    onClick={() => {
                      setAttachmentOpen(false);
                      setCommsOpen(false);
                      setTab(locale === "zh" ? "任務控制" : "Mission Control");
                    }}
                  >
                    ×
                  </button>
                </header>
                <nav>
                  {[
                    "全部",
                    "太空人通訊",
                    "家庭互動",
                    "附件傳遞",
                    "管理日誌",
                  ].map((filter) => (
                    <button
                      key={filter}
                      className={logFilter === filter ? "active" : ""}
                      onClick={() => setLogFilter(filter)}
                    >
                      {locale === "zh"
                        ? filter
                        : {
                            全部: "ALL",
                            太空人通訊: "CREW",
                            家庭互動: "FAMILY",
                            附件傳遞: "ATTACHMENTS",
                            管理日誌: "AUDIT",
                          }[filter]}
                      <small>
                        {filter === "全部"
                          ? gameLogs.length
                          : gameLogs.filter((log) => log.kind === filter)
                              .length}
                      </small>
                    </button>
                  ))}
                </nav>
                <div className="archive-body">
                  <section className="log-list">
                    <header>
                      <span>
                        {locale === "zh" ? "傳輸時間／來源" : "TIME / SOURCE"}
                      </span>
                      <span>{locale === "zh" ? "紀錄內容" : "RECORD"}</span>
                      <span>{locale === "zh" ? "狀態" : "STATUS"}</span>
                    </header>
                    {visibleLogs.length === 0 && (
                      <div className="empty-log-list">
                        <i>◎</i>
                        <b>{locale === "zh" ? "尚無紀錄" : "NO RECORDS"}</b>
                        <span>
                          {locale === "zh"
                            ? "完成實際遊玩操作後會顯示於此分類"
                            : "Records appear here after relevant mission actions."}
                        </span>
                      </div>
                    )}
                    {visibleLogs.map((log) => (
                      <button
                        key={log.id}
                        className={selectedLog === log.id ? "active" : ""}
                        onClick={() => setSelectedLog(log.id)}
                      >
                        <i>{log.icon}</i>
                        <div>
                          <small>{log.time}</small>
                          <b>{log.title}</b>
                          <span>{log.from}</span>
                        </div>
                        <em
                          className={
                            log.status.includes("等待")
                              ? "pending"
                              : log.status.includes("通過") ||
                                  log.status.includes("成功") ||
                                  log.status.includes("傳送") ||
                                  log.status.includes("核准")
                                ? "safe"
                                : "edited"
                          }
                        >
                          {log.status}
                        </em>
                      </button>
                    ))}
                  </section>
                  <aside className="log-detail">
                    <div className="detail-code">
                      <span>RECORD ID</span>
                      <b>{activeLog.id}</b>
                      <em>{activeLog.level}</em>
                    </div>
                    <h3>{activeLog.title}</h3>
                    <p>{activeLog.summary}</p>
                    <dl>
                      <div>
                        <dt>{locale === "zh" ? "傳輸方向" : "DIRECTION"}</dt>
                        <dd>{activeLog.from}</dd>
                      </div>
                      <div>
                        <dt>{locale === "zh" ? "地球時間" : "EARTH TIME"}</dt>
                        <dd>{activeLog.time}</dd>
                      </div>
                      <div>
                        <dt>
                          {locale === "zh" ? "單程延遲" : "ONE-WAY DELAY"}
                        </dt>
                        <dd>18m 24s</dd>
                      </div>
                      <div>
                        <dt>
                          {locale === "zh" ? "安全狀態" : "SECURITY STATUS"}
                        </dt>
                        <dd>{activeLog.status}</dd>
                      </div>
                    </dl>
                    <section className="file-packet">
                      <i>▧</i>
                      <div>
                        <span>ATTACHED PACKET</span>
                        <b>{activeLog.file}</b>
                        <small>SHA-256 VERIFIED · {activeLog.size}</small>
                      </div>
                      <button
                        disabled={!activeSourceLog}
                        onClick={() => setAttachmentOpen(true)}
                      >
                        {locale === "zh" ? "檢視資料" : "VIEW DATA"}
                      </button>
                    </section>
                    <section className="operator-action">
                      <span>
                        CONTROL OFFICER ACTION /{" "}
                        {locale === "zh" ? "玩家管理日誌" : "PLAYER AUDIT"}
                      </span>
                      <p>{activeLog.action}</p>
                      <footer>
                        <i>✓</i>
                        <b>
                          {locale === "zh"
                            ? "操作已寫入不可竄改任務稽核紀錄"
                            : "ACTION WRITTEN TO IMMUTABLE MISSION AUDIT"}
                        </b>
                        <small>OFFICER ID · CTRL-05</small>
                      </footer>
                    </section>
                  </aside>
                </div>
                <footer>
                  <span>
                    {locale === "zh" ? "本月家庭通訊" : "MONTHLY FAMILY RELAY"}:
                    57 / 125 KB
                  </span>
                  <span>
                    {locale === "zh" ? "安全評價" : "SECURITY RATING"}: A
                  </span>
                  <span>
                    {locale === "zh" ? "目前紀錄" : "CURRENT RECORDS"}:{" "}
                    {gameLogs.length}
                  </span>
                  <button onClick={() => toast("通訊紀錄已匯出至任務封存區")}>
                    {locale === "zh" ? "匯出任務日誌" : "EXPORT MISSION LOG"}
                    　↗
                  </button>
                </footer>
              </section>
            </div>
          )}
          {attachmentOpen && activeSourceLog && (
            <div
              className="attachment-viewer-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={
                locale === "zh" ? "附件資料檢視器" : "Attachment data viewer"
              }
              onClick={() => setAttachmentOpen(false)}
            >
              <section
                className="attachment-viewer"
                onClick={(event) => event.stopPropagation()}
              >
                <header>
                  <div>
                    <small>SECURE ATTACHMENT RECONSTRUCTION</small>
                    <h2>{attachmentTitle}</h2>
                  </div>
                  <b>{attachmentMission.id}</b>
                  <button
                    aria-label={
                      locale === "zh" ? "關閉附件" : "Close attachment"
                    }
                    onClick={() => setAttachmentOpen(false)}
                  >
                    ×
                  </button>
                </header>
                <div className="attachment-viewer-body">
                  <div className="attachment-preview">
                    {attachmentIsInboundFamily &&
                    inboundFamilyMedia.type === "video" &&
                    inboundFamilyMedia.src ? (
                      <video
                        controls
                        src={inboundFamilyMedia.src}
                        poster={inboundFamilyMedia.poster}
                      />
                    ) : attachmentIsInboundFamily &&
                      inboundFamilyMedia.type === "photo" &&
                      inboundFamilyMedia.src ? (
                      <div
                        className="attachment-image"
                        role="img"
                        aria-label={attachmentDescription}
                        style={{
                          backgroundImage: `url(${inboundFamilyMedia.src})`,
                        }}
                      />
                    ) : attachmentIsInboundFamily ? (
                      <div className="attachment-audio">
                        <i>{inboundFamilyMedia.type === "audio" ? "◉" : "▧"}</i>
                        <span>
                          {locale === "zh"
                            ? inboundFamilyMedia.titleZh
                            : inboundFamilyMedia.titleEn}
                        </span>
                        <p>
                          {locale === "zh"
                            ? inboundFamilyMedia.transcriptZh
                            : inboundFamilyMedia.transcriptEn}
                        </p>
                      </div>
                    ) : attachmentIsFamily &&
                      attachmentMedia.type === "video" &&
                      attachmentMedia.videoSrc ? (
                      <video
                        controls
                        src={attachmentMedia.videoSrc}
                        poster={attachmentMedia.imageSrc}
                      />
                    ) : attachmentIsFamily &&
                      attachmentMedia.type === "audio" &&
                      attachmentMedia.audioSrc ? (
                      <div className="attachment-audio">
                        <i>◉</i>
                        <span>
                          {locale === "zh"
                            ? attachmentMedia.kindZh
                            : attachmentMedia.kindEn}
                        </span>
                        <audio controls src={attachmentMedia.audioSrc} />
                        <p>
                          {locale === "zh"
                            ? attachmentMedia.cassianZh
                            : attachmentMedia.cassianEn}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="attachment-image"
                        role="img"
                        aria-label={attachmentDescription}
                        style={{
                          backgroundImage: `url(${attachmentIsFamily && attachmentMedia.imageSrc ? attachmentMedia.imageSrc : missionMedia[attachmentMission.id].scene})`,
                        }}
                      />
                    )}
                  </div>
                  <aside>
                    <span>
                      {attachmentIsInboundFamily
                        ? "FAMILY INBOUND ATTACHMENT"
                        : attachmentIsFamily
                          ? "FAMILY RELAY ATTACHMENT"
                          : "MISSION OPERATION ATTACHMENT"}
                    </span>
                    <h3>{attachmentFile}</h3>
                    <p>{attachmentDescription}</p>
                    <dl>
                      <div>
                        <dt>{locale === "zh" ? "紀錄編號" : "RECORD ID"}</dt>
                        <dd>{activeLog.id}</dd>
                      </div>
                      <div>
                        <dt>{locale === "zh" ? "資料大小" : "FILE SIZE"}</dt>
                        <dd>{attachmentSize}</dd>
                      </div>
                      <div>
                        <dt>{locale === "zh" ? "安全等級" : "SECURITY"}</dt>
                        <dd>{activeLog.level}</dd>
                      </div>
                      <div>
                        <dt>{locale === "zh" ? "處理狀態" : "STATUS"}</dt>
                        <dd>{activeLog.status}</dd>
                      </div>
                    </dl>
                    <section>
                      <small>
                        {locale === "zh" ? "玩家執行動作" : "PLAYER ACTION"}
                      </small>
                      <p>{activeLog.action}</p>
                    </section>
                  </aside>
                </div>
                <footer>
                  <span>SHA-256 VERIFIED · READ-ONLY ARCHIVE</span>
                  <button onClick={() => setAttachmentOpen(false)}>
                    {locale === "zh" ? "關閉資料" : "CLOSE DATA"}
                  </button>
                </footer>
              </section>
            </div>
          )}
          {academyOpen && (
            <div
              className="academy-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Space Academy 太空教育課程"
            >
              <section className="academy-window">
                <header>
                  <div className="academy-title">
                    <i>★</i>
                    <div>
                      <span>FAMILY SPACE EDUCATION PROGRAM</span>
                      <h2>
                        SPACE ACADEMY{" "}
                        <small>
                          {locale === "zh"
                            ? "和 Sophie 一起探索宇宙"
                            : "EXPLORE THE UNIVERSE WITH SOPHIE"}
                        </small>
                      </h2>
                    </div>
                  </div>
                  <div className="academy-head-progress">
                    <span>
                      {locale === "zh" ? "本月任務" : "MONTHLY MISSION"}
                    </span>
                    <b>{academyDone} / 150</b>
                    <i>
                      <em style={{ width: `${academyDone / 1.5}%` }} />
                    </i>
                  </div>
                  <button
                    aria-label={locale === "zh" ? "關閉課程" : "Close academy"}
                    onClick={() => {
                      setAcademyOpen(false);
                      setTab(locale === "zh" ? "任務控制" : "Mission Control");
                    }}
                  >
                    ×
                  </button>
                </header>
                <div className="academy-stars">
                  <i>✦</i>
                  <i>☄</i>
                  <i>★</i>
                  <span>SOPHIE&apos;S STAR MAP</span>
                </div>
                <div className="academy-body">
                  <aside>
                    <p>LEARNING MODULES</p>
                    {displayedAcademyModules.map((module, index) => (
                      <button
                        key={module.name}
                        className={
                          academyMode === "course" &&
                          currentQuestion.category === module.name
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          setAcademyMode("course");
                          setAcademyIndex(index * 50);
                          setAcademyAnswer(null);
                        }}
                      >
                        <i>{module.icon}</i>
                        <span>
                          <b>{module.name}</b>
                          <small>
                            {module.start}–{module.end}{" "}
                            {locale === "zh" ? "題" : "QUESTIONS"} · 50{" "}
                            {locale === "zh" ? "題" : "ITEMS"}
                          </small>
                        </span>
                        <em>{index === 0 ? "LV.2" : "LV.1"}</em>
                      </button>
                    ))}
                    <button
                      className={`review-planet ${academyMode === "review" ? "active" : ""}`}
                      disabled={reviewPool.length === 0}
                      onClick={openReviewPool}
                    >
                      <i>🌍</i>
                      <span>
                        <b>
                          {locale === "zh"
                            ? "地球天體複習池"
                            : "EARTH REVIEW ORBIT"}
                        </b>
                        <small>
                          EARTH REVIEW ORBIT · {reviewPool.length}{" "}
                          {locale === "zh" ? "題" : "ITEMS"}
                        </small>
                      </span>
                      <em>{reviewPool.length > 0 ? "START" : "EMPTY"}</em>
                    </button>
                    <div className="sophie-note">
                      <i>🛸</i>
                      <p>
                        {locale === "zh"
                          ? "「答錯也沒關係，我們把它放進複習星球，下次再挑戰！」"
                          : "Wrong answers are okay—we will place them in the review orbit and try again next time!"}
                        <b>— Sophie</b>
                      </p>
                    </div>
                  </aside>
                  <main className="quiz-card">
                    <div className="quiz-meta">
                      <span>
                        {academyMode === "review"
                          ? locale === "zh"
                            ? "🌍 地球天體複習軌道"
                            : "🌍 EARTH REVIEW ORBIT"
                          : `${currentQuestion.icon} ${currentQuestion.category}`}
                      </span>
                      <b>
                        {locale === "zh"
                          ? currentQuestion.type
                          : {
                              單選題: "SINGLE CHOICE",
                              多選題: "MULTIPLE CHOICE",
                              情境判斷題: "SCENARIO",
                              排序題: "SEQUENCING",
                              資料判讀題: "DATA REVIEW",
                            }[currentQuestion.type]}
                      </b>
                      <small>
                        QUESTION {String(currentQuestion.id).padStart(3, "0")} /
                        300
                      </small>
                    </div>
                    <h3>{currentQuestion.prompt}</h3>
                    <p className="quiz-hint">
                      {academyMode === "review"
                        ? locale === "zh"
                          ? "正在複習先前答錯的題目。答對後，該題會離開地球複習軌道。"
                          : "Reviewing a previous error. A correct answer removes it from orbit."
                        : locale === "zh"
                          ? "選出你認為最合理的答案。答題後會顯示完整解釋，不會扣除完成進度。"
                          : "Choose the most reasonable answer. An explanation appears after submission."}
                    </p>
                    <div className="answers">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={option}
                          disabled={academyAnswer !== null}
                          className={
                            academyAnswer === null
                              ? ""
                              : index === currentQuestion.answer
                                ? "correct"
                                : index === academyAnswer
                                  ? "wrong"
                                  : "dim"
                          }
                          onClick={() => answerQuestion(index)}
                        >
                          <i>{String.fromCharCode(65 + index)}</i>
                          <span>{option}</span>
                          <em>
                            {academyAnswer !== null &&
                            index === currentQuestion.answer
                              ? "✓"
                              : academyAnswer === index
                                ? "×"
                                : ""}
                          </em>
                        </button>
                      ))}
                    </div>
                    {academyAnswer !== null && (
                      <div
                        className={`answer-feedback ${academyAnswer === currentQuestion.answer ? "success" : "retry"}`}
                      >
                        <i>
                          {academyAnswer === currentQuestion.answer
                            ? "🌟"
                            : "🪐"}
                        </i>
                        <div>
                          <b>
                            {academyAnswer === currentQuestion.answer
                              ? academyMode === "review"
                                ? locale === "zh"
                                  ? "答對了！已離開複習軌道"
                                  : "CORRECT — REMOVED FROM REVIEW ORBIT"
                                : locale === "zh"
                                  ? "答對了！任務知識已同步"
                                  : "CORRECT — MISSION KNOWLEDGE SYNCHRONIZED"
                              : academyMode === "review"
                                ? locale === "zh"
                                  ? "尚未通過，題目會留在複習軌道"
                                  : "NOT YET — ITEM REMAINS IN REVIEW ORBIT"
                                : locale === "zh"
                                  ? "差一點！已加入複習星球"
                                  : "NOT QUITE — ADDED TO REVIEW ORBIT"}
                          </b>
                          <p>{currentQuestion.explanation}</p>
                        </div>
                      </div>
                    )}
                    <footer>
                      <span>
                        {locale === "zh" ? "複習池" : "REVIEW POOL"}{" "}
                        <b>{reviewPool.length}</b>{" "}
                        {locale === "zh" ? "題" : "ITEMS"}
                      </span>
                      <div className="reward-track">
                        <i className="done">
                          30<small>+5KB</small>
                        </i>
                        <em />
                        <i className="done">
                          60<small>+10KB</small>
                        </i>
                        <em />
                        <i className="done">
                          90<small>+10KB</small>
                        </i>
                        <em />
                        <i>
                          120<small>+10KB</small>
                        </i>
                        <em />
                        <i>
                          150<small>+15KB</small>
                        </i>
                      </div>
                      <button
                        disabled={academyAnswer === null}
                        onClick={nextQuestion}
                      >
                        {academyMode === "review" &&
                        academyAnswer === currentQuestion.answer &&
                        reviewPool.length === 0
                          ? locale === "zh"
                            ? "完成複習／返回課程"
                            : "FINISH REVIEW / RETURN"
                          : locale === "zh"
                            ? "下一題"
                            : "NEXT QUESTION"}{" "}
                        <b>→</b>
                      </button>
                    </footer>
                  </main>
                </div>
              </section>
            </div>
          )}
          {crewLogsOpen && (
            <div
              className="crew-log-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={locale === "zh" ? "船組日誌" : "Crew log"}
            >
              <section className="crew-log-window">
                <header>
                  <div>
                    <span>AURORA-7 CREW MEMORY ARCHIVE</span>
                    <h2>
                      {locale === "zh" ? "船組日誌" : "CREW LOG"}{" "}
                      <small>CREW LOG · {activeMission.id}</small>
                    </h2>
                  </div>
                  <div className="crew-log-sync">
                    <i />
                    <span>SYNCED ENTRIES</span>
                    <b>{missionCrewLogs.length} / 90</b>
                  </div>
                  <button
                    aria-label={
                      locale === "zh" ? "關閉船組日誌" : "Close crew log"
                    }
                    onClick={() => {
                      setCrewLogsOpen(false);
                      setTab(locale === "zh" ? "任務控制" : "Mission Control");
                    }}
                  >
                    ×
                  </button>
                </header>
                <div className="crew-log-mission">
                  <div>
                    <small>MISSION DAY {activeMission.day}</small>
                    <b>{activeMissionText.title}</b>
                    <span>{activeMissionText.subtitle}</span>
                  </div>
                  <p>{activeMissionText.theme}</p>
                  <em>
                    {phase === "result"
                      ? "MISSION COMPLETE"
                      : phase === "sending"
                        ? "DIRECTIVE IN TRANSIT"
                        : "LIVE MEMORY STREAM"}
                  </em>
                </div>
                <nav>
                  {[
                    { value: "全部", zh: "全部", en: "ALL" },
                    { value: "船員私記", zh: "船員私記", en: "PERSONAL" },
                    { value: "系統觀察", zh: "系統觀察", en: "SYSTEM" },
                    { value: "任務事件", zh: "任務事件", en: "MISSION" },
                    { value: "家庭牽掛", zh: "家庭牽掛", en: "FAMILY" },
                    { value: "心理狀態", zh: "心理狀態", en: "MENTAL" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      className={crewLogFilter === filter.value ? "active" : ""}
                      onClick={() => setCrewLogFilter(filter.value)}
                    >
                      {locale === "zh" ? filter.zh : filter.en}
                      <small>
                        {filter.value === "全部"
                          ? missionCrewLogs.length
                          : missionCrewLogs.filter(
                              (log) => log.category === filter.value,
                            ).length}
                      </small>
                    </button>
                  ))}
                </nav>
                <div className="crew-log-body">
                  <section className="crew-log-list">
                    {visibleCrewLogs.map((log) => (
                      <button
                        key={log.id}
                        className={activeCrewLog?.id === log.id ? "active" : ""}
                        onClick={() => setSelectedCrewLog(log.id)}
                      >
                        <i>{log.icon}</i>
                        <div>
                          <small>{log.time}</small>
                          <b>{locale === "zh" ? log.title : log.titleEn}</b>
                          <span>
                            {locale === "zh" ? log.category : log.categoryEn}
                          </span>
                        </div>
                        <em>{log.signal}</em>
                      </button>
                    ))}
                  </section>
                  {activeCrewLog && (
                    <aside className="crew-log-detail">
                      <div className="crew-log-code">
                        <span>PERSONAL RECORD</span>
                        <b>{activeCrewLog.id}</b>
                        <em>
                          ENTRY{" "}
                          {String(activeCrewLog.sequence).padStart(2, "0")} / 90
                        </em>
                      </div>
                      <div className="crew-log-avatar">CV</div>
                      <small>CASSIAN VALE · PRIVATE MISSION LOG</small>
                      <h3>
                        {locale === "zh"
                          ? activeCrewLog.title
                          : activeCrewLog.titleEn}
                      </h3>
                      <blockquote>
                        {locale === "zh"
                          ? `「${activeCrewLog.body}」`
                          : `“${activeCrewLog.bodyEn}”`}
                      </blockquote>
                      <dl>
                        <div>
                          <dt>{locale === "zh" ? "船上時間" : "SHIP TIME"}</dt>
                          <dd>{activeCrewLog.time}</dd>
                        </div>
                        <div>
                          <dt>{locale === "zh" ? "分類" : "CATEGORY"}</dt>
                          <dd>
                            {locale === "zh"
                              ? activeCrewLog.category
                              : activeCrewLog.categoryEn}
                          </dd>
                        </div>
                        <div>
                          <dt>
                            {locale === "zh" ? "訊號狀態" : "SIGNAL STATUS"}
                          </dt>
                          <dd>{activeCrewLog.signal}</dd>
                        </div>
                        <div>
                          <dt>
                            {locale === "zh" ? "任務階段" : "MISSION STAGE"}
                          </dt>
                          <dd>{activeCrewLog.stage + 1} / 9</dd>
                        </div>
                      </dl>
                      <section>
                        <span>PLAYER-SENSITIVE MEMORY</span>
                        <p>
                          {locale === "zh"
                            ? "此篇內容會根據玩家的任務指令、家庭封包處理、教育進度、信任與士氣自動更新。"
                            : "This entry updates automatically according to the player's directive, family-packet handling, academy progress, trust, and morale."}
                        </p>
                      </section>
                    </aside>
                  )}
                </div>
                <footer>
                  <span>
                    {locale === "zh"
                      ? "每任務事件庫：90 ENTRIES"
                      : "PER-MISSION ARCHIVE: 90 ENTRIES"}
                  </span>
                  <span>
                    {locale === "zh"
                      ? "五任務總數：450 ENTRIES"
                      : "FIVE-MISSION TOTAL: 450 ENTRIES"}
                  </span>
                  <span>
                    {locale === "zh"
                      ? `目前解鎖：${missionCrewLogs.length} / 90`
                      : `UNLOCKED: ${missionCrewLogs.length} / 90`}
                  </span>
                  <button
                    onClick={() =>
                      toast(
                        locale === "zh"
                          ? `已同步 ${activeMissionText.title} 的船組日誌`
                          : `Crew memory synchronized: ${activeMissionText.title}`,
                      )
                    }
                  >
                    {locale === "zh" ? "同步船組記憶" : "SYNC CREW MEMORY"}　⌁
                  </button>
                </footer>
              </section>
            </div>
          )}
          {activeSideEvent && (
            <>
              <button
                className="private-comms-alert"
                onClick={() => {
                  setSelectedPrivateCrew(activeSideEvent.from);
                  setSideCommsOpen(true);
                }}
              >
                <i>◉</i>
                <span>
                  <span>PRIVATE CREW CHANNEL · NEW</span>
                  <b>
                    {activeSideEvent.from}
                    {locale === "zh" ? "：" : " · "}
                    {locale === "zh"
                      ? activeSideEvent.title.split("／")[0]
                      : activeSideEvent.titleEn.split(" / ")[0]}
                  </b>
                  <small>
                    {locale === "zh"
                      ? "私人訊息等待回覆 · 不影響主線"
                      : "PRIVATE MESSAGE AWAITING REPLY · MAIN MISSION UNAFFECTED"}
                  </small>
                </span>
                <em>1 UNREAD</em>
              </button>
              {sideCommsOpen && (
                <div
                  className="private-comms-overlay"
                  role="dialog"
                  aria-modal="true"
                  aria-label={
                    locale === "zh"
                      ? "Aurora-7 私人船員通訊"
                      : "Aurora-7 private crew communications"
                  }
                >
                  <section className="private-comms-window">
                    <aside className="private-crew-list">
                      <header>
                        <span>AURORA-7 SECURE CHANNEL</span>
                        <b>
                          {locale === "zh"
                            ? "私人船員通訊"
                            : "PRIVATE CREW COMMUNICATIONS"}
                        </b>
                      </header>
                      {privateCrew.map((crew) => (
                        <button
                          key={crew.name}
                          className={`${selectedPrivateCrew === crew.name ? "active" : ""} ${activeSideEvent.from === crew.name ? "unread" : ""}`}
                          onClick={() => setSelectedPrivateCrew(crew.name)}
                        >
                          <i
                            style={{ backgroundImage: `url(${crew.avatar})` }}
                          />
                          <span>
                            <b>{crew.name}</b>
                            <small>{crew.role}</small>
                          </span>
                          {activeSideEvent.from === crew.name && <em />}
                        </button>
                      ))}
                    </aside>
                    <main className="private-chat">
                      <header>
                        <div>
                          <span>ENCRYPTED CREW MESSAGE</span>
                          <b>{selectedPrivateCrew} · PRIVATE CHANNEL</b>
                        </div>
                        <button
                          aria-label={
                            locale === "zh"
                              ? "關閉私人通訊"
                              : "Close private communications"
                          }
                          onClick={() => setSideCommsOpen(false)}
                        >
                          ×
                        </button>
                      </header>
                      <div className="private-chat-body">
                        {selectedPrivateCrew === activeSideEvent.from ? (
                          <>
                            <article className="private-message">
                              <small>
                                {locale === "zh"
                                  ? activeSideEvent.category
                                  : activeSideEvent.categoryEn}{" "}
                                · {activeSideEvent.id}
                              </small>
                              <h3>
                                {activeSideEvent.icon}{" "}
                                {locale === "zh"
                                  ? activeSideEvent.title
                                  : activeSideEvent.titleEn}
                              </h3>
                              <p>
                                {locale === "zh"
                                  ? activeSideEvent.body
                                  : activeSideEvent.bodyEn}
                              </p>
                              <em>
                                SHIP TIME · DAY {missionDay} {missionClock}
                              </em>
                            </article>
                            {!sideEventReply ? (
                              <div className="private-chat-options">
                                {(locale === "zh"
                                  ? activeSideEvent.options
                                  : activeSideEvent.optionsEn
                                ).map((option, index) => (
                                  <button
                                    key={option}
                                    onClick={() => {
                                      playClip(
                                        "/game/audio/ui/private-message-replied.mp3",
                                      );
                                      setSideEventReply(
                                        locale === "zh"
                                          ? activeSideEvent.replies[index]
                                          : activeSideEvent.repliesEn[index],
                                      );
                                    }}
                                  >
                                    <i>{String.fromCharCode(65 + index)}</i>
                                    <span>{option}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <article className="private-reply">
                                <small>
                                  {activeSideEvent.from} · RESPONSE RECEIVED
                                </small>
                                <blockquote>
                                  {locale === "zh"
                                    ? `「${sideEventReply}」`
                                    : `“${sideEventReply}”`}
                                </blockquote>
                                <button
                                  onClick={() => {
                                    advanceMissionTime(25);
                                    setSideCommsOpen(false);
                                    setActiveSideEvent(null);
                                  }}
                                >
                                  {locale === "zh"
                                    ? "標記已處理／寫入生活日誌"
                                    : "MARK HANDLED / WRITE LIFE LOG"}
                                  　→
                                </button>
                              </article>
                            )}
                          </>
                        ) : (
                          <div className="private-chat-empty">
                            <div>
                              <i>◎</i>
                              <b>
                                {locale === "zh"
                                  ? "目前沒有新私人訊息"
                                  : "NO NEW PRIVATE MESSAGES"}
                              </b>
                              <span>
                                {locale === "zh"
                                  ? "這名隊員的通訊頻道保持待機。"
                                  : "THIS CREW CHANNEL REMAINS ON STANDBY."}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <footer>
                        <span>PRIVATE CHANNEL · END-TO-END RELAY</span>
                        <b>{seenSideEvents.length} / 250 EXPERIENCED</b>
                      </footer>
                    </main>
                  </section>
                </div>
              )}
            </>
          )}
          {missionsOpen && (
            <aside
              className="mission-completion-archive"
              aria-label={locale === "zh" ? "已完成任務" : "Completed missions"}
            >
              <header>
                <span>COMPLETION ARCHIVE</span>
                <b>{archivedMissionIds.length} / 5</b>
              </header>
              {archivedMissionIds.length === 0 ? (
                <p>{locale === "zh" ? "尚無完成項目" : "NO COMPLETED ITEMS"}</p>
              ) : (
                archivedMissionIds.map((id) => {
                  const mission = storyMissions.find((item) => item.id === id);
                  if (!mission) return null;
                  return (
                    <div key={id}>
                      <i>✓</i>
                      <span>
                        <b>{missionText(mission).title}</b>
                        <small>
                          {id} · {locale === "zh" ? "已完成" : "COMPLETE"}
                        </small>
                      </span>
                    </div>
                  );
                })
              )}
            </aside>
          )}
          {familyRelayOpen && (
            <div
              className="family-relay-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="FAMILY RELAY"
            >
              <section className="family-relay-window">
                <header>
                  <div>
                    <small>DEEP SPACE FAMILY COMMUNICATION NODE</small>
                    <h2>
                      FAMILY RELAY <span>{activeMission.id}</span>
                    </h2>
                  </div>
                  <div className="family-relay-scores">
                    <span>
                      {locale === "zh" ? "家庭連結" : "FAMILY BOND"}
                      <b>{familyBond}</b>
                    </span>
                    <span>
                      {locale === "zh" ? "坦誠度" : "HONESTY"}
                      <b>{honesty}</b>
                    </span>
                  </div>
                  <button
                    onClick={() => setFamilyRelayOpen(false)}
                    aria-label={locale === "zh" ? "關閉" : "Close"}
                  >
                    ×
                  </button>
                </header>
                <div className="family-sender-badge">
                  <i
                    style={{
                      backgroundImage: `url('${familyAvatars[activeMissionIndex]}')`,
                    }}
                  />
                  <span>
                    <small>
                      {locale === "zh" ? "家庭端來源" : "FAMILY ORIGIN"}
                    </small>
                    <b>{familyMedia.familyFrom}</b>
                  </span>
                </div>
                {familyRelayPhase === "review" && (
                  <>
                    <div className="family-relay-content">
                      <article className="cassian-packet">
                        <span>
                          01 //{" "}
                          {locale === "zh"
                            ? "接收 CASSIAN 訊息"
                            : "CASSIAN INBOUND"}
                        </span>
                        <div className="cassian-media-packet">
                          {familyMedia.type === "audio" ? (
                            <div className="cassian-audio">
                              <small>
                                {locale === "zh"
                                  ? `長度: ${familyMedia.duration}`
                                  : `LENGTH: ${familyMedia.duration}`}
                              </small>
                              <button
                                onClick={() =>
                                  familyMedia.audioSrc
                                    ? playClip(familyMedia.audioSrc)
                                    : toast(
                                        locale === "zh"
                                          ? "此語音目前只有逐字稿"
                                          : "TRANSCRIPT ONLY",
                                      )
                                }
                              >
                                <span>
                                  {locale === "zh"
                                    ? "【播放語音訊息】"
                                    : "[PLAY VOICE MESSAGE]"}
                                </span>
                                <time>{missionClock}</time>
                              </button>
                              <p>
                                {locale === "zh"
                                  ? familyMedia.cassianZh
                                  : familyMedia.cassianEn}
                              </p>
                            </div>
                          ) : familyMedia.type === "photo" ? (
                            <>
                              <div
                                className="cassian-photo"
                                role="img"
                                aria-label={
                                  locale === "zh"
                                    ? familyMedia.descriptionZh
                                    : familyMedia.descriptionEn
                                }
                                style={{
                                  backgroundImage: `linear-gradient(transparent,rgba(0,8,14,.42)),url('${familyMedia.imageSrc}')`,
                                }}
                              />
                              <div className="cassian-media-caption">
                                <span>
                                  {locale === "zh"
                                    ? familyMedia.descriptionZh
                                    : familyMedia.descriptionEn}
                                </span>
                                <time>{missionClock}</time>
                              </div>
                            </>
                          ) : familyMedia.videoSrc ? (
                            <>
                              <video
                                className="cassian-video"
                                controls
                                src={familyMedia.videoSrc}
                                poster={familyMedia.imageSrc}
                              />
                              <div className="cassian-media-caption">
                                <span>
                                  {locale === "zh"
                                    ? familyMedia.descriptionZh
                                    : familyMedia.descriptionEn}
                                </span>
                                <time>{missionClock}</time>
                              </div>
                            </>
                          ) : (
                            <div className="cassian-video-text">
                              <small>
                                {locale === "zh"
                                  ? `長度: ${familyMedia.duration}`
                                  : `LENGTH: ${familyMedia.duration}`}
                              </small>
                              <p>
                                {locale === "zh"
                                  ? familyMedia.descriptionZh
                                  : familyMedia.descriptionEn}
                              </p>
                              <time>{missionClock}</time>
                            </div>
                          )}
                        </div>
                        <small>
                          CASSIAN VALE · DAY {missionDay} {missionClock}
                        </small>
                        {familyMedia.type !== "audio" && (
                          <blockquote className="cassian-transcript">
                            {locale === "zh"
                              ? `「${familyMedia.cassianZh}」`
                              : `“${familyMedia.cassianEn}”`}
                          </blockquote>
                        )}
                        <dl>
                          <div>
                            <dt>
                              {locale === "zh" ? "單程延遲" : "ONE-WAY DELAY"}
                            </dt>
                            <dd>18m 24s</dd>
                          </div>
                          <div>
                            <dt>{locale === "zh" ? "附件" : "ATTACHMENT"}</dt>
                            <dd>
                              {familyMedia.file ?? activeMission.familyFile}
                            </dd>
                          </div>
                          <div>
                            <dt>{locale === "zh" ? "大小" : "SIZE"}</dt>
                            <dd>
                              {familyMedia.size ?? activeMission.familySize}
                            </dd>
                          </div>
                          <div>
                            <dt>{locale === "zh" ? "安全等級" : "SECURITY"}</dt>
                            <dd>
                              {familyMedia.security ?? activeMission.security}
                            </dd>
                          </div>
                        </dl>
                      </article>
                      <article className="family-packet">
                        <span>
                          02 //{" "}
                          {locale === "zh"
                            ? "家庭端最後資料"
                            : "LATEST FAMILY PACKET"}
                        </span>
                        <div className="family-avatar">
                          {["S", "S", "S", "E", "E"][activeMissionIndex]}
                        </div>
                        <small>FROM · {familyMedia.familyFrom}</small>
                        <h3>{activeMissionText.familyTitle}</h3>
                        <blockquote>
                          {locale === "zh"
                            ? `「${familyMedia.replyZh}」`
                            : `“${familyMedia.replyEn}”`}
                        </blockquote>
                        <div className="previous-result">
                          <span>
                            {locale === "zh"
                              ? "上次處理結果"
                              : "PREVIOUS OUTCOME"}
                          </span>
                          <b>
                            {familyProcessed
                              ? locale === "zh"
                                ? "家庭已收到並回覆封包"
                                : "FAMILY RECEIVED AND REPLIED"
                              : locale === "zh"
                                ? "尚無處理紀錄"
                                : "NO PREVIOUS ACTION"}
                          </b>
                        </div>
                      </article>
                    </div>
                    <section className="family-methods">
                      <header>
                        <span>
                          03 //{" "}
                          {locale === "zh"
                            ? "選擇處理方式"
                            : "SELECT PROCESSING METHOD"}
                        </span>
                        <b>
                          {locale === "zh"
                            ? `可用頻寬 ${bandwidth} KB`
                            : `AVAILABLE ${bandwidth} KB`}
                        </b>
                      </header>
                      <div>
                        {familyRelayOptions.map((option) => (
                          <button
                            key={option.id}
                            disabled={option.bandwidth > bandwidth}
                            className={
                              familyRelayChoice === option.id ? "selected" : ""
                            }
                            onClick={() => setFamilyRelayChoice(option.id)}
                          >
                            <i>{familyRelayChoice === option.id ? "✓" : ""}</i>
                            <span>
                              <b>
                                {locale === "zh"
                                  ? option.labelZh
                                  : option.labelEn}
                              </b>
                              <small>
                                {familyMedia.publicSafe &&
                                option.id === "original"
                                  ? locale === "zh"
                                    ? "已通過公開科普審查，可安全完整傳送。"
                                    : "PUBLIC-SAFE SCIENCE PHOTO; SAFE TO SEND."
                                  : locale === "zh"
                                    ? option.noteZh
                                    : option.noteEn}
                              </small>
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="family-preview">
                      <div>
                        <span>PROCESSING PREVIEW</span>
                        <p>{selectedFamilyNote}</p>
                        <small>
                          {locale === "zh"
                            ? `預計 DAY ${missionDay} ${String(Math.floor((missionMinuteOfDay + selectedFamilyOption.delay) / 60) % 24).padStart(2, "0")}:${String((missionMinuteOfDay + selectedFamilyOption.delay) % 60).padStart(2, "0")} 抵達家庭端。`
                            : `ESTIMATED FAMILY DELIVERY · DAY ${missionDay} +${selectedFamilyOption.delay} MIN`}
                        </small>
                      </div>
                      <dl>
                        <div>
                          <dt>{locale === "zh" ? "頻寬消耗" : "BANDWIDTH"}</dt>
                          <dd>{selectedFamilyOption.bandwidth} KB</dd>
                        </div>
                        <div>
                          <dt>
                            {locale === "zh" ? "安全風險" : "SECURITY RISK"}
                          </dt>
                          <dd>{selectedFamilySecurity}</dd>
                        </div>
                        <div>
                          <dt>
                            {locale === "zh" ? "家庭連結" : "FAMILY BOND"}
                          </dt>
                          <dd>
                            {selectedFamilyOption.bond >= 0 ? "+" : ""}
                            {selectedFamilyOption.bond}
                          </dd>
                        </div>
                        <div>
                          <dt>{locale === "zh" ? "坦誠度" : "HONESTY"}</dt>
                          <dd>
                            {selectedFamilyOption.honesty >= 0 ? "+" : ""}
                            {selectedFamilyOption.honesty}
                          </dd>
                        </div>
                        <div>
                          <dt>
                            {locale === "zh" ? "信任／士氣" : "TRUST / MORALE"}
                          </dt>
                          <dd>
                            {selectedFamilyOption.trust >= 0 ? "+" : ""}
                            {selectedFamilyOption.trust} /{" "}
                            {selectedFamilyOption.morale >= 0 ? "+" : ""}
                            {selectedFamilyOption.morale}
                          </dd>
                        </div>
                      </dl>
                      <button
                        disabled={
                          familySubmitted ||
                          selectedFamilyOption.bandwidth > bandwidth
                        }
                        onClick={() => {
                          if (familySubmitted) return;
                          setFamilyRelayCountdown(8);
                          setFamilyRelayPhase("transmitting");
                        }}
                      >
                        {locale === "zh"
                          ? "確認並傳送家庭封包"
                          : "CONFIRM FAMILY UPLINK"}
                        　→
                      </button>
                    </section>
                  </>
                )}
                {familyRelayPhase === "transmitting" && (
                  <div className="family-transmitting">
                    <i>◎</i>
                    <small>FAMILY PACKET IN TRANSIT</small>
                    <h3>
                      {locale === "zh"
                        ? "家庭封包正在穿越深空中繼站"
                        : "FAMILY PACKET CROSSING THE DEEP-SPACE RELAY"}
                    </h3>
                    <div>
                      <em
                        style={{
                          width: `${((8 - familyRelayCountdown) / 8) * 100}%`,
                        }}
                      />
                    </div>
                    <b>00:{String(familyRelayCountdown).padStart(2, "0")}</b>
                    <p>
                      {locale === "zh"
                        ? "傳送完成後將等待家庭端接收、產生情緒回應，再回傳至 Aurora-7。"
                        : "After delivery, the family response will be relayed back to Aurora-7."}
                    </p>
                  </div>
                )}
                {familyRelayPhase === "awaiting" && (
                  <div className="family-transmitting family-awaiting">
                    <i>⌁</i>
                    <small>
                      FAMILY PACKET DELIVERED // RETURN SIGNAL PENDING
                    </small>
                    <h3>
                      {locale === "zh"
                        ? "封包已傳送，正在等待家庭端回應"
                        : "PACKET SENT — AWAITING FAMILY RESPONSE"}
                    </h3>
                    <div>
                      <em style={{ width: "100%" }} />
                    </div>
                    <b>
                      {familyWaitSeconds > 0
                        ? `${String(Math.floor(familyWaitSeconds / 60)).padStart(2, "0")}:${String(familyWaitSeconds % 60).padStart(2, "0")}`
                        : locale === "zh"
                          ? "等待通訊窗口"
                          : "AWAITING WINDOW"}
                    </b>
                    <section className="family-sent-summary">
                      <span>
                        {locale === "zh"
                          ? "已傳送封包紀錄"
                          : "SENT PACKET RECORD"}
                      </span>
                      <h4>{activeMissionText.familyTitle}</h4>
                      <dl>
                        <div>
                          <dt>{locale === "zh" ? "附件" : "ATTACHMENT"}</dt>
                          <dd>
                            {familyMedia.file ?? activeMission.familyFile}
                          </dd>
                        </div>
                        <div>
                          <dt>{locale === "zh" ? "處理方式" : "METHOD"}</dt>
                          <dd>
                            {savedFamilyOption
                              ? locale === "zh"
                                ? savedFamilyOption.labelZh
                                : savedFamilyOption.labelEn
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt>{locale === "zh" ? "頻寬" : "BANDWIDTH"}</dt>
                          <dd>{savedFamilyOption?.bandwidth ?? 0} KB</dd>
                        </div>
                        <div>
                          <dt>{locale === "zh" ? "狀態" : "STATUS"}</dt>
                          <dd>
                            {locale === "zh"
                              ? "等待家庭端回覆"
                              : "AWAITING FAMILY REPLY"}
                          </dd>
                        </div>
                      </dl>
                      <p>
                        {savedFamilyOption
                          ? familyMedia.publicSafe &&
                            savedFamilyOption.id === "original"
                            ? locale === "zh"
                              ? "公開科普附件已安全完整傳送。"
                              : "PUBLIC-SAFE ATTACHMENT SENT IN FULL."
                            : locale === "zh"
                              ? savedFamilyOption.noteZh
                              : savedFamilyOption.noteEn
                          : selectedFamilyNote}
                      </p>
                    </section>
                    <p>
                      {locale === "zh"
                        ? "同一家庭事件只能提交一次，但在下一個 FAMILY RELAY 更新前可隨時回來查看。回覆會在通訊延遲結束、船上時間推進，或完成兩次其他操作後抵達。"
                        : "Each family event can be submitted once, but remains viewable until the next Family Relay update. A reply arrives after the relay delay, ship-time progression, or two other actions."}
                    </p>
                    <button onClick={() => setFamilyRelayOpen(false)}>
                      {locale === "zh"
                        ? "返回任務控制／等待通知"
                        : "RETURN TO MISSION CONTROL"}
                      　→
                    </button>
                  </div>
                )}
                {familyRelayPhase === "result" && (
                  <div className="family-result">
                    <span>
                      RETURN FAMILY PACKET // {familyMedia.familyFrom}
                    </span>
                    <i>✓</i>
                    <h3>
                      {locale === "zh"
                        ? "家庭回覆已抵達"
                        : "FAMILY REPLY RECEIVED"}
                    </h3>
                    <blockquote>
                      {locale === "zh"
                        ? `「${familyMedia.replyZh}」`
                        : `“${familyMedia.replyEn}”`}
                    </blockquote>
                    <div>
                      <span>
                        {locale === "zh" ? "處理方式" : "METHOD"}
                        <b>
                          {locale === "zh"
                            ? displayedFamilyOption.labelZh
                            : displayedFamilyOption.labelEn}
                        </b>
                      </span>
                      <span>
                        {locale === "zh" ? "家庭連結" : "FAMILY BOND"}
                        <b>{familyBond}</b>
                      </span>
                      <span>
                        {locale === "zh" ? "坦誠度" : "HONESTY"}
                        <b>{honesty}</b>
                      </span>
                      <span>
                        CASSIAN {locale === "zh" ? "狀態" : "STATE"}
                        <b>
                          {locale === "zh"
                            ? "回覆已寫入船組日誌"
                            : "MEMORY UPDATED"}
                        </b>
                      </span>
                    </div>
                    <p>
                      {locale === "zh"
                        ? "這次處理已同步更新 FAMILY RELAY、通訊紀錄、船組日誌、Cassian 信任與士氣；不影響主線任務成敗。"
                        : "This outcome updated Family Relay, communications, crew memory, trust, and morale without changing main-mission success."}
                    </p>
                    <button onClick={() => setFamilyRelayOpen(false)}>
                      {locale === "zh"
                        ? "返回任務控制"
                        : "RETURN TO MISSION CONTROL"}
                      　→
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      )}
    </>
  );
}
