export type MaterialCategory = '金属合金' | 'セラミクス' | 'ポリマー' | '複合材料';
export type MaterialStatus = '登録済' | 'レビュー待' | '承認済' | '要修正';

export interface Material {
  id: string;
  name: string;
  cat: MaterialCategory;
  hv: number;
  ts: number;
  el: number;
  pf: number | null;
  el2: number;
  dn: number;
  comp: string;
  batch: string;
  date: string;
  author: string;
  status: MaterialStatus;
  ai: boolean;
  memo: string;
}

export interface MaterialWithScore extends Material {
  score: number;
}

export type ProviderId = 'openai-nano' | 'openai-mini' | 'gemini-flash';

export interface Provider {
  id: ProviderId;
  label: string;
  model: string;
  free?: boolean;
  requiresKey?: boolean;
}

export interface RateInfo {
  remaining: number | null;
  limit: number | null;
}

export interface Toast {
  id: number;
  msg: string;
  type: string;
}

export interface ApiLog {
  id: string;
  ts: number;
  method: string;
  path: string;
  status: number;
  latency: number;
  reqBody: unknown;
  resBody: unknown;
  error?: string;
}

export interface NavItem {
  section?: string;
  id?: string;
  label?: string;
  icon?: string;
  badge?: boolean;
  badgeLabel?: string;
  badgeVariant?: string;
  cls?: string;
  disabled?: boolean;
}

export interface EmbeddingHook {
  status: string;
  embeddings: Record<string, number[]>;
  search: (query: string, topK?: number) => Promise<MaterialWithScore[]>;
  addToIndex: (record: Material) => Promise<void>;
  embCount: number;
}

export interface AIHook {
  call: (prompt: string, system?: string) => Promise<string>;
  provider: string;
  setProvider: (id: string) => void;
  providerDef: Provider;
  providers: Provider[];
  hasOwnKey: boolean;
  ownKey: string;
  setOwnKey: (key: string) => void;
  rateInfo: RateInfo;
}

export interface VoiceHook {
  voiceState: string;
  transcript: string;
  isHandsfree: boolean;
  ttsRate: number;
  setTtsRate: (v: number) => void;
  ttsPitch: number;
  setTtsPitch: (v: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: number;
  setSelectedVoice: (v: number) => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  toggleListening: () => void;
  toggleHandsfree: () => void;
  clearTranscript: () => void;
  isSRAvailable: boolean;
}

export interface AppContextValue {
  db: Material[];
  dispatch: React.Dispatch<DbAction>;
  addToast: (msg: string, type?: string) => void;
  toasts: Toast[];
  theme: string;
}

export type DbAction =
  | { type: 'ADD'; record: Material }
  | { type: 'UPDATE'; record: Material }
  | { type: 'DELETE'; id: string }
  | { type: 'BULK_DELETE'; ids: Set<string> }
  | { type: 'BULK_APPROVE'; ids: Set<string> }
  | { type: 'IMPORT'; records: Material[] };
