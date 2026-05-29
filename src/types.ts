export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  designation: string; // e.g., "SURVIVOR-7729"
  traits: string[];
  mentalValue: number; // 0 to 100
  pollutionValue: number; // 0 to 100
  survivalDays: number;
  memoryLogs: string[];
  systemWarningCount: number;
}

export interface Message {
  id: string;
  sender: string;
  role: 'user' | 'assistant' | 'system' | 'limbo_hacker';
  avatar?: string;
  text: string;
  timestamp: string;
  isGlitch?: boolean;
}

export interface Rule {
  id: string;
  text: string;
  isGlitch: boolean;
  truthText?: string; // The original rule before pollution
}

export interface DungeonStage {
  id: string;
  title: string;
  description: string;
  options: DungeonOption[];
}

export interface DungeonOption {
  text: string;
  nextStageId?: string; // empty means dead end or completion
  mentalCost: number;
  pollutionGain: number;
  outcomeText: string;
  isDeath?: boolean;
  gainItem?: string;
  requiredItem?: string;
}

export interface Dungeon {
  id: string;
  name: string;
  subtitle: string;
  originalRules: string[];
  lore: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'IMPOSSIBLE' | 'ERROR';
  stages: { [key: string]: DungeonStage };
  initialStageId: string;
}

export interface SillyTavernConfig {
  endpoint: string;
  apiKey: string;
  selectedModel: string;
  customSystemPrompt: string;
  isCustomEnabled: boolean;
  characterPresetFile?: string; // JSON contents
}

export interface SavedInstance {
  profile: PlayerProfile;
  activeDungeonId: string | null;
  activeStageId: string | null;
  logs: string[];
  unlockedDungeons: string[];
}
