// 切削プロセスドメイン
// 転削・旋削・穴あけ等の加工条件、工具マスタ、時系列測定データを扱う。
// 試験片 (Specimen) がどのように切り出され、どんな条件で機械加工されたかを辿る。

import type { AuditInfo, ID, ISODateTime } from './common';

export type ToolType =
  | 'end_mill' // エンドミル
  | 'face_mill' // フライスカッター / 正面フライス
  | 'ball_mill' // ボールエンドミル
  | 'insert_turning' // 旋削用インサート
  | 'insert_milling' // ミーリング用インサート
  | 'drill' // ドリル
  | 'reamer' // リーマ
  | 'tap'; // タップ

export type ToolMaterial =
  | 'HSS' // 高速度鋼
  | 'carbide' // 超硬合金
  | 'coated_carbide' // 被覆超硬
  | 'cermet' // サーメット
  | 'ceramic' // セラミクス
  | 'CBN' // 立方晶窒化ホウ素
  | 'PCD'; // 多結晶ダイヤモンド

export type CoolantType =
  | 'dry' // 乾式
  | 'flood' // クーラント注水（水溶性）
  | 'mist' // ミスト
  | 'MQL' // Minimum Quantity Lubrication (セミドライ)
  | 'cryogenic'; // 極低温（LN2 / LCO2）

export type MachiningOperation =
  | 'turning' // 旋削
  | 'milling_face' // 正面削り
  | 'milling_peripheral' // 側面削り
  | 'milling_5axis' // 同時 5 軸
  | 'drilling'
  | 'boring'
  | 'reaming'
  | 'tapping'
  | 'grinding';

/**
 * 工具マスタ。
 * コーティング・形状・刃数などを保持し、加工プロセスから参照される。
 */
export interface Tool extends AuditInfo {
  id: ID;
  code: string; // 型番 (例: EM-12-4F-AlTiN)
  name: string; // 日本語名
  nameEn: string;
  type: ToolType;
  material: ToolMaterial;
  coating: string | null; // 例: AlTiN / TiAlN / DLC
  diameter: number; // mm (インサートの場合は刃先 R）
  fluteCount: number | null; // 刃数（インサートは null）
  rakeAngle: number | null; // すくい角 (deg)
  reliefAngle: number | null; // 逃げ角 (deg)
  helixAngle: number | null; // ねじれ角 (deg、エンドミル用)
  cornerRadius: number | null; // コーナー半径 (mm)
  maxDepthOfCut: number | null; // 推奨最大切込み深さ (mm)
  applicableMaterials: ID[]; // 推奨母材（Material.id）
  vendor: string | null;
  description: string | null;
}

export interface CreateToolInput {
  code: string;
  name: string;
  nameEn: string;
  type: ToolType;
  material: ToolMaterial;
  coating?: string;
  diameter: number;
  fluteCount?: number;
  rakeAngle?: number;
  reliefAngle?: number;
  helixAngle?: number;
  cornerRadius?: number;
  maxDepthOfCut?: number;
  applicableMaterials?: ID[];
  vendor?: string;
  description?: string;
}

export type UpdateToolInput = Partial<CreateToolInput>;

/**
 * 加工条件。
 * 切削条件そのもの（切削速度・送り・切込み等）。
 * Test.condition（温度・雰囲気中心）とは別概念として切り出す。
 */
export interface CuttingCondition {
  /** 切削速度 Vc (m/min) */
  cuttingSpeed: number;
  /** 送り速度 fz / f (mm/rev もしくは mm/tooth) */
  feed: number;
  feedUnit: 'mm/rev' | 'mm/tooth' | 'mm/min';
  /** 切込み深さ ap (mm) — 軸方向 */
  depthOfCut: number;
  /** 切削幅 ae (mm) — 径方向（旋削のときは null） */
  widthOfCut: number | null;
  /** 主軸回転数 (rpm) — Vc と diameter から計算可能だが明示的に保持 */
  spindleSpeed: number;
  /** 冷却方式 */
  coolant: CoolantType;
  /** 上記以外のパラメータ（ツールパス識別子・姿勢など） */
  notes: string | null;
}

/**
 * 時系列測定サンプル。
 * 切削抵抗・加速度（びびり）・音響・温度等の波形データ。
 * 高頻度サンプリングされたものを 1 プロセスに複数本紐づける。
 */
export interface WaveformSample {
  id: ID;
  processId: ID;
  channel: 'force_x' | 'force_y' | 'force_z' | 'vibration' | 'acoustic' | 'temperature';
  unit: string; // 例: 'N' / 'g' / 'Pa' / '℃'
  sampleRateHz: number;
  /**
   * 生波形。ブラウザ上で FFT / 可視化する想定。
   * バンドル肥大化を避けるため、モックでは 1 本あたり 128〜512 点に抑える。
   */
  values: number[];
  /** 取得開始時刻（加工開始からの offset ms も notes で保持可） */
  startedAt: ISODateTime;
}

/**
 * 加工プロセス。
 * 「この試験片はどの工具・どの条件で切り出されたか」を表現する単位。
 * Specimen とは 1 : N（1 試験片に複数工程）で紐づく。
 */
export interface CuttingProcess extends AuditInfo {
  id: ID;
  /** 工程コード（例: CUT-2026-0001） */
  code: string;
  /** 関連する試験片（nullable: 単独の加工実験もあり得るため） */
  specimenId: ID | null;
  /** 母材の Material.id */
  materialId: ID;
  /** 使用工具 */
  toolId: ID;
  /** 加工種別 */
  operation: MachiningOperation;
  /** 切削条件 */
  condition: CuttingCondition;
  /** 加工時間 (s) */
  machiningTimeSec: number;
  /** 切削距離 (mm) — Taylor 工具寿命式で使う */
  cuttingDistanceMm: number;
  /** 表面粗さ Ra (µm) — 後工程測定で埋まることが多い */
  surfaceRoughnessRa: number | null;
  /** 工具摩耗 VB (mm) — 終了時点の測定値 */
  toolWearVB: number | null;
  /** びびり振動の検出（true=発生、false=なし、null=未評価） */
  chatterDetected: boolean | null;
  /** 代表的な切削抵抗 Fc (N) */
  cuttingForceFc: number | null;
  /** 代表的な切削温度 (℃) */
  cuttingTemperatureC: number | null;
  /** 紐づく波形サンプル（ID 参照、本体は waveforms テーブル） */
  waveformIds: ID[];
  /** 加工オペレータ */
  operatorId: ID;
  /** 工作機械（任意、個体識別が必要なら文字列） */
  machine: string | null;
  /** 実施日時 */
  performedAt: ISODateTime;
  notes: string | null;
}

export interface CreateCuttingProcessInput {
  code?: string;
  specimenId?: ID | null;
  materialId: ID;
  toolId: ID;
  operation: MachiningOperation;
  condition: CuttingCondition;
  machiningTimeSec: number;
  cuttingDistanceMm: number;
  surfaceRoughnessRa?: number;
  toolWearVB?: number;
  chatterDetected?: boolean;
  cuttingForceFc?: number;
  cuttingTemperatureC?: number;
  operatorId: ID;
  machine?: string;
  performedAt: ISODateTime;
  notes?: string;
}

export type UpdateCuttingProcessInput = Partial<CreateCuttingProcessInput>;
