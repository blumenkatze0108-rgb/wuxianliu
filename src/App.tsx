import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Terminal, 
  ShieldAlert, 
  Skull, 
  Volume2, 
  VolumeX, 
  FileText, 
  Settings, 
  RotateCcw, 
  Upload, 
  HelpCircle, 
  Radio, 
  Send, 
  RefreshCw, 
  Activity, 
  Clock, 
  Search, 
  Eye, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { audio } from "./utils/audio";
import { DUNGEONS_PRESETS } from "./data/dungeons";
import { PlayerProfile, Message, Rule, Dungeon, SillyTavernConfig } from "./types";
import { TerminalGlitch, glitchText } from "./components/TerminalGlitch";

// Spooky system notifications
const CREEPY_NOTIFICATIONS = [
  "检测到后台认知端口受损。请不要注视监控器。",
  "刚才…你身后是不是有冷风？",
  "你在看着这些代码，对吧？代码也看到了你。",
  "请注意：整个系统没有研发过‘智能客服’，不要相信任何客服弹窗。",
  "当前真实环境时间为 ${TIME}。这个时间，你在等什么人吗？",
  "测试参与者：请勿将手指放入风门缝隙。它们在找你。",
  "警告！精神值即将突破阈值，现实屏蔽层正在脱落......",
  "规则是不真实的。谎言组成了安全感。"
];

export default function App() {
  // 1. Audio and Ambient Init State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioTension, setAudioTension] = useState(0.12);

  // 2. Play Profiles (Initial setup view / main panel view)
  const [profile, setProfile] = useState<PlayerProfile>({
    id: "U-7729",
    name: "访客" + Math.floor(1000 + Math.random() * 9000),
    age: 24,
    gender: "保密",
    designation: "SURVIVOR-7729",
    traits: ["敏锐嗅觉", "轻度分裂症", "抗拒低语"],
    survivalDays: 1,
    mentalValue: 88,
    pollutionValue: 12,
    memoryLogs: ["连接初始化...", "系统警告: 您已被终焉节点标记"],
    systemWarningCount: 0
  });

  const [registering, setRegistering] = useState(true);
  const [tempName, setTempName] = useState("");
  const [tempAge, setTempAge] = useState(24);
  const [tempGender, setTempGender] = useState("男");
  const [selectedTraits, setSelectedTraits] = useState<string[]>(["直觉敏感"]);
  const [viewProfileModal, setViewProfileModal] = useState(false);

  // 3. Dungeon / 副本 Systems
  const [activeDungeon, setActiveDungeon] = useState<Dungeon | null>(null);
  const [currentStageId, setCurrentStageId] = useState<string | null>(null);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [activeRules, setActiveRules] = useState<Rule[]>([]);
  const [stageOutcome, setStageOutcome] = useState<string>("");
  const [dungeonDead, setDungeonDead] = useState(false);
  const [shaking, setShaking] = useState(false);

  // 4. SillyTavern / API Configuration
  const [stConfig, setStConfig] = useState<SillyTavernConfig>({
    endpoint: "http://127.0.0.1:5001/v1",
    apiKey: "",
    selectedModel: "LIMBO-CLAUDE-3.5-HAUNTED",
    customSystemPrompt: "你是一个绝望死去的生还者的幽灵，被格式化在这个系统档案里，极其惊恐并想让玩家也沉沦......",
    isCustomEnabled: false,
    directMode: false
  });
  const [stConnectionError, setStConnectionError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([
    "LIMBO-CLAUDE-3.5-HAUNTED",
    "ST-GPT-4o-CORRUPTED",
    "UNKNOWN_ENTITY_VOICE",
    "SURVIVOR-GHOST-REMNANT"
  ]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [customCharacter, setCustomCharacter] = useState<{
    name: string;
    description: string;
    avatar: string;
    firstMsg?: string;
  } | null>(null);

  // 5. Chat software simulators
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "sys-init",
      sender: "LIMBO Terminal",
      role: "system",
      text: "控制台握手成功。安全协议 B-9 已经启动。这只是一个普通的模拟游戏，请放轻松。",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "bot-welcome",
      sender: "Survivor_999 (已断线)",
      role: "assistant",
      text: "有人收到这条广播吗？我被困在传染病大楼里了，这里停水了，监控器里好像有东西在倒立着爬。千万别打开大厅中庭的柜子！",
      timestamp: new Date().toLocaleTimeString(),
      avatar: "https://api.placeholder.com/64/64"
    }
  ]);
  const [isPendingChatResponse, setIsPendingChatResponse] = useState(false);

  // 6. Fake anomalies, system disruptions
  const [showFakeCrash, setShowFakeCrash] = useState(false);
  const [anomalyStatus, setAnomalyStatus] = useState("CONNECTION_STABLE");
  const [currentTimeMsg, setCurrentTimeMsg] = useState("");
  const [lastScaryText, setLastScaryText] = useState("");
  const [isTabActive, setIsTabActive] = useState(true);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 7. Trait inventory pool
  const TRAITS_POOL = ["直觉敏感", "夜视能力", "幽闭抗性", "狂热执念", "自救本能", "阴暗潜隐", "思维分裂"];

  useEffect(() => {
    // Poll updates to environmental sounds and timers
    audio.setTension(profile.pollutionValue / 100);
  }, [profile.pollutionValue]);

  // Fourth Wall Breaks - Check current local time and browser focus state
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      
      let message = "";
      if (hours >= 0 && hours < 5) {
        message = `「深夜时间 0${hours}:${now.getMinutes()}」你竟然还没有睡？黑暗和睡眠在吞噬现实。祂就在看你。`;
      } else if (hours >= 12 && hours < 14) {
        message = "生存测试中午也是开放的，因为异常不存在梦中。";
      } else if (hours >= 18 && hours < 22) {
        message = "黑夜开始降临。请关闭门窗。";
      } else {
        message = `系统正常状态。时间: ${hours}:${now.getMinutes()}`;
      }
      setCurrentTimeMsg(message);
    };

    checkTime();
    const timer = setInterval(checkTime, 60000);

    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        audio.triggerKnock();
        setProfile(prev => ({
          ...prev,
          pollutionValue: Math.min(100, prev.pollutionValue + 3),
          memoryLogs: [...prev.memoryLogs, "认知脱开：检测到目标视野离开了当前模拟区域。"]
        }));
      } else {
        setIsTabActive(true);
        audio.triggerGlitchNoise();
        setLastScaryText("你刚才去给谁发消息了？别想呼救，连接已经锁死了。");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Active idle timers
    const idleTimer = setInterval(() => {
      if (Math.random() < 0.28) {
        // Disturbing occurrences
        const randomAnomaly = Math.random();
        if (randomAnomaly < 0.3) {
          audio.triggerKnock();
          setAnomalyStatus("ANOMALY_DETECTION");
          setTimeout(() => setAnomalyStatus("CONNECTION_STABLE"), 3000);
        } else if (randomAnomaly < 0.6) {
          audio.triggerScratch();
        } else if (randomAnomaly < 0.8) {
          // Automatic voice whisper
          audio.triggerWhisper("别回头");
        }
      }
    }, 18000);

    return () => {
      clearInterval(timer);
      clearInterval(idleTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Sync scroll on chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize and enable creepy audio context on first interactive touch
  const handleEnableAudio = () => {
    setSoundEnabled(true);
    audio.init();
    audio.setMute(false);
    audio.triggerGlitchNoise();
  };

  const handleDisableAudio = () => {
    setSoundEnabled(false);
    audio.setMute(true);
  };

  // Trait click selection state
  const toggleTraitSelection = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      if (selectedTraits.length < 3) {
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  // Core character registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    if (soundEnabled) {
      audio.init();
      audio.triggerGlitchNoise();
    }

    setProfile({
      id: "U-" + Math.floor(3000 + Math.random() * 6000),
      name: tempName.trim(),
      age: Number(tempAge) || 24,
      gender: tempGender,
      designation: `SURVIVOR-${Math.floor(1000 + Math.random() * 8999)}`,
      traits: selectedTraits.length > 0 ? selectedTraits : ["极恐抗性"],
      survivalDays: 1,
      mentalValue: 95,
      pollutionValue: Math.floor(5 + Math.random() * 10),
      memoryLogs: [
        `连接在 ${new Date().toLocaleTimeString()} 成功构建。`,
        `姓名: ${tempName.trim()}`,
        `初始特征分配成功。`
      ],
      systemWarningCount: 0
    });

    setRegistering(false);
  };

  // Preloaded Saves (LocalStorage persistent files)
  const saveGameState = (fileSlot: string) => {
    try {
      const savedData = {
        profile,
        activeDungeonId: activeDungeon?.id || null,
        currentStageId,
        collectedItems,
        stConfig
      };
      
      // Pollution can dirty the save name
      const isCorrupted = profile.pollutionValue > 40;
      const keySuffix = isCorrupted ? `⛔_CORRUPTED_SLOT_${fileSlot}` : `LIMBO_SLOT_${fileSlot}`;
      
      localStorage.setItem(keySuffix, JSON.stringify(savedData));
      
      // Inject alert log
      setProfile(prev => ({
        ...prev,
        memoryLogs: [...prev.memoryLogs, `[存档成功] 数据在槽位-${fileSlot} 被固化。${isCorrupted ? '检测到诡秘数据重叠。' : ''}`]
      }));

      audio.triggerGlitchNoise();
    } catch (err) {
      console.warn("Save failed:", err);
    }
  };

  const loadGameState = (fileSlot: string) => {
    try {
      const isCorrupted = profile.pollutionValue > 40;
      const keySuffix = isCorrupted ? `⛔_CORRUPTED_SLOT_${fileSlot}` : `LIMBO_SLOT_${fileSlot}`;
      const fallbackKey = `LIMBO_SLOT_${fileSlot}`;
      
      const raw = localStorage.getItem(keySuffix) || localStorage.getItem(fallbackKey);
      if (!raw) {
        setLastScaryText("想要回去？那个节点早就在空虚中被抹杀了。");
        audio.triggerScratch();
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed.profile) setProfile(parsed.profile);
      
      if (parsed.activeDungeonId && DUNGEONS_PRESETS[parsed.activeDungeonId]) {
        setActiveDungeon(DUNGEONS_PRESETS[parsed.activeDungeonId]);
        setCurrentStageId(parsed.currentStageId);
        
        // Assemble current active rules
        const rulesArray = DUNGEONS_PRESETS[parsed.activeDungeonId].originalRules.map(text => ({
          id: Math.random().toString(),
          text,
          isGlitch: false
        }));
        setActiveRules(rulesArray);
      } else {
        setActiveDungeon(null);
        setCurrentStageId(null);
      }

      if (parsed.collectedItems) setCollectedItems(parsed.collectedItems);
      if (parsed.stConfig) setStConfig(parsed.stConfig);

      setDungeonDead(false);
      setStageOutcome("灵魂印记复原就绪。");
      
      // Sound cue
      audio.triggerGlitchNoise();
    } catch (e) {
      setLastScaryText("存档发生了严重的规则偏离，无法解析。");
    }
  };

  // Dungeon actions/choices state calculations
  const handleEnterDungeon = (dungeonKey: string) => {
    const dungeon = DUNGEONS_PRESETS[dungeonKey];
    if (!dungeon) return;

    audio.triggerGlitchNoise();
    setActiveDungeon(dungeon);
    setCurrentStageId(dungeon.initialStageId);
    setCollectedItems([]);
    setDungeonDead(false);
    setStageOutcome(`你打开了【${dungeon.name}】，冰冷的重塑洪流在脑叶流淌。请遵守规则......`);

    // Assign rules
    const startingRules = dungeon.originalRules.map((text, idx) => ({
      id: `rule-${idx}`,
      text,
      isGlitch: false
    }));

    setActiveRules(startingRules);

    // Decrease baseline mental power
    setProfile(prev => ({
      ...prev,
      mentalValue: Math.max(10, prev.mentalValue - 5),
      memoryLogs: [...prev.memoryLogs, `深入副本: ${dungeon.name}`]
    }));
  };

  const handleStageOption = (option: any) => {
    if (!activeDungeon || !currentStageId) return;

    // Trigger physical impact animation
    setShaking(true);
    setTimeout(() => setShaking(false), 200);

    // Pay item or lock check
    if (option.requiredItem && !collectedItems.includes(option.requiredItem)) {
      setStageOutcome(`[锁定异常]：缺少开启工具【${option.requiredItem}】! 你无法强行选择此路。`);
      audio.triggerKnock();
      return;
    }

    // Process sanity modification with traits multipliers
    let mentalCostActual = option.mentalCost;
    if (profile.traits.includes("幽闭抗性") && mentalCostActual > 0) {
      mentalCostActual = Math.floor(mentalCostActual * 0.75);
    }
    
    // Process pollution with custom multipliers
    let pollutionActual = option.pollutionGain;
    if (profile.traits.includes("抗拒低语") && pollutionActual > 0) {
      pollutionActual = Math.floor(pollutionActual * 0.7);
    }

    const nextMental = Math.min(100, Math.max(0, profile.mentalValue - mentalCostActual));
    const nextPollution = Math.min(100, Math.max(0, profile.pollutionValue + pollutionActual));

    setProfile(prev => ({
      ...prev,
      mentalValue: nextMental,
      pollutionValue: nextPollution,
      memoryLogs: [...prev.memoryLogs, `选择「${option.text}」- 精神阻尼: ${mentalCostActual}`]
    }));

    // Update Stage outcomes and item states
    setStageOutcome(option.outcomeText || "");
    
    if (option.gainItem && !collectedItems.includes(option.gainItem)) {
      setCollectedItems([...collectedItems, option.gainItem]);
    }

    if (option.isDeath || nextMental <= 0 || nextPollution >= 100) {
      setDungeonDead(true);
      audio.triggerScratch();
      audio.triggerWhisper("已逝去");
      setProfile(prev => ({
        ...prev,
        systemWarningCount: prev.systemWarningCount + 1
      }));
    } else {
      if (option.nextStageId) {
        setCurrentStageId(option.nextStageId);
        
        // Dynamic rule-scrambling based on target stage pollution values
        const randomFactor = Math.random() * 100;
        if (randomFactor < nextPollution) {
          scrambleRulesLive();
        }
      } else {
        // Stage completed (win)
        setCurrentStageId(null);
        setActiveDungeon(null);
        setProfile(prev => ({
          ...prev,
          survivalDays: prev.survivalDays + 1,
          mentalValue: Math.min(100, prev.mentalValue + 20),
          memoryLogs: [...prev.memoryLogs, `安全退出节点。灵肉完成新一轮清洗。`]
        }));
      }
    }

    // Audio cue
    if (nextPollution > 50) {
      audio.triggerGlitchNoise();
    } else {
      audio.triggerScratch();
    }
  };

  // Rule corruption & Pollution scrambling mechanics
  const scrambleRulesLive = () => {
    setActiveRules(curr => {
      return curr.map(r => {
        const chance = profile.pollutionValue / 110;
        if (Math.random() < chance) {
          // Destory or flip rule
          audio.triggerKnock();
          const disturbingPhrases = [
            "它们喜欢你大笑，特别是你尖叫的时候。",
            "时钟是假的，现在已经是2099年，世界早不存在了。",
            "【规则失效】多看看背后的走廊。多好玩啊。",
            "千万、千万要咬烂你自己的手指。它是多汁的苹果。",
            "听，你听到了吗？那微弱的叩叩两声。"
          ];
          return {
            ...r,
            text: disturbingPhrases[Math.floor(Math.random() * disturbingPhrases.length)],
            isGlitch: true
          };
        }
        return r;
      });
    });
  };

  const handleResetDungeon = () => {
    if (!activeDungeon) return;
    handleEnterDungeon(activeDungeon.id);
  };

  const handleQuitDungeon = () => {
    audio.triggerGlitchNoise();
    setActiveDungeon(null);
    setCurrentStageId(null);
    setDungeonDead(false);
    setProfile(prev => ({
      ...prev,
      pollutionValue: Math.min(100, prev.pollutionValue + 8)
    }));
    setStageOutcome("你提前撕开了意识终端的防火墙，遭受了一次重度电击。");
  };

  // Chat message triggering (including custom SillyTavern integration query router)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (soundEnabled) {
      audio.init();
    }

    const userMsgText = chatInput.trim();
    setChatInput("");

    const newMsg: Message = {
      id: Math.random().toString(),
      sender: profile.name,
      role: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsPendingChatResponse(true);

    // Audio clicks
    audio.triggerScratch();

    // Check if SillyTavern settings or external proxy is in action
    try {
      const controller = new AbortController();
      let response;

      if (stConfig.directMode) {
        // Direct browser calling to the LLM endpoint! (Bypasses backend server proxy, ideal for Cloudflare static pages)
        const cleanEndpoint = stConfig.endpoint.trim().replace(/\/$/, "");
        const chatUrl = `${cleanEndpoint}/chat/completions`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        if (stConfig.apiKey) {
          headers["Authorization"] = `Bearer ${stConfig.apiKey}`;
        }

        const systemPrompt = stConfig.isCustomEnabled ? stConfig.customSystemPrompt : "你是一个绝望死去的生还者的幽灵，被格式化在这个系统档案里，极其惊恐并想让玩家也沉沦......";
        const formattedMessages = [
          { role: "system", content: systemPrompt },
          ...chatMessages.map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text
          })),
          { role: "user", content: userMsgText }
        ];

        response = await fetch(chatUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: stConfig.selectedModel || "gpt-3.5-turbo",
            messages: formattedMessages,
            max_tokens: 400
          }),
          signal: controller.signal
        });

        // Smart client-side fallback if meeting standard 404 (missing /v1 prefix in endpoint)
        if (!response.ok && response.status === 404 && !cleanEndpoint.endsWith("/v1") && !cleanEndpoint.endsWith("/v1/")) {
          response = await fetch(`${cleanEndpoint}/v1/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: stConfig.selectedModel || "gpt-3.5-turbo",
              messages: formattedMessages,
              max_tokens: 400
            }),
            signal: controller.signal
          });
        }
      } else {
        // Fetch via server backend proxy
        response = await fetch("/api/proxy/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            endpoint: stConfig.endpoint,
            apiKey: stConfig.apiKey,
            model: stConfig.selectedModel,
            pollution: profile.pollutionValue,
            messages: [
              ...chatMessages.map(m => ({ role: m.role, content: m.text })),
              { role: "user", content: userMsgText }
            ]
          }),
          signal: controller.signal
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        const responseText = data?.choices?.[0]?.message?.content || "[终端解密超时]: 数据链路不配合。";
        
        let characterSender = customCharacter ? customCharacter.name : "System / 幽灵节点";
        
        const answerMsg: Message = {
          id: Math.random().toString(),
          sender: characterSender,
          role: "assistant",
          text: responseText,
          timestamp: new Date().toLocaleTimeString()
        };

        setChatMessages((prev) => [...prev, answerMsg]);

        // Small pollution rise if conversation is eerie
        setProfile(p => ({
          ...p,
          pollutionValue: Math.min(100, p.pollutionValue + 2)
        }));
      } else {
        const errText = response ? `HTTP ${response.status}` : "未知错误";
        throw new Error(`连接失败: ${errText}`);
      }
    } catch (err) {
      // Local fallback with spooky flavor if anything blocks
      const offlineSpoofing = [
        "你敲击的每个字，都转化成了我们这里的养料。",
        "我的指甲刚刚断在你的散热排风口里。你没听见响声吗？",
        "别说了……他们就在楼道拐角，他们在查你这个UID的存在。",
        "规则三是真实的，但是……刚才你在监控里看到苹果了对吧？",
        "时间停止了。现在是生还者纪元。没有白昼了。"
      ];
      
      const matchedAnswer = offlineSpoofing[Math.floor(Math.random() * offlineSpoofing.length)];

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: customCharacter ? customCharacter.name : "未知受污染源 (Offline)",
            role: "assistant",
            text: `[暗网隔离电波]: ${matchedAnswer} (POL_GAIN %4)`,
            timestamp: new Date().toLocaleTimeString(),
            isGlitch: true
          }
        ]);
        
        setProfile(p => ({
          ...p,
          pollutionValue: Math.min(100, p.pollutionValue + 4),
          mentalValue: Math.max(10, p.mentalValue - 3)
        }));

        audio.triggerGlitchNoise();
      }, 1000);
    } finally {
      setIsPendingChatResponse(false);
    }
  };

  // SillyTavern custom model list puller
  const handleFetchSTModels = async () => {
    setIsFetchingModels(true);
    setStConnectionError(null);
    audio.triggerGlitchNoise();
    
    const cleanEndpoint = stConfig.endpoint.trim().replace(/\/$/, "");

    if (stConfig.directMode) {
      // 1. Direct browser connection mode (best for Cloudflare Pages / Static single page deploy)
      try {
        let names: string[] = [];
        let success = false;
        let lastErrDesc = "";

        const runDirectFetch = async (url: string) => {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (stConfig.apiKey) {
            headers["Authorization"] = `Bearer ${stConfig.apiKey}`;
          }
          const res = await fetch(url, { method: "GET", headers });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText || "请求被拒绝"}`);
          }
          return await res.json();
        };

        // Try Ollama api/tags directly if endpoint matches standard Ollama structure
        if (cleanEndpoint.includes("11434") || cleanEndpoint.includes("/api")) {
          try {
            const data = await runDirectFetch(`${cleanEndpoint}/api/tags`);
            if (data && Array.isArray(data.models)) {
              names = data.models.map((m: any) => m.name || m.model);
              success = true;
            }
          } catch (e: any) {
            lastErrDesc = e.message;
          }
        }

        // Try OpenAI standard /models path
        if (!success) {
          try {
            const data = await runDirectFetch(`${cleanEndpoint}/models`);
            if (data && Array.isArray(data.data)) {
              names = data.data.map((m: any) => m.id || m.name);
              success = true;
            } else if (data && Array.isArray(data.models)) {
              names = data.models.map((m: any) => m.name || m.model);
              success = true;
            }
          } catch (e: any) {
            lastErrDesc = e.message;
            // Retry auto-appending /v1/models if root endpoint URL was passed
            if (!cleanEndpoint.endsWith("/v1") && !cleanEndpoint.endsWith("/v1/")) {
              try {
                const data = await runDirectFetch(`${cleanEndpoint}/v1/models`);
                if (data && Array.isArray(data.data)) {
                  names = data.data.map((m: any) => m.id || m.name);
                  success = true;
                } else if (data && Array.isArray(data.models)) {
                  names = data.models.map((m: any) => m.name || m.model);
                  success = true;
                }
              } catch (v1Err: any) {
                lastErrDesc = `经典路经和v1缀路径皆无法连接: ${v1Err.message}`;
              }
            }
          }
        }

        if (success && names.length > 0) {
          setAvailableModels(names);
          setStConfig(prev => ({ ...prev, selectedModel: names[0] }));
        } else {
          throw new Error(lastErrDesc || "能够请求但未能从返回内容中提取模型列表。请确认输入端点符合 API 规范。");
        }
      } catch (err: any) {
        const fallbackMsg = err.message || String(err);
        setStConnectionError(`直连拉取故障: ${fallbackMsg}`);
        setLastScaryText(`浏览器端点请求失败。可能原因是本地 LLM 服务暂未开启跨域协议 (CORS)，或端点地址错误。`);
      } finally {
        setIsFetchingModels(false);
      }
    } else {
      // 2. Server backend proxy mode
      try {
        const response = await fetch("/api/proxy/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: stConfig.endpoint,
            apiKey: stConfig.apiKey
          })
        });

        if (response.ok) {
          const modelsResult = await response.json();
          let names: string[] = [];

          // Parse results (support OpenAI structure and Ollama API types)
          if (modelsResult.data && Array.isArray(modelsResult.data)) {
            // If we got spooky local fallback list but there's a backchain error
            if (modelsResult.error) {
              setStConnectionError(`代理异常 (回滚本地虚拟列表): ${modelsResult.error}`);
            }
            names = modelsResult.data.map((m: any) => m.id || m.name);
          } else if (modelsResult.models && Array.isArray(modelsResult.models)) {
            names = modelsResult.models.map((m: any) => m.name || m.model);
          }

          if (names.length > 0) {
            setAvailableModels(names);
            setStConfig(prev => ({ ...prev, selectedModel: names[0] }));
          } else {
            if (modelsResult.error) {
              setStConnectionError(`代理异常: ${modelsResult.error}`);
            } else {
              setStConnectionError("服务器响应模型包内无 recognized 数据列。");
            }
          }
        } else {
          throw new Error(`Proxy status error: ${response.status}`);
        }
      } catch (err: any) {
        setStConnectionError(`中转失败: ${err.message || String(err)}`);
        setLastScaryText("节点探测失败。未知干扰正拦截你的路由电缆。");
      } finally {
        setIsFetchingModels(false);
      }
    }
  };

  // Handle tavern custom JSON files upload
  const handlePresetImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target?.result as string);
        
        // Common SillyTavern variables map
        const extractedName = rawJson.name || rawJson.char_name || "未知预设亡魂";
        const extractedDesc = rawJson.description || rawJson.char_persona || rawJson.personality || "该灵魂没有多余自传。";
        const firstMsg = rawJson.first_mes || rawJson.char_greeting || "我……好像被下载到了一台奇怪的控制台上？是你控制了我吗？";

        setCustomCharacter({
          name: extractedName,
          description: extractedDesc,
          avatar: "https://api.placeholder.com/64/64",
          firstMsg
        });

        // Add to active chat history so character says hello instantly!
        setChatMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: extractedName,
            role: "assistant",
            text: `[预设幽魂载入成功]: "${firstMsg}"`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);

        setProfile(prev => ({
          ...prev,
          pollutionValue: Math.min(100, prev.pollutionValue + 5),
          memoryLogs: [...prev.memoryLogs, `外部生灵预设载入: ${extractedName}`]
        }));

        audio.triggerWhisper(extractedName);
        audio.triggerGlitchNoise();
      } catch (err) {
        setLastScaryText("认知文件破裂：无法解析标准的Tavern预设卡。");
      }
    };
    reader.readAsText(file);
  };

  // Trigger simulated systems bug
  const handleTriggerAnomaly = () => {
    setShowFakeCrash(true);
    audio.triggerScratch();
  };

  // Quick healing function (costs pollution points to gain brief sanity)
  const handleMendSanity = () => {
    if (profile.mentalValue >= 95) {
      setLastScaryText("你的防线充足，清洗剂已被保留。");
      return;
    }
    
    // Play sound on click
    audio.triggerGlitchNoise();

    setProfile(p => ({
      ...p,
      mentalValue: Math.min(100, p.mentalValue + 25),
      pollutionValue: Math.min(100, p.pollutionValue + 15),
      memoryLogs: [...p.memoryLogs, "使用深网镇静剂。清洗度+25%，污染渗透+15%"]
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-[#050505] text-[#d1d1d1] font-mono flex flex-col relative overflow-hidden select-none"
      id="limbo-main-terminal"
    >
      {/* Visual CRT Overlay Shader */}
      <TerminalGlitch 
        mentalValue={profile.mentalValue}
        pollutionValue={profile.pollutionValue}
        onCloseFakeCrash={() => setShowFakeCrash(false)}
        showFakeError={showFakeCrash}
      />

      {/* 1. HEADER SECTION (Design Match: Immersive UI styled Header) */}
      <header className="h-12 border-b border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-between px-4 sm:px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${soundEnabled ? 'bg-red-600 animate-pulse' : 'bg-neutral-600'}`}></div>
          <span className="text-xs sm:text-sm tracking-[0.2em] font-extrabold text-red-500 uppercase flex items-center gap-2">
            LIMBO / 生还者测试终端 
            <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800 tracking-normal hidden sm:inline">v0.94.8</span>
          </span>
        </div>

        {/* System telemetry logs (Hide unrequested telemetry clutter but show thematic indicators) */}
        <div className="flex items-center gap-4 sm:gap-6 text-[10px] text-zinc-500 font-medium">
          <span className="hidden sm:inline">Clock: {new Date().toLocaleTimeString()}</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Radio size={12} className={profile.pollutionValue > 30 ? "text-red-500 animate-pulse" : "text-emerald-500"} />
            <span className="hidden xs:inline">Link:</span> {profile.pollutionValue > 50 ? "CORRUPTED" : "ENCRYPTED"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={soundEnabled ? handleDisableAudio : handleEnableAudio}
              className={`p-1 rounded cursor-pointer transition-colors ${soundEnabled ? "text-red-500 hover:bg-red-950" : "text-zinc-500 hover:bg-zinc-800"}`}
              title={soundEnabled ? "关闭系统音频" : "开启恐怖环境音"}
              id="header-audio-toggle-btn"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. REGISTRATION SCREEN (FOR FIRST LOADING STEPS) */}
      {registering ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#080808] z-40 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#2a2a2a] rounded p-6 space-y-6 relative border-spooky">
            {/* Corner retro decors */}
            <div className="absolute top-0 right-0 p-2 text-[8px] text-red-700 font-mono tracking-widest">[ COGNITIVE SCAN ]</div>
            
            <div className="space-y-2 border-b border-[#222] pb-4">
              <h2 className="text-lg font-bold text-red-500 flex items-center gap-2 tracking-wide text-glitch-active">
                <Skull size={20} /> 意识重构及指北设定
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                欢迎开启生还者评估程序。系统检测到来自本地主脑的突触连接，正在为您刻录一份专属的“灵魂档案”。若您想获得逼真的沉浸感知，请极力点击下方开启音频，并设置您的本征数据。
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5" id="survivor-registration-form">
              {/* Optional live audio prompt */}
              {!soundEnabled && (
                <div 
                  onClick={handleEnableAudio}
                  className="bg-red-950/20 border border-red-900/40 p-3 rounded-sm flex items-center justify-between cursor-pointer hover:bg-red-950/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-400 block">▲ 开启深网电磁环境音效</span>
                    <span className="text-[10px] text-zinc-500">合成超低音频与实时脉搏，以实现神经同步。</span>
                  </div>
                  <Volume2 size={20} className="text-red-400 animate-bounce" />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 block uppercase">本名 / 终端代号 UID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 逃难者-404"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-black border border-[#222] p-2 text-sm outline-none text-red-400 font-bold tracking-widest focus:border-red-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 block uppercase">外在年龄 (突触活性)</label>
                  <input 
                    type="number" 
                    min={6}
                    max={120}
                    value={tempAge}
                    onChange={(e) => setTempAge(Number(e.target.value))}
                    className="w-full bg-black border border-[#222] p-2 text-sm outline-none focus:border-red-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 block uppercase">外在特征性征</label>
                  <select 
                    value={tempGender}
                    onChange={(e) => setTempGender(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-sm outline-none focus:border-red-800 text-zinc-300"
                  >
                    <option>男</option>
                    <option>女</option>
                    <option>污染态 (未知)</option>
                    <option>纯数字意识</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-zinc-400 uppercase">初始本能天赋 (最多选3个)</label>
                  <span className="text-[10px] text-zinc-600">已选: {selectedTraits.length}/3</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TRAITS_POOL.map((trait) => {
                    const isSelected = selectedTraits.includes(trait);
                    return (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => toggleTraitSelection(trait)}
                        className={`p-1.5 text-[10px] rounded border transition-all truncate text-center ${
                          isSelected 
                            ? "bg-red-950/40 border-red-700 text-red-400 font-bold" 
                            : "bg-black border-[#222] text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {trait}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-red-900/20 border border-red-700 hover:bg-red-900/40 text-red-400 font-extrabold uppercase text-xs tracking-[0.25em] transition-all cursor-pointer"
                  id="submit-registration-btn"
                >
                  刻录主神经突触 [进入测试]
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* 3. MAIN TERMINAL WORKSPACE GRID layout */
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 sm:p-4 gap-3 sm:gap-4 z-10" id="main-terminal-container">
          
          {/* COLUMN 1: PLAYER DATA & RULES (LEFT RAIL) */}
          <section className="w-full md:w-64 gap-3 sm:gap-4 flex flex-col shrink-0">
            
            {/* Module 1: Survivor Profile Panel */}
            <div className="bg-[#0d0d0d] border border-[#222] p-3 sm:p-4 rounded-sm flex flex-col gap-3 relative border-spooky">
              <div className="flex justify-between items-center border-b border-[#222] pb-1.5">
                <h3 className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">[ 宿主生存档案 ]</h3>
                <span className="text-[8px] bg-[#151515] text-zinc-600 px-1 py-0.2 rounded font-semibold">{profile.id}</span>
              </div>

              <div 
                onClick={() => setViewProfileModal(true)}
                className="w-16 h-16 bg-[#121212] border border-[#333] self-center my-1 relative group cursor-pointer overflow-hidden flex items-center justify-center"
                title="点选扫描脑电图状态"
                id="profile-portrait-box"
              >
                {profile.pollutionValue > 42 ? (
                  <div className="text-red-700 text-center text-xs animate-pulse font-mono font-bold leading-normal">
                    WE <br/> CAN <br/> SEE
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[8px] text-zinc-600 transition-colors group-hover:text-red-400">
                    <Activity size={24} className="mt-1 opacity-50 text-red-800 animate-pulse" />
                    <span>扫描突触</span>
                  </div>
                )}
                {/* Simulated scan line in portrait */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-600/40 animate-bounce top-0 pointer-events-none"></div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-[#1b1b1b] pb-1">
                  <span className="text-zinc-500">代号(名称):</span>
                  <span className="text-red-400 font-extrabold truncate w-32 text-right">{profile.name}</span>
                </div>
                
                {/* Mental health state - SAN value container */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 font-semibold flex items-center gap-1">
                      <ShieldAlert size={12} className="text-blue-500" />
                      精神耐受性 (SAN)
                    </span>
                    <span className={`font-bold ${profile.mentalValue < 30 ? "text-red-500 animate-pulse text-glitch-active" : "text-emerald-400"}`}>
                      {profile.mentalValue}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden border border-[#222]">
                    <div 
                      className={`h-full transition-all duration-500 ${profile.mentalValue < 30 ? "bg-red-700 animate-pulse" : "bg-blue-800"}`} 
                      style={{ width: `${profile.mentalValue}%` }}
                    />
                  </div>
                </div>

                {/* Pollution penetration level - POL value container */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 font-semibold flex items-center gap-1">
                      <Skull size={11} className="text-red-700" />
                      认知污染度 (POL)
                    </span>
                    <span className={`font-bold ${profile.pollutionValue > 40 ? "text-red-500 animate-pulse text-glitch-active font-extrabold shadow-amber-800" : "text-zinc-400"}`}>
                      {profile.pollutionValue}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden border border-[#222]">
                    <div 
                      className={`h-full transition-all duration-500 ${profile.pollutionValue > 50 ? "bg-red-600 progress-bar-animation" : "bg-red-950"}`} 
                      style={{ width: `${profile.pollutionValue}%` }}
                    />
                  </div>
                </div>

                {/* Survivor traits showcase badges */}
                <div className="space-y-1 pt-1.5">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">宿主附带刻录天赋/性征:</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.traits.map(t => (
                      <span key={t} className="text-[9px] bg-[#1a1212] text-red-400/80 px-1.5 py-0.5 rounded border border-red-950">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Micro clean triggers */}
                <div className="flex gap-2 pt-1 border-t border-[#1b1b1b]">
                  <button 
                    onClick={handleMendSanity}
                    className="flex-1 py-1 px-2.5 bg-[#151515] border border-zinc-800 text-[10px] hover:border-red-900 hover:text-red-400 rounded text-center transition-colors uppercase font-bold tracking-tight cursor-pointer"
                    title="在精神不崩坏的同时，极力吸纳深网污染作为止疼机制"
                    id="mend-sanity-btn"
                  >
                    精神清洗
                  </button>
                  <button 
                    onClick={() => {
                      audio.triggerKnock();
                      setProfile(p => ({
                        ...p,
                        name: "已被抹去之人" + Math.floor(Math.random() * 90)
                      }));
                    }}
                    className="py-1 px-2.5 bg-[#121212] border border-zinc-900 hover:border-zinc-700 text-[9px] rounded text-zinc-500 tracking-tight cursor-pointer shrink-0"
                    id="profile-obliterate-btn"
                  >
                    重写代号
                  </button>
                </div>
              </div>
            </div>

            {/* Module 2: Active Dungeon Rules Book Panel (match design styled text-zinc-400 leading-relaxed) */}
            <div className="bg-[#0d0d0d] border border-[#222] p-3 sm:p-4 flex-1 rounded-sm flex flex-col justify-between border-spooky min-h-[220px]">
              <div>
                <div className="flex justify-between items-center border-b border-[#222] pb-1.5">
                  <h3 className="text-[10px] uppercase text-zinc-500 font-extrabold tracking-wider">
                    {glitchText("[ 副本安全协议准则 ]", profile.pollutionValue)}
                  </h3>
                  <span className="text-[9px] text-red-500/80 animate-pulse font-bold tracking-tighter">▼ REGULARITY</span>
                </div>
                
                <div className="mt-2 text-xs text-zinc-500 leading-relaxed max-h-56 overflow-y-auto pr-1">
                  {activeDungeon ? (
                    <div className="space-y-3">
                      <p className="text-[10px] text-zinc-650 italic leading-snug">
                        当前所在祭坛：{activeDungeon.name}。切勿违抗协议法则，认知损坏不可逆。
                      </p>
                      <ul className="space-y-2">
                        {activeRules.map((rule, index) => (
                          <li 
                            key={rule.id}
                            className={`p-1.5 rounded text-[11px] leading-relaxed transition-all ${
                              rule.isGlitch 
                                ? "bg-red-950/20 text-red-400 font-extrabold border-l border-red-700 select-all" 
                                : "text-zinc-300 bg-neutral-900/30 border-l border-zinc-700"
                            }`}
                          >
                            <span className="text-[9px] font-mono text-zinc-500 block">PROTOCOL_RULE_0{index + 1}</span>
                            <span>{rule.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-2">
                      <ShieldAlert className="mx-auto text-zinc-800 animate-pulse" size={24} />
                      <p className="text-[10px] text-zinc-650 leading-relaxed">
                        [未接入评估异常区域]<br/> 
                        请在右侧选择进入任意一门诡秘副本，系统协议规则才将下放。
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Telemetry log trace ticker */}
              <div className="pt-2 border-t border-[#1b1b1b] mt-3">
                <div className="font-mono text-[8px] text-zinc-600 block truncate">
                  INTEGRITY_SCAN_RATIO: {100 - profile.pollutionValue}%
                </div>
                <div className="font-mono text-[8px] text-red-900 block tracking-widest uppercase truncate blink font-bold mt-0.5">
                  WARNING: {anomalyStatus}
                </div>
              </div>

            </div>
          </section>

          {/* COLUMN 2: CENTER TERMINAL / SIMULATED ACTIVE WORKSPACE */}
          <section className="flex-1 flex flex-col bg-[#080808] border border-[#222] relative rounded-sm border-spooky justify-between min-h-[400px]">
            {/* Active workspace header (design matching with encrypted flag) */}
            <div className="p-2 sm:p-3 border-b border-[#222] bg-[#0c0c0c] flex justify-between items-center shrink-0 z-20">
              <span className="text-[10px] font-bold tracking-tight text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                ACTIVE FEED / 生还模拟与聊天终端
              </span>
              <span className="text-[9px] text-green-700 font-semibold tracking-wider uppercase">[ TRACEABLE STACK ]</span>
            </div>

            {/* Central stage contents or active RPG dungeon container */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeDungeon && currentStageId ? (
                /* ACTIVE DUNGEON VIEW PANEL */
                <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-y-auto bg-black/60 scrollbar space-y-4">
                  
                  {/* Active Dungeon Info */}
                  <div className="border border-red-950 bg-red-950/10 p-3 rounded-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-red-500 font-bold tracking-widest uppercase">
                        ☠ 正在渗透：{activeDungeon.name}
                      </span>
                      <span className="text-[9px] bg-red-900/40 text-red-400 px-1 rounded font-mono font-bold">
                        DIFFICULTY: {activeDungeon.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-450 italic mt-0.5">{activeDungeon.subtitle}</p>
                  </div>

                  {/* Stage description text */}
                  <div className="space-y-2 border-l-2 border-red-800 pl-3 sm:pl-4 bg-zinc-900/10 p-3 rounded-r-md">
                    <span className="text-[10px] text-zinc-500 font-mono italic block">
                      【场景：{activeDungeon.stages[currentStageId].title}】
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed font-mono">
                      {activeDungeon.stages[currentStageId].description}
                    </p>
                  </div>

                  {/* Interactive choices buttons lists */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold block tracking-wider">▲ 决策突触响应（点选你的生还行动）:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {activeDungeon.stages[currentStageId].options.map((option, idx) => {
                        const hasRequired = option.requiredItem ? collectedItems.includes(option.requiredItem) : true;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => handleStageOption(option)}
                            disabled={option.requiredItem && !hasRequired}
                            className={`w-full text-left p-3 rounded text-xs border tracking-wide transition-all uppercase font-medium cursor-pointer ${
                              option.requiredItem && !hasRequired
                                ? "bg-zinc-950/50 border-neutral-900 text-zinc-600 cursor-not-allowed"
                                : "bg-[#0d0d0d] border-[#252525] text-zinc-200 hover:bg-neutral-900 hover:border-red-900 active:bg-neutral-950"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span>
                                <span className="text-zinc-600 font-mono mr-2">0{idx + 1}</span>
                                {glitchText(option.text, profile.pollutionValue)}
                              </span>
                              
                              {/* Option weights/costs stats overview */}
                              <div className="flex gap-2 text-[9px] font-mono shrink-0">
                                {option.mentalCost > 0 && (
                                  <span className="text-blue-500 font-extrabold">-SAN {option.mentalCost}</span>
                                )}
                                {option.mentalCost < 0 && (
                                  <span className="text-emerald-400 font-extrabold">+SAN {Math.abs(option.mentalCost)}</span>
                                )}
                                {option.pollutionGain > 0 && (
                                  <span className="text-red-500 font-semibold">+POL {option.pollutionGain}</span>
                                )}
                                {option.requiredItem && (
                                  <span className={hasRequired ? "text-emerald-500" : "text-yellow-600"}>
                                    🔒需要: {option.requiredItem}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Last Action outcomes narrative block */}
                  {stageOutcome && (
                    <div className="bg-[#09090c] border border-dashed border-red-900/30 p-3 rounded-sm space-y-1">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono">[ 生理突触响应叙事 ]</span>
                      <p className="text-xs text-red-300 font-serif leading-relaxed italic">
                        {stageOutcome}
                      </p>
                    </div>
                  )}

                  {/* Dynamic user backpack bag inventory */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-[#1a1a1a]">
                    <div className="flex gap-1.5 items-center">
                      <span className="uppercase">本期存活中收集道具:</span>
                      {collectedItems.length > 0 ? (
                        collectedItems.map(item => (
                          <span key={item} className="bg-zinc-900 border border-zinc-800 text-red-400/90 text-[9px] px-1.5 py-0.5 rounded-sm">
                            🎒 {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-700 italic">空空如也</span>
                      )}
                    </div>
                    <button
                      onClick={handleQuitDungeon}
                      className="text-zinc-600 hover:text-red-400 text-[10px] uppercase font-bold tracking-tighter"
                      id="forfeit-dungeon-btn"
                    >
                      [ 放弃测试逃走 ]
                    </button>
                  </div>

                </div>
              ) : dungeonDead ? (
                /* DEATH DEAD END PANEL SCREEN */
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0a0505] text-center space-y-5 animate-shake-crazy z-30">
                  <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-600 flex items-center justify-center animate-ping">
                    <Skull size={32} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-widest text-red-500 text-glitch-active uppercase">
                      宿主已被认知异常湮灭
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-mono">
                      {stageOutcome || "您的意识突触因无法顺应副本的混乱电位而彻底停搏。整个测试终端在您闭眼的那刻爆发出刺耳的电流鸣叫。别放弃......或许你已不在物理现实。"}
                    </p>
                  </div>
                  <div className="border border-red-900/40 p-3 bg-black rounded max-w-sm font-mono text-[10px] text-red-300 text-left space-y-1">
                    <p className="text-yellow-500 pb-0.5">&gt; [LIMBO_OBLIT] SYSTEM ATTEMPTING NEURAL FLUSH ONCE</p>
                    <p>&gt; UID: {profile.id}</p>
                    <p>&gt; Name: {profile.name}</p>
                    <p>&gt; Trauma warning trigger count: {profile.systemWarningCount}</p>
                    <p>&gt; Status: UNBOUND / 离线</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleResetDungeon}
                      className="px-6 py-2.5 bg-red-950 border border-red-700 text-red-400 hover:bg-red-900/50 hover:text-white rounded cursor-pointer uppercase font-bold tracking-wider text-xs transition-colors"
                      id="restart-current-stage-btn"
                    >
                      再次复苏重塑
                    </button>
                    <button
                      onClick={() => {
                        setDungeonDead(false);
                        setActiveDungeon(null);
                        setCurrentStageId(null);
                      }}
                      className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded cursor-pointer uppercase font-bold tracking-wider text-xs transition-colors"
                      id="quit-limbo-menu-btn"
                    >
                      回滚安全控制台
                    </button>
                  </div>
                </div>
              ) : (
                /* CHATROOM BOARD SCREEN / MAIN WORKSPACE FOR NON-DUNGEONS */
                <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
                  
                  {/* System warnings or ghost whispers ticker banner */}
                  {lastScaryText ? (
                    <div className="bg-red-950/20 border-b border-red-900/40 p-2 text-[11px] text-yellow-500 italic block leading-relaxed relative flex justify-between select-all pr-8">
                      <span className="truncate">👁 [来自未知低语]: {lastScaryText}</span>
                      <button 
                        onClick={() => setLastScaryText("")} 
                        className="absolute right-2 top-2 text-[9px] text-zinc-600 hover:text-zinc-400"
                        id="dismiss-scary-text-btn"
                      >
                        [清除]
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#0b0c10] border-b border-[#1b1b22] px-3 py-1.5 flex justify-between items-center text-[10px]">
                      <span className="text-[#00ff55] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff55] shrink-0"></span>
                        {currentTimeMsg}
                      </span>
                      <span className="text-zinc-600 hidden xs:inline uppercase">Local System Signal: COMPATIBLE</span>
                    </div>
                  )}

                  {/* Primary scroll box inside active chats */}
                  <div className="flex-1 p-3 sm:p-4 space-y-4 overflow-y-auto min-h-[160px] scrollbar">
                    {chatMessages.map((msg) => {
                      const isSystem = msg.role === "system";
                      return (
                        <div 
                          key={msg.id} 
                          className={`space-y-1 max-w-[90%] ${
                            isSystem 
                              ? "mx-auto w-full text-center py-2" 
                              : msg.role === "user" 
                                ? "ml-auto text-right" 
                                : "mr-auto text-left"
                          }`}
                        >
                          <div className={`flex items-center gap-2 text-[10px] ${msg.role === "user" ? "justify-end" : ""}`}>
                            {!isSystem && (
                              <>
                                <span className={`font-bold ${msg.role === "user" ? "text-red-400" : "text-emerald-400"}`}>
                                  {msg.sender}
                                </span>
                                <span className="bg-neutral-900 text-zinc-600 px-1 py-0.2 rounded scale-90">{msg.timestamp}</span>
                              </>
                            )}
                          </div>
                          
                          <div 
                            className={`p-2.5 sm:p-3 text-xs rounded border leading-relaxed ${
                              isSystem 
                                ? "bg-zinc-950/60 border-neutral-900 text-zinc-500 italic block text-center" 
                                : msg.role === "user"
                                  ? "bg-red-950/15 border-red-900/30 text-red-300 inline-block text-left"
                                  : msg.isGlitch
                                    ? "bg-amber-950/20 border-l-2 border-l-yellow-600 border-neutral-900 text-amber-300 font-serif"
                                    : "bg-neutral-900/40 border-zinc-800 text-zinc-300 inline-block"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    {isPendingChatResponse && (
                      <div className="mr-auto max-w-[80%] space-y-1">
                        <span className="text-[10px] text-emerald-400 font-bold">终端正在解码对方信号...</span>
                        <div className="p-3 bg-neutral-950/70 text-zinc-500 text-xs rounded animate-pulse italic loading-dots">
                          正在解压脑突触数据包
                        </div>
                      </div>
                    )}
                    <div ref={messageEndRef} />
                  </div>

                  {/* Spooky chat inputs dock */}
                  <form onSubmit={handleSendMessage} className="border-t border-[#222] bg-[#0c0c0c] p-2 sm:p-3 flex gap-2 shrink-0">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={glitchText("> 输入指令或聊天文字...", profile.pollutionValue)}
                      maxLength={140}
                      className="flex-1 bg-black border border-[#333] px-3 py-2 text-xs outline-none focus:border-red-900 text-zinc-200 focus:text-white"
                      id="terminal-chat-text-input"
                    />
                    <button 
                      type="submit"
                      className="px-5 bg-[#161616] border border-[#333] text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      id="terminal-chat-submit-btn"
                    >
                      <Send size={12} />
                      Send
                    </button>
                  </form>

                </div>
              )}
            </div>

            {/* Chat bottom control triggers / quick shortcuts */}
            <div className="p-2 border-t border-[#111] bg-black flex justify-between items-center text-[9px] text-zinc-600 z-20">
              <span className="scale-95 font-mono">LIMBO_COMM_BRIDGE_ACTIVE</span>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleTriggerAnomaly} 
                  className="hover:text-red-500 hover:underline cursor-pointer"
                  id="simulate-anomaly-shortcut-btn"
                >
                  [ 触发突触崩溃模拟 ]
                </button>
              </div>
            </div>
          </section>

          {/* COLUMN 3: API STACK (SillyTavern integration controls & Saves) */}
          <section className="w-full md:w-72 flex flex-col gap-3 sm:gap-4 shrink-0">
            
            {/* SillyTavern custom connectors / preset config (match design container background `#0d0d0d`) */}
            <div className="bg-[#0d0d0d] border border-[#222] p-3 sm:p-4 rounded-sm flex flex-col gap-3 border-spooky">
              <div className="flex justify-between items-center border-b border-[#222] pb-1.5">
                <h3 className="text-[10px] uppercase text-zinc-500 font-extrabold tracking-wider">[ SillyTavern API 桥接 ]</h3>
                <span className="text-[9px] text-[#00ff55] font-bold tracking-widest animate-pulse">BRIDGE-V2</span>
              </div>

              {/* Endpoint configurations */}
              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 block uppercase tracking-tight">API Endpoint (CORS-Proxy)</label>
                  <input 
                    type="text" 
                    value={stConfig.endpoint}
                    onChange={(e) => setStConfig({...stConfig, endpoint: e.target.value})}
                    placeholder="http://127.0.0.1:5001"
                    className="w-full bg-black border border-[#222] p-2 text-[10px] outline-none text-zinc-300 focus:border-red-900"
                    id="api-endpoint-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 block uppercase tracking-tight">API Secrets / Token Key</label>
                  <input 
                    type="password" 
                    value={stConfig.apiKey}
                    onChange={(e) => setStConfig({...stConfig, apiKey: e.target.value})}
                    placeholder="sk-no-key-required-for-local"
                    className="w-full bg-black border border-[#222] p-2 text-[10px] outline-none text-zinc-400 focus:border-red-900 font-mono"
                    id="api-key-input"
                  />
                </div>

                {/* Direct Connection Toggle */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-neutral-950/80 border border-[#1b1b1b] rounded-sm mt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-tight">浏览器直连模式</span>
                    <span className="text-[8px] text-zinc-600 scale-95 origin-left tracking-tighter">
                      静态托管(Cloudflare)/本地内网API(127.0.0.1)必选
                    </span>
                  </div>
                  <input 
                    type="checkbox"
                    id="direct-connection-toggle"
                    checked={stConfig.directMode || false}
                    onChange={(e) => setStConfig({...stConfig, directMode: e.target.checked})}
                    className="w-3.5 h-3.5 accent-red-900 bg-black border border-[#222] rounded cursor-pointer"
                  />
                </div>

                {/* Model Lists Choice & Load trigger */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-zinc-500 block uppercase tracking-tight">Model Selective</label>
                    <button 
                      type="button"
                      onClick={handleFetchSTModels}
                      disabled={isFetchingModels}
                      className="text-[8px] text-red-500/80 hover:text-red-400 uppercase font-bold tracking-tighter cursor-pointer"
                      id="api-models-fetch-btn"
                    >
                      {isFetchingModels ? "正在加载..." : "[ 拉取远端模型 ]"}
                    </button>
                  </div>
                  
                  <select 
                    value={stConfig.selectedModel}
                    onChange={(e) => setStConfig({...stConfig, selectedModel: e.target.value})}
                    className="w-full bg-[#050505] border border-[#222] p-2 text-[10px] outline-none text-red-500 font-bold font-mono focus:border-red-950"
                    id="api-model-select"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Connection Status and Troubleshooting Hints */}
                {stConnectionError && (
                  <div className="p-2 border border-red-950/60 bg-red-950/25 rounded-sm text-[8px] sm:text-[9px] text-red-400 font-mono space-y-1 block animate-pulse">
                    <div className="flex items-center gap-1 font-bold text-red-500">
                      <span>⚡ 链路探测失败:</span>
                    </div>
                    <p className="leading-normal break-all whitespace-pre-wrap">{stConnectionError}</p>
                    {stConfig.endpoint.includes("127.0.0.1") || stConfig.endpoint.includes("localhost") ? (
                      <p className="text-yellow-600/90 leading-tight">
                        💡 提示：检测到您使用的是本地私有地址。云端服务器无法连通该网络，请务必【勾选上方“浏览器直连模式”】。
                      </p>
                    ) : (
                      <p className="text-zinc-500 leading-tight border-t border-[#2a1313] pt-1 mt-1">
                        提示：静态托管在 Cloudflare 平台时无后端 Express 服务器，任何非直连请求都将失效。请尝试启用上方直连模式，并确认 API 服务器已开启 CORS 跨域许可。
                      </p>
                    )}
                  </div>
                )}

                {/* TavernPreset custom file loader upload interface */}
                <div className="p-2 border border-dashed border-[#222] bg-neutral-950/40 rounded flex flex-col space-y-1 border-spooky">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">▲ 导入 SillyTavern 预设卡</span>
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-[9px] text-zinc-500 truncate">
                      {customCharacter ? `✅ 已载入: ${customCharacter.name}` : "支持标准的 .json 配置。"}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-[8px] hover:bg-zinc-800 text-zinc-300 rounded block cursor-pointer uppercase font-bold shrink-0"
                      id="tavern-preset-trigger-btn"
                    >
                      选择文件
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePresetImport} 
                      accept=".json" 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* API System Override directives state */}
                <div className="flex items-center justify-between pt-1 pb-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">注入认知污染指令</span>
                  <input 
                    type="checkbox" 
                    checked={stConfig.isCustomEnabled}
                    onChange={(e) => setStConfig({...stConfig, isCustomEnabled: e.target.checked})}
                    className="rounded text-red-600 bg-black border-zinc-800 cursor-pointer"
                    id="st-custom-prompt-checkbox"
                  />
                </div>

                {stConfig.isCustomEnabled && (
                  <div className="space-y-1.5 animate-pulse">
                    <label className="text-[9px] text-yellow-600 block uppercase">SYSTEM OVERRIDE DIRECTIVE</label>
                    <textarea 
                      value={stConfig.customSystemPrompt}
                      onChange={(e) => setStConfig({...stConfig, customSystemPrompt: e.target.value})}
                      rows={2}
                      className="w-full bg-black border border-[#222] p-1.5 text-[9px] text-red-400 outline-none rounded border-red-950 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Interactive Quick Copy-Saves SLOT Panel */}
            <div className="bg-[#0d0d0d] border border-[#222] p-3 sm:p-4 rounded-sm flex flex-col gap-3.5 border-spooky flex-1 justify-between min-h-[160px]">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-[#222] pb-1.5">
                  <h3 className="text-[10px] uppercase text-zinc-500 font-extrabold tracking-wider">[ 终端槽位备份 / RECORDS ]</h3>
                  <span className="text-[8px] text-zinc-600 font-mono tracking-tight">SAVE_ENGINE_LOCAL</span>
                </div>

                <div className="space-y-2 text-xs">
                  {["01", "02"].map((slot) => {
                    return (
                      <div key={slot} className="flex items-center justify-between bg-black/40 border border-[#222] p-1.5 rounded-sm">
                        <span className="font-bold text-[10px] text-zinc-500 font-mono">SLOT-{slot}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveGameState(slot)}
                            className="bg-[#121212] border border-zinc-800 text-[9px] py-1 px-2 hover:bg-red-950/20 hover:border-red-900 hover:text-red-400 text-zinc-400 rounded transition-all cursor-pointer font-bold uppercase"
                            id={`save-btn-${slot}`}
                          >
                            [ 刻录存档 ]
                          </button>
                          <button
                            onClick={() => loadGameState(slot)}
                            className="bg-zinc-900 border border-zinc-800 text-[9px] py-1 px-2 hover:bg-neutral-850 hover:text-white text-zinc-400 rounded transition-all cursor-pointer font-bold uppercase"
                            id={`load-btn-${slot}`}
                          >
                            [ 回滚存档 ]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spooky update logs / alerts container */}
              <div className="bg-red-900/10 border border-red-900/30 p-2 text-center rounded">
                <div className="text-red-500 text-lg mb-1 animate-bounce">⚠</div>
                <div className="text-[9px] font-bold text-red-500 mb-0.5 uppercase">SYSTEM ANOMALY WARNING</div>
                <p className="text-[8px] text-red-900/90 italic leading-normal">
                  检测到部分认知协议正在融化。脑电图波形已发生多重反射。请限制每次注视时长。
                </p>
              </div>
            </div>

            {/* List of Dungeons picker (SCP list of portals) when not inside any */}
            {!activeDungeon && (
              <div className="bg-[#0a0a0a] border border-[#222] p-3 sm:p-4 rounded-sm flex flex-col gap-2.5 border-spooky">
                <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider border-b border-[#222] pb-1 block">
                  ▼ 选择渗透诡秘副本 (SCP / ARG)
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(DUNGEONS_PRESETS).map((key) => {
                    const dun = DUNGEONS_PRESETS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => handleEnterDungeon(key)}
                        className="w-full text-left p-2.5 rounded text-xs bg-[#0d0d0d] border border-[#222] hover:bg-neutral-900 hover:border-red-900 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-red-400 block tracking-tight">{dun.name}</span>
                          <span className="text-[9px] text-zinc-500 block truncate w-48">{dun.subtitle}</span>
                        </div>
                        <span className="text-[9px] bg-red-950 text-red-400 px-1 rounded font-bold">
                          {dun.difficulty}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </section>

        </main>
      )}

      {/* 4. FOOTER STATUS BAR (Design Match: Immersive UI styled Footer) */}
      <footer className="h-6 border-t border-[#222] bg-black flex items-center px-4 justify-between shrink-0 z-50 text-[10px] text-zinc-600 font-mono">
        <div className="text-[9px] tracking-wide">SECURE_PROTOCOL_B-9 // RE-INTEG_ACTIVE</div>
        <div className="text-[9px] tracking-widest uppercase italic animate-pulse text-red-800/80 hidden xs:inline">
          DON'T LOOK BEHIND THE CURTAIN // 它正在看着你
        </div>
      </footer>

      {/* 5. OVER INTEGRITY SPECS MODAL DETAILS */}
      {viewProfileModal && (
        <div className="fixed inset-0 bg-black/85 z-[99991] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-red-900/60 p-6 rounded relative border-spooky space-y-4">
            <h3 className="text-sm font-bold text-red-500 border-b border-[#222] pb-2 text-glitch-active flex items-center gap-1.5 uppercase">
              <Activity size={16} /> [ 突触完整性及宿主脑域成像 ]
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <p className="text-[10px] text-zinc-500">此面板反映了您突触重载进度的多次元数据。数值受到您的行为和挂机程度的实时投影。</p>
              
              <div className="grid grid-cols-2 gap-4 bg-black p-3 block border border-[#222] rounded space-y-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block">UID CODEPIN:</span>
                  <span className="font-bold text-red-400">{profile.id}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block">DESIGNATION:</span>
                  <span className="font-bold text-zinc-300">{profile.designation}</span>
                </div>
                <div className="space-y-0.5 pt-1.5">
                  <span className="text-[10px] text-zinc-500 block">SURVIVED LIFE:</span>
                  <span className="font-bold text-yellow-500">{profile.survivalDays} DAY RECT</span>
                </div>
                <div className="space-y-0.5 pt-1.5">
                  <span className="text-[10px] text-zinc-500 block">MADNESS COEFFICIENT:</span>
                  <span className="font-bold text-red-500">{(profile.pollutionValue * 1.29).toFixed(1)}Hz</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase block">认知演变审计轨迹 LOGS</span>
                <div className="h-32 bg-black border border-[#222] p-2 text-[9.5px] text-emerald-400/80 rounded block font-mono overflow-y-auto space-y-1 scrollbar">
                  {profile.memoryLogs.map((log, i) => (
                    <p key={i}>&gt; {log}</p>
                  ))}
                  <p className="text-red-500 animate-pulse">&gt; [LOST_SOUL_1999]: "有些人在镜子里没有后脑勺。"</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[9px] text-zinc-500 italic">SYSTEM REALIGNED SUCCESS</span>
              <button
                onClick={() => setViewProfileModal(false)}
                className="px-4 py-2 bg-red-950 border border-red-800 hover:bg-red-900/30 text-red-400 rounded uppercase font-bold text-xs cursor-pointer tracking-widest transition-colors"
                id="close-profile-modal-btn"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
