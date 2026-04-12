export type MaterialCategory = '金属合金' | 'セラミクス' | 'ポリマー' | '複合材料';
export type MaterialStatus = '登録済' | 'レビュー待' | '承認済' | '要修正';

/** データの出所を示す Provenance 情報 */
export type Provenance = 'instrument' | 'manual' | 'ai' | 'simulation';

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
  // ─── Phase A 拡張フィールド (optional — 既存データとの後方互換性を保つ) ───
  /** データの出所 — 装置計測 / 手入力 / AI 推定 / シミュレーション */
  provenance?: Provenance;
  /** 金属組織の記述 (組織観察結果テキスト) */
  microstructure?: string;
  /** 試験方法 (JIS/ASTM 規格番号 等) */
  testMethod?: string;
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
  search: (query: string, topK?: number) => Promise<MaterialWithScore[]>;
  addToIndex: (record: Material) => Promise<void>;
  embCount: number;
  engine: string;
}

export type AIErrorCode =
  | 'UNAUTHORIZED'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'UNKNOWN';

export interface AICallError {
  code: AIErrorCode;
  message: string;
}

export interface StreamCallbacks {
  onChunk: (delta: string) => void;
  signal?: AbortSignal;
}

export interface AIHook {
  call: (prompt: string, system?: string) => Promise<string>;
  callStream: (
    prompt: string,
    callbacks: StreamCallbacks,
    system?: string
  ) => Promise<string>;
  provider: string;
  setProvider: (id: string) => void;
  providerDef: Provider;
  providers: Provider[];
  hasOwnKey: boolean;
  ownKey: string;
  setOwnKey: (key: string) => void;
  rateInfo: RateInfo;
  lastError: AICallError | null;
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
  lang: 'ja' | 'en';
  setLang: (l: 'ja' | 'en') => void;
  /** シンプル翻訳ヘルパー: lang に応じて ja / en 文字列を返す */
  t: (ja: string, en: string) => string;
}

export type DbAction =
  | { type: 'ADD'; record: Material }
  | { type: 'UPDATE'; record: Material }
  | { type: 'DELETE'; id: string }
  | { type: 'BULK_DELETE'; ids: Set<string> }
  | { type: 'BULK_APPROVE'; ids: Set<string> }
  | { type: 'IMPORT'; records: Material[] };
