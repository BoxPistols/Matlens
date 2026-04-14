import type {
  Experiment,
  ExperimentAlert,
  SensorSample,
  DownsampledPoint,
} from '../types';
import { downsample, detectSpike } from '../utils/sampling';

// ─── モック実験データ ───

export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    experimentId: 'EXP-20260415-001',
    experimentName: '耐熱合金_同時5軸切削テスト',
    experimentNameEn: 'Heat-resistant Alloy 5-axis Cutting Test',
    status: 'in_progress',
    progressPercentage: 45,
    createdAt: '2026-04-15T09:00:00Z',
    phase1Setup: {
      material: 'Inconel 718',
      materialEn: 'Inconel 718',
      toolType: 'エンドミル φ10 超硬 TiAlN',
      toolTypeEn: 'Endmill φ10 Carbide TiAlN',
      spindleSpeedRpm: 12000,
      feedRateMmMin: 150,
      depthOfCutMm: 0.5,
      coolant: 'MQL (微量潤滑)',
      coolantEn: 'MQL (Minimum Quantity Lubrication)',
    },
    phase2Process: {
      cuttingForceN: 850.5,
      vibrationG: 2.1,
      temperatureC: 320,
      spindleLoadPct: 68,
      alerts: [],
    },
    phase3Result: {
      surfaceRoughnessUm: null,
      residualStressMpa: null,
      toolWearMm: null,
      inspectionImages: [],
      notes: '',
    },
  },
  {
    experimentId: 'EXP-20260414-003',
    experimentName: 'Ti-6Al-4V 仕上げ加工条件探索',
    experimentNameEn: 'Ti-6Al-4V Finish Machining Parameter Search',
    status: 'completed',
    progressPercentage: 100,
    createdAt: '2026-04-14T13:30:00Z',
    phase1Setup: {
      material: 'Ti-6Al-4V',
      materialEn: 'Ti-6Al-4V',
      toolType: 'ボールエンドミル φ6 CBN',
      toolTypeEn: 'Ball Endmill φ6 CBN',
      spindleSpeedRpm: 8000,
      feedRateMmMin: 200,
      depthOfCutMm: 0.2,
      coolant: '水溶性切削液 5%',
      coolantEn: 'Water-soluble Cutting Fluid 5%',
    },
    phase2Process: {
      cuttingForceN: 420,
      vibrationG: 1.2,
      temperatureC: 180,
      spindleLoadPct: 42,
      alerts: [],
    },
    phase3Result: {
      surfaceRoughnessUm: 0.8,
      residualStressMpa: -350,
      toolWearMm: 0.12,
      inspectionImages: [],
      notes: '目標面粗さ Ra 1.0μm 以下を達成。工具摩耗は許容範囲内。',
    },
  },
  {
    experimentId: 'EXP-20260413-002',
    experimentName: 'CFRP/Ti 積層ドリル加工',
    experimentNameEn: 'CFRP/Ti Stack Drilling',
    status: 'aborted',
    progressPercentage: 72,
    createdAt: '2026-04-13T10:00:00Z',
    phase1Setup: {
      material: 'CFRP/Ti-6Al-4V 積層',
      materialEn: 'CFRP/Ti-6Al-4V Stack',
      toolType: 'ダイヤモンドコートドリル φ8',
      toolTypeEn: 'Diamond Coated Drill φ8',
      spindleSpeedRpm: 3000,
      feedRateMmMin: 60,
      depthOfCutMm: 12,
      coolant: '外部給油 ストレート油',
      coolantEn: 'External Straight Oil',
    },
    phase2Process: {
      cuttingForceN: 1200,
      vibrationG: 5.8,
      temperatureC: 450,
      spindleLoadPct: 92,
      alerts: [
        {
          id: 'ALT-001',
          type: 'absolute',
          severity: 'critical',
          timestamp: '2026-04-13T11:45:30Z',
          message: 'スピンドル負荷 90% 超過 — 緊急停止推奨',
          messageEn: 'Spindle load exceeded 90% — emergency stop recommended',
          value: 92,
          threshold: 90,
        },
      ],
    },
    phase3Result: {
      surfaceRoughnessUm: null,
      residualStressMpa: null,
      toolWearMm: 0.45,
      inspectionImages: [],
      notes: '加工中にスピンドル負荷超過で中断。工具交換後に再試行予定。',
    },
  },
];

// ─── リアルタイムストリーム用シミュレーション ───

/** 再現可能な擬似乱数 (mulberry32) — テスト安定性のため */
function seededRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 正弦波 + ノイズ + スパイクのセンサーデータを生成 */
export function generateSensorStream(
  durationSec: number,
  sampleRateHz: number,
  opts?: {
    baseForce?: number;
    baseVibration?: number;
    baseTemperature?: number;
    baseSpindleLoad?: number;
    spikeAtSec?: number[];
    seed?: number;
  },
): SensorSample[] {
  const {
    baseForce = 800,
    baseVibration = 2.0,
    baseTemperature = 300,
    baseSpindleLoad = 65,
    spikeAtSec = [],
    seed = 42,
  } = opts ?? {};

  const rand = seededRng(seed);
  const total = durationSec * sampleRateHz;
  const samples: SensorSample[] = [];
  const spikeSet = new Set(spikeAtSec.map(s => Math.round(s * sampleRateHz)));

  for (let i = 0; i < total; i++) {
    const t = i / sampleRateHz;
    const noise = () => (rand() - 0.5) * 2;
    const isSpike = spikeSet.has(i);

    // 緩やかな工具摩耗トレンド（時間経過で切削抵抗が微増）
    const wearFactor = 1 + (t / durationSec) * 0.15;

    samples.push({
      t,
      force: baseForce * wearFactor + Math.sin(t * 12) * 30 + noise() * 20
        + (isSpike ? baseForce * 0.6 : 0),
      vibration: baseVibration + Math.sin(t * 8) * 0.3 + noise() * 0.15
        + (isSpike ? baseVibration * 2.5 : 0),
      temperature: baseTemperature + Math.sin(t * 0.5) * 10 + noise() * 3
        + (t / durationSec) * 30,
      spindleLoad: baseSpindleLoad + Math.sin(t * 2) * 5 + noise() * 2
        + (isSpike ? 25 : 0),
    });
  }
  return samples;
}

/** ベースライン（過去の成功データ）を生成 */
export function generateBaseline(
  durationSec: number,
  sampleRateHz: number,
): DownsampledPoint[] {
  const raw = generateSensorStream(durationSec, sampleRateHz, {
    baseForce: 780,
    baseVibration: 1.8,
    baseTemperature: 290,
    baseSpindleLoad: 60,
    spikeAtSec: [],
    seed: 123,
  });
  return downsample(raw, sampleRateHz);
}

/**
 * シミュレーション済みの加工実験データ一式を返す
 * - 60秒分のセンサーデータ（100Hz → 6000点）
 * - 1秒窓で間引き → 60点の描画データ
 * - ベースライン60点
 * - アラート自動検出
 */
export function createExperimentSimulation() {
  const durationSec = 60;
  const sampleRate = 100;
  const windowSize = sampleRate; // 1秒窓

  const raw = generateSensorStream(durationSec, sampleRate, {
    baseForce: 800,
    baseVibration: 2.0,
    baseTemperature: 300,
    baseSpindleLoad: 65,
    spikeAtSec: [15.5, 38.2, 52.7],
  });

  const downsampled = downsample(raw, windowSize);
  const baseline = generateBaseline(durationSec, sampleRate);

  // アラート自動検出
  const alerts: ExperimentAlert[] = [];
  const forceValues = downsampled.map(p => p.forcePeak);

  for (let i = 0; i < downsampled.length; i++) {
    const p = downsampled[i]!;
    const bl = baseline[i];

    // 絶対値超過（切削抵抗 1200N 以上）
    if (p.forcePeak > 1200) {
      const alertId = `ALT-ABS-${i}`;
      alerts.push({
        id: alertId,
        type: 'absolute',
        severity: 'critical',
        timestamp: new Date(Date.now() - (durationSec - p.t) * 1000).toISOString(),
        message: `切削抵抗 ${p.forcePeak.toFixed(0)}N — 安全リミット 1200N 超過`,
        messageEn: `Cutting force ${p.forcePeak.toFixed(0)}N — exceeded safety limit 1200N`,
        value: p.forcePeak,
        threshold: 1200,
      });
      downsampled[i] = { ...p, alertId };
    }
    // スパイク検出（直前5点平均から50%以上の跳ね上がり）
    else if (detectSpike(forceValues, i, 5, 0.5)) {
      const alertId = `ALT-SPK-${i}`;
      alerts.push({
        id: alertId,
        type: 'spike',
        severity: 'warning',
        timestamp: new Date(Date.now() - (durationSec - p.t) * 1000).toISOString(),
        message: `切削抵抗の急激な上昇を検知 (${p.forcePeak.toFixed(0)}N)`,
        messageEn: `Sudden cutting force spike detected (${p.forcePeak.toFixed(0)}N)`,
        value: p.forcePeak,
      });
      downsampled[i] = { ...p, alertId };
    }
    // ベースライン乖離（±30%）
    else if (bl && Math.abs(p.forceRms - bl.forceRms) / bl.forceRms > 0.3) {
      const alertId = `ALT-BL-${i}`;
      alerts.push({
        id: alertId,
        type: 'baseline',
        severity: 'info',
        timestamp: new Date(Date.now() - (durationSec - p.t) * 1000).toISOString(),
        message: `切削抵抗がベースラインから乖離 (RMS ${p.forceRms.toFixed(0)}N vs 基準 ${bl.forceRms.toFixed(0)}N)`,
        messageEn: `Cutting force deviated from baseline (RMS ${p.forceRms.toFixed(0)}N vs ref ${bl.forceRms.toFixed(0)}N)`,
        value: p.forceRms,
        threshold: bl.forceRms,
      });
      downsampled[i] = { ...p, alertId };
    }
  }

  return { downsampled, baseline, alerts, raw };
}
