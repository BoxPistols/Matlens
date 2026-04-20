// Kc 切削抵抗見積パネル。
// 選択プロセスの条件から Kienzle モデルで Fc / P / MRR を推定し、
// 実測値 (process.cuttingForceFc) と並べて表示する。
// 現場での「なぜこの値？」議論の起点になる見積ウィジェット。

import { useMemo } from 'react';
import type { CuttingProcess, Tool } from '@/domain/types';
import { estimateTurning, spindlePowerKW, cuttingForceFc, kienzleFor, MRR_milling } from '../utils/kcForceModel';

export interface KcEstimatePanelProps {
  process: CuttingProcess;
  tool: Tool | null | undefined;
}

export const KcEstimatePanel = ({ process, tool }: KcEstimatePanelProps) => {
  const estimate = useMemo(() => {
    const { cuttingSpeed, feed, depthOfCut, widthOfCut, spindleSpeed } =
      process.condition;
    const kienzle = kienzleFor(process.materialId);

    // 旋削は estimateTurning、ミーリング系は fz × teeth で近似
    if (process.operation === 'turning') {
      const r = estimateTurning(
        process.materialId,
        cuttingSpeed,
        feed,
        depthOfCut
      );
      return {
        Fc_N: r.Fc_N,
        P_kW: r.P_kW,
        MRR: r.MRR_cm3_per_min,
        kc11: r.params.kc11,
        mc: r.params.mc,
      };
    }
    // ミーリング: fz × teeth × rpm = vf
    const teeth = tool?.fluteCount ?? 2;
    const vf_mm_min = feed * teeth * spindleSpeed;
    const ae = widthOfCut ?? depthOfCut;
    const D = tool?.diameter ?? 10;
    // 平均切りくず厚（ミーリング、側面削り近似）:
    //   h_m ≈ fz · √(ae/D)   (engagement < 180°, Sandvik/Altintas 公式)
    //   全没入のときは h_m ≈ fz (ae/D=1 相当)。
    // これを使わず fz をそのまま h にすると、側面削りで Fc を過大評価する。
    const engagement = Math.min(1, Math.max(0.05, ae / D));
    const h_mean = feed * Math.sqrt(engagement);
    const Fc = cuttingForceFc({ h: h_mean, b: depthOfCut }, kienzle);
    const P = spindlePowerKW(Fc, cuttingSpeed);
    const MRR = MRR_milling(vf_mm_min, ae, depthOfCut);
    return {
      Fc_N: Fc,
      P_kW: P,
      MRR: MRR,
      kc11: kienzle.kc11,
      mc: kienzle.mc,
    };
  }, [process, tool]);

  const actualFc = process.cuttingForceFc;
  const delta =
    actualFc !== null && estimate.Fc_N > 0
      ? ((actualFc - estimate.Fc_N) / estimate.Fc_N) * 100
      : null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-[var(--text-lo)]">
        <span>Kienzle 見積</span>
        <span className="font-mono">
          Kc1.1={estimate.kc11} / mc={estimate.mc}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[12px]">
        <dt className="text-[var(--text-lo)]">予測 Fc</dt>
        <dd className="font-mono text-right">{estimate.Fc_N.toFixed(0)} N</dd>
        {actualFc !== null && (
          <>
            <dt className="text-[var(--text-lo)]">実測 Fc</dt>
            <dd
              className="font-mono text-right"
              style={{
                color:
                  delta !== null && Math.abs(delta) > 30
                    ? 'var(--err, #dc2626)'
                    : delta !== null && Math.abs(delta) > 15
                      ? 'var(--warn, #f59e0b)'
                      : 'var(--ok, #22c55e)',
              }}
            >
              {actualFc.toFixed(0)} N
              {delta !== null && ` (${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%)`}
            </dd>
          </>
        )}
        <dt className="text-[var(--text-lo)]">主軸動力 P</dt>
        <dd className="font-mono text-right">{estimate.P_kW.toFixed(2)} kW</dd>
        <dt className="text-[var(--text-lo)]">MRR</dt>
        <dd className="font-mono text-right">
          {estimate.MRR.toFixed(1)} cm³/min
        </dd>
      </dl>
      {delta !== null && Math.abs(delta) > 30 && (
        <div className="text-[10px] text-[var(--err,#dc2626)]">
          モデルと実測の乖離 &gt; 30%。工具摩耗・実効 h / b・加工硬化 の影響を確認。
        </div>
      )}
    </div>
  );
};
