// Taylor 工具寿命予測パネル。
// 工具ごとの過去プロセス (Vc, 到達 VB と累積距離) から V と T を復元し、
// fitTaylor で (n, C) を推定。現行 Vc での予測寿命を表示する。

import { useMemo } from 'react';
import type { CuttingProcess, Tool } from '@/domain/types';
import {
  defaultParamsForTool,
  fitTaylor,
  toolLifeMin,
} from '../../cutting/utils/taylorTool';
import { VB_CRITERIA } from '../../cutting/utils/standards';

export interface TaylorPredictionPanelProps {
  tool: Tool;
  processes: CuttingProcess[];
  /** 予測に使う基準 Vc (m/min)。省略時は直近プロセスの Vc を使う。 */
  targetVc?: number;
}

interface SamplePoint {
  V: number;
  T: number;
  Vb: number;
  distance: number;
  processId: string;
}

export const TaylorPredictionPanel = ({
  tool,
  processes,
  targetVc,
}: TaylorPredictionPanelProps) => {
  const { samples, fit, defaults, referenceVc } = useMemo(() => {
    // 対象工具のプロセスのみ抽出し、VB が 0.1mm 以上到達したものを「寿命テスト点」として扱う。
    // 各プロセスの加工時間 T = cuttingDistanceMm / (Vc[m/min] * 1000) * 60 分換算
    // で単純化（Vc は進行中一定と仮定）。
    const relevant = processes
      .filter((p) => p.toolId === tool.id && p.toolWearVB !== null && p.toolWearVB >= 0.1)
      .sort((a, b) => a.performedAt.localeCompare(b.performedAt));

    const sample: SamplePoint[] = relevant.map((p) => {
      const V = p.condition.cuttingSpeed;
      // 1 プロセスの加工時間 [min] = 距離 [mm] / (Vc [m/min] × 1000)
      const T = V > 0 ? p.cuttingDistanceMm / (V * 1000) : 0;
      return {
        V,
        T,
        Vb: p.toolWearVB ?? 0,
        distance: p.cuttingDistanceMm,
        processId: p.id,
      };
    });

    const fitInput = sample
      .filter((s) => s.V > 0 && s.T > 0)
      .map((s) => ({ V: s.V, T: s.T }));
    const fitResult = fitTaylor(fitInput);
    const defaultP = defaultParamsForTool(tool.material);
    const ref =
      targetVc ??
      (relevant.length > 0
        ? relevant[relevant.length - 1]!.condition.cuttingSpeed
        : 100);

    return {
      samples: sample,
      fit: fitResult,
      defaults: defaultP,
      referenceVc: ref,
    };
  }, [tool, processes, targetVc]);

  const usedParams = fit ?? { n: defaults.n, C: defaults.C, r2: 0, points: [] };
  const predictedT = toolLifeMin(referenceVc, usedParams);
  const predictedDistanceMm = predictedT * referenceVc * 1000;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-[var(--text-lo)]">
        <span>Taylor 工具寿命</span>
        <span className="font-mono">
          VB 限界 {VB_CRITERIA.finishing.average} mm 相当
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[12px]">
        <dt className="text-[var(--text-lo)]">データ源</dt>
        <dd className="text-right">
          {fit
            ? `実測 ${fit.points.length} 点から回帰 (R²=${fit.r2.toFixed(3)})`
            : `材種デフォルト (${tool.material})`}
        </dd>
        <dt className="text-[var(--text-lo)]">n</dt>
        <dd className="font-mono text-right">{usedParams.n.toFixed(3)}</dd>
        <dt className="text-[var(--text-lo)]">C</dt>
        <dd className="font-mono text-right">{usedParams.C.toFixed(1)}</dd>
        <dt className="text-[var(--text-lo)]">基準 Vc</dt>
        <dd className="font-mono text-right">
          {referenceVc.toFixed(1)} m/min
        </dd>
        <dt className="text-[var(--text-lo)]">予測寿命 T</dt>
        <dd className="font-mono text-right">{predictedT.toFixed(1)} min</dd>
        <dt className="text-[var(--text-lo)]">予測切削距離</dt>
        <dd className="font-mono text-right">
          {predictedDistanceMm.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}{' '}
          mm
        </dd>
      </dl>
      {!fit && (
        <div className="text-[10px] text-[var(--text-lo)]">
          実測寿命点が不足（VB≥0.1mm のプロセス 2 件以上で回帰開始）。
          材種デフォルト値を使用中。
        </div>
      )}
      {fit && fit.r2 < 0.7 && (
        <div className="text-[10px] text-[var(--warn,#f59e0b)]">
          R² = {fit.r2.toFixed(2)} と低め。条件ばらつき・測定不確かさを疑い、回帰結果の参考度は控えめに。
        </div>
      )}
      <div className="text-[10px] text-[var(--text-lo)] leading-relaxed">
        Taylor 式 V · T^n = C。n は工具材種依存 ({tool.material} の標準値 {defaults.n.toFixed(3)})。
        実測点が増えるほど回帰精度が上がる。
      </div>

      {samples.length > 0 && (
        <details className="mt-1 text-[11px]">
          <summary className="cursor-pointer text-[var(--text-lo)]">
            実測 (V, T) 点 {samples.length} 件
          </summary>
          <ul className="mt-1 font-mono text-[10px] text-[var(--text-md)] leading-relaxed">
            {samples.slice(0, 8).map((s) => (
              <li key={s.processId}>
                V={s.V.toFixed(0)} m/min, T={s.T.toFixed(2)} min (VB=
                {s.Vb.toFixed(2)} mm, {s.distance.toLocaleString()} mm)
              </li>
            ))}
            {samples.length > 8 && (
              <li className="text-[var(--text-lo)]">... 他 {samples.length - 8} 件</li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
};
