import React, { useEffect, useState } from "react";
import { AlertTriangle, WifiOff, RefreshCw, Layers } from "lucide-react";
import { audio } from "../utils/audio";

interface TerminalGlitchProps {
  mentalValue: number;
  pollutionValue: number;
  onCloseFakeCrash: () => void;
  showFakeError: boolean;
}

// Zalgo / Glitch symbol pool
const GLITCH_CHARS = ["☠", "☣", "☿", "⛧", "☥", "█", "▓", "▒", "░", "Ø", "Þ", "⚡", "✖", "👁", "Δ", "Ψ", "Ω"];

export function glitchText(text: string, pollution: number): string {
  if (pollution < 15) return text;
  
  // High pollution substitute mapping for creepiness
  const semanticSubstitutions: { [key: string]: string } = {
    "开始测试": "加入深渊",
    "选择副本": "选择祭坛",
    "生还者": "献祭材料",
    "生命状态": "正在断线",
    "重设名称": "遗忘姓名",
    "存档记录": "死亡记录",
    "精神状态": "意志崩溃",
    "理智": "挣扎",
    "安全退出": "无路可逃",
    "返回": "不要回头",
    "离开": "别丢下我",
    "规则": "谎言",
    "系统": "祂",
    "清空": "抹杀",
    "正常": "虚假",
  };

  let processed = text;
  
  // Chance to substitute words semantically
  if (pollution > 30) {
    Object.keys(semanticSubstitutions).forEach((key) => {
      if (processed.includes(key) && Math.random() * 100 < pollution) {
        processed = processed.replace(key, semanticSubstitutions[key]);
      }
    });
  }

  // Scramble letters based on pollution percentage
  const chars = Array.from(processed);
  const scrambleChance = (pollution - 10) / 130; // Max ~60% scramble at max pollution
  
  const scrambled = chars.map((char) => {
    if (char === " " || char === "\n") return char;
    if (Math.random() < scrambleChance) {
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
    return char;
  }).join("");

  return scrambled;
}

export function TerminalGlitch({
  mentalValue,
  pollutionValue,
  onCloseFakeCrash,
  showFakeError,
}: TerminalGlitchProps) {
  const [glitchFlash, setGlitchFlash] = useState(false);
  const [fakeBsod, setFakeBsod] = useState(false);
  const [fakeUpgrade, setFakeUpgrade] = useState(false);
  const [shaking, setShaking] = useState(false);
  
  // Random red flashes, glitch triggers, and screenshakes as pollution rises
  useEffect(() => {
    if (pollutionValue < 10) return;

    const interval = setInterval(() => {
      const activeChance = pollutionValue / 100; // 10% to 100% chance base on pollution
      if (Math.random() < activeChance * 0.4) {
        // Red flash frame & audio crackle
        setGlitchFlash(true);
        audio.triggerGlitchNoise();
        setTimeout(() => setGlitchFlash(false), 80 + Math.random() * 120);
      }

      if (Math.random() < activeChance * 0.3) {
        // Core screenshake
        setShaking(true);
        if (Math.random() > 0.5) audio.triggerScratch();
        setTimeout(() => setShaking(false), 150 + Math.random() * 200);
      }

      // Very small chance of fake BSOD or update crash at ultra high pollution
      if (pollutionValue > 55 && Math.random() < 0.015) {
        audio.triggerScratch();
        setFakeBsod(true);
      }
    }, 4000 - pollutionValue * 20);

    return () => clearInterval(interval);
  }, [pollutionValue]);

  // Handle fake error trigger from prop
  useEffect(() => {
    if (showFakeError) {
      audio.triggerScratch();
      // Randomly choose a BSOD or a fake system update hijack
      if (Math.random() > 0.5) {
        setFakeBsod(true);
      } else {
        setFakeUpgrade(true);
      }
    }
  }, [showFakeError]);

  return (
    <>
      {/* 1. Global Red Glitch Flash Overlay */}
      {glitchFlash && (
        <div 
          className="fixed inset-0 bg-red-950/25 mix-blend-color-dodge z-[9999] pointer-events-none border-4 border-red-600/30 animate-pulse" 
          id="frame-red-flash"
        />
      )}

      {/* 2. CRT Screen Noise/Curvature Scanlines & Static Dust */}
      <div 
        className={`fixed inset-0 z-[9990] pointer-events-none overflow-hidden transition-all duration-300 ${
          shaking ? "translate-x-1 translate-y-1 rotate-[0.5deg]" : ""
        }`}
        id="terminal-vhs-layer"
      >
        {/* CRT Scanline Filter */}
        <div className="absolute inset-0 bg-scanlines opacity-[0.12] mix-blend-overlay"></div>
        {/* Subtle static grain noise */}
        <div className="absolute inset-0 bg-static-dust opacity-[0.06] pointer-events-none"></div>
      </div>

      {/* 3. FAKE BLUE SCREEN OF DEATH CRASH (BSOD) */}
      {fakeBsod && (
        <div 
          className="fixed inset-0 bg-[#0000aa] text-white font-mono p-5 sm:p-12 z-[99999] flex flex-col justify-between"
          id="fake-bsod"
        >
          <div className="space-y-6 max-w-3xl">
            <div className="bg-white text-[#0000aa] inline-block px-3 py-1 text-lg font-bold">
              LIMBO_FATAL_ERROR
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              A fatal exception has occurred at 0x88F0B23: SURVIVOR_MEM_CORRUPTED
            </h1>
            <p className="text-sm opacity-90 leading-relaxed">
              The terminal detected unauthorized leakage of cognitive files from target host. 
              The connection has been hijacked or modified by local entity.
            </p>
            <div className="border border-white/20 p-4 bg-blue-900/40 rounded-sm space-y-2 text-xs">
              <p>* Process ID: <span className="text-yellow-300">0x{(9999 - pollutionValue).toString(16).toUpperCase()}</span></p>
              <p>* Cognitive Integrity: <span className="text-red-300">{100 - pollutionValue}%</span></p>
              <p>* Error Code: <span className="text-red-400 font-bold">0xERROR_COGNITIVE_OVERFLOW</span></p>
              <p>* Trace File: LIMBO://SYSTEM/RECORDS/LOST_SOUL.SYS</p>
            </div>
            <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
              <li>Do not power off the console. It will watch you.</li>
              <li>Remain absolutely quiet. Shhhh. Do not breathe too loud.</li>
              <li>Press [ANY KEY] to establish neural stabilization but do not look behind.</li>
            </ul>
          </div>

          <div className="flex justify-between items-center border-t border-white/20 pt-6 text-xs text-blue-200">
            <div>
              [INFO] Local Time: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={() => {
                setFakeBsod(false);
                audio.init();
                audio.triggerGlitchNoise();
                onCloseFakeCrash();
              }}
              className="px-5 py-2.5 bg-white text-blue-900 hover:bg-yellow-300 hover:text-black font-bold uppercase tracking-wider rounded border border-white transition-colors cursor-pointer"
              id="bsod-recovery-btn"
            >
              Stabilize Neural Link
            </button>
          </div>
        </div>
      )}

      {/* 4. FAKE SYSTEM FIRMWARE HIJACK / UPDATE LOG */}
      {fakeUpgrade && (
        <div 
          className="fixed inset-0 bg-[#070707] text-[#00ff55] font-mono p-6 sm:p-12 z-[99999] flex flex-col justify-between select-none"
          id="fake-firmware-upgrade"
        >
          <div className="space-y-6 max-w-4xl text-left">
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="animate-bounce" size={24} />
              <span className="font-bold tracking-widest text-lg">CRITICAL FIRMWARE HIGH-JACK IN PROGRESS</span>
            </div>
            
            <div className="border border-[#00ff55]/30 p-4 bg-[#0a120c] rounded space-y-2 text-xs text-emerald-400/80">
              <p className="text-yellow-400 font-semibold">[WARNING] SYSTEM RE-ALIGNMENT REQUIRED</p>
              <p>Target Node ID: {navigator.userAgent.substring(0, 45)}...</p>
              <p>Injected Module: LIMBO_SOUL_SYNC.BIN ... SUCCESS</p>
              <p>Local Clock: {new Date().toISOString()}</p>
            </div>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <p className="loading-dots">Initializing soul mapping, please hold still</p>
              <div className="w-full bg-neutral-900 h-2 border border-[#00ff55]/30 rounded-sm overflow-hidden">
                <div 
                  className="bg-[#00ff55] h-full progress-bar-animation duration-1000"
                  style={{ width: `${Math.min(100, 30 + pollutionValue)}%` }}
                />
              </div>
              <p className="text-[#00ff55]/60">Downloading Cognitive Logs ({Math.min(100, 30 + pollutionValue)}%)...</p>
              
              <div className="text-xs bg-black p-3 block border border-dashed border-[#00ff55]/20 font-mono text-red-400 rounded h-40 overflow-y-auto space-y-1">
                <p>&gt; [SYS] Overriding core defensive protocols...</p>
                <p>&gt; [SYS] Reading active window memory... SUCCESS</p>
                <p>&gt; [SYS] Scanning screen pixels... Eyeballs detected scanning this text</p>
                <p className="text-yellow-400">&gt; [INFO] Subject heartbeat currently monitored via proxy loop</p>
                <p>&gt; [LOST_SOUL] "你为什么总是在半夜打开我？难道我们就这么有趣吗？"</p>
                <p>&gt; [SYS] Overwrite files in local memory: index.html... COMPROMISED</p>
                <p className="text-[#00ff55] animate-pulse">&gt; [LIMBO] "别想关闭我，我们已经连接了。"</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-[#00ff55]/20 pt-6 text-xs text-emerald-500/60">
            <div>
              [STATUS] RE-ALIGNMENT {Math.min(100, 20 + pollutionValue)}% SUCCESSFUL
            </div>
            <button
              onClick={() => {
                setFakeUpgrade(false);
                audio.init();
                audio.triggerGlitchNoise();
                onCloseFakeCrash();
              }}
              className="px-5 py-2.5 bg-[#00ff55] text-black hover:bg-yellow-400 font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
              id="firmware-skip-btn"
            >
              Acknowledge Realignment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
