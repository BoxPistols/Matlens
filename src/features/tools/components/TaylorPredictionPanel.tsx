// Taylor 工具寿命予測パネル。
// 工具ごとの過去プロセス (Vc, 到達 VB と累積距離) から V と T を復元し、
// fitTaylor で (n, C) を推定。現行 Vc での予測寿命と ±1σ / ±2σ
// 信頼区間 + 残寿命（現在の累積使用時間からの残り）を表示する。

import { useMemo } from 'react';
import type { CuttingProcess, Tool } from '@/domain/types';
import {
  defaultParamsForTool,
  estimateRemainingLife,
  fitTaylor,
  predictToolLifeWithBands,
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
    // Taylor 式の T は「新品 → 寿命到達までの累積時間」であり、単一プロセスの
    // 加工時間ではない。このため対象工具の全プロセスを時系列で並べ、各プロセス
    // 終了時点までの累積加工時間を T として扱う。
    // さらに VB が 0.1mm 以上到達した時点（＝寿命指標が取れる段階）を
    // 回帰サンプルとする。
    const allForTool = processes
      .filter((p) => p.toolId === tool.id)
      .sort((a, b) => a.performedAt.localeCompare(b.performedAt));

    let cumulativeTime = 0;
    const sample: SamplePoint[] = [];
    for (const p of allForTool) {
      const V = p.condition.cuttingSpeed;
      // このプロセスの加工時間 [min] = 距離 [mm] / (Vc [m/min] × 1000)
      const dT = V > 0 ? p.cuttingDistanceMm / (V * 1000) : 0;
      cumulativeTime += dT;
      if (p.toolWearVB !== null && p.toolWearVB >= 0.1 && V > 0) {
        sample.push({
          V,
          T: cumulativeTime,
          Vb: p.toolWearVB,
          distance: p.cuttingDistanceMm,
          processId: p.id,
        });
      }
    }
    const relevant = allForTool.filter(
      (p) => p.toolWearVB !== null && p.toolWearVB >= 0.1
    );

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

  const usedParams = fit ?? { n: defaults.n, C: defaults.C, r2: 0, sigmaLogV: 0, points: [] };
  const prediction = predictToolLifeWithBands(referenceVc, usedParams, usedParams.sigmaLogV);
  const predictedT = prediction.T;
  const predictedDistanceMm = predictedT * referenceVc * 1000;
  // 現在の累積使用時間 = samples の最終 T
  const cumulativeMin = samples.length > 0 ? samples[samples.length - 1]!.T : 0;
  const remaining = estimateRemainingLife(predictedT, cumulativeMin, referenceVc);

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
        {usedParams.sigmaLogV > 0 && (
          <>
            <dt className="text-[var(--text-lo)]">±1σ 区間 T</dt>
            <dd className="font-mono text-right">
              {prediction.T_lower1.toFixed(1)} – {prediction.T_upper1.toFixed(1)} min
            </dd>
            <dt className="text-[var(--text-lo)]">±2σ 区間 T</dt>
            <dd className="font-mono text-right">
              {prediction.T_lower2.toFixed(1)} – {prediction.T_upper2.toFixed(1)} min
            </dd>
          </>
        )}
        <dt className="text-[var(--text-lo)]">累積使用時間</dt>
        <dd className="font-mono text-right">{cumulativeMin.toFixed(1)} min</dd>
        <dt className="text-[var(--text-lo)]">残寿命（推定）</dt>
        <dd
          className="font-mono text-right"
          style={{
            color:
              remaining.usageRatio >= 1
                ? 'var(--err, #dc2626)'
                : remaining.usageRatio >= 0.8
                  ? 'var(--warn, #d97706)'
                  : undefined,
          }}
        >
          {remaining.remainingMin.toFixed(1)} min ／{' '}
          {remaining.remainingDistanceMm.toLocaleString(undefined, {
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
