/**
 * BayesianOptPage — 1D ガウス過程回帰によるベイズ最適化
 *
 * 金属材料 DB から特徴量 (x) と目的変数 (y) を選び、次の実験候補点を提案する。
 * GP で予測平均と不確実性を推定し、Expected Improvement 獲得関数を最大化する点を
 * "次に試すべき実験" として提示する。
 */

import { useMemo, useRef, useEffect, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { Badge, Card, Select, SectionCard } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import type { Material } from '../../types'
import {
  fitGP,
  suggestNext,
  normalize,
  denormalize,
  DEFAULT_HYPER,
} from '../../services/bayesianOpt'

Chart.register(...registerables)

interface BayesianOptPageProps {
  db: Material[]
}

type FeatureKey = 'hv' | 'ts' | 'el' | 'dn'

const FEATURE_LABELS: Record<FeatureKey, { label: string; unit: string }> = {
  hv: { label: '硬度',     unit: 'HV' },
  ts: { label: '引張強さ', unit: 'MPa' },
  el: { label: '弾性率',   unit: 'GPa' },
  dn: { label: '密度',     unit: 'g/cm³' },
}

const N_GRID = 100

export const BayesianOptPage = ({ db }: BayesianOptPageProps) => {
  const [xFeature, setXFeature] = useState<FeatureKey>('el')
  const [yFeature, setYFeature] = useState<FeatureKey>('ts')

  // ─── データ抽出 + 正規化 + GP fit ───
  const analysis = useMemo(() => {
    if (xFeature === yFeature) return null
    const points = db
      .map(m => ({ x: m[xFeature] ?? 0, y: m[yFeature] ?? 0, id: m.id, name: m.name }))
      .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))

    if (points.length < 3) return null

    const rawX = points.map(p => p.x)
    const rawY = points.map(p => p.y)
    const { normalized: normX, min: xMin, max: xMax } = normalize(rawX)
    const { normalized: normY, min: yMin, max: yMax } = normalize(rawY)

    // ハイパーパラメータは正規化済み空間 [0, 1] で妥当な値を選ぶ
    const hyper = { ...DEFAULT_HYPER, lengthScale: 0.15, variance: 0.3, noise: 0.02 }
    const model = fitGP(normX, normY, hyper)

    // グリッドスキャン (正規化空間)
    const { best, grid } = suggestNext(model, 0, 1, N_GRID)

    return {
      points,
      rawX, rawY,
      xMin, xMax, yMin, yMax,
      model, grid, best,
    }
  }, [db, xFeature, yFeature])

  // ─── Chart.js 描画 ───
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || !analysis) return
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }

    const cssVal = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
    const accent = cssVal('--accent') || '#0a6657'
    const warn = cssVal('--warn') || '#c38000'
    const textLo = cssVal('--text-lo') || '#888'
    const borderFaint = cssVal('--border-faint') || '#ccc'

    // グリッドを実スケールに戻す
    const gridX = analysis.grid.map(g => denormalize(g.x, analysis.xMin, analysis.xMax))
    const meanY = analysis.grid.map(g => denormalize(g.mean, analysis.yMin, analysis.yMax))
    // 不確実性バンド (±2σ)
    const upperY = analysis.grid.map(g => denormalize(g.mean + 2 * g.std, analysis.yMin, analysis.yMax))
    const lowerY = analysis.grid.map(g => denormalize(Math.max(g.mean - 2 * g.std, 0), analysis.yMin, analysis.yMax))

    const bestXReal = denormalize(analysis.best.x, analysis.xMin, analysis.xMax)
    const bestYReal = denormalize(analysis.best.mean, analysis.yMin, analysis.yMax)

    chartInstance.current = new Chart(chartRef.current, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: '不確実性 +2σ',
            data: gridX.map((x, i) => ({ x, y: upperY[i]! })),
            borderColor: accent + '40',
            backgroundColor: accent + '20',
            pointRadius: 0,
            showLine: true,
            fill: '+1',
            tension: 0.3,
            order: 3,
          },
          {
            label: '不確実性 -2σ',
            data: gridX.map((x, i) => ({ x, y: lowerY[i]! })),
            borderColor: accent + '40',
            backgroundColor: accent + '20',
            pointRadius: 0,
            showLine: true,
            fill: false,
            tension: 0.3,
            order: 3,
          },
          {
            label: 'GP 平均',
            data: gridX.map((x, i) => ({ x, y: meanY[i]! })),
            borderColor: accent,
            backgroundColor: accent,
            pointRadius: 0,
            showLine: true,
            tension: 0.3,
            borderWidth: 2,
            order: 2,
          },
          {
            label: '観測データ',
            data: analysis.points.map(p => ({ x: p.x, y: p.y })),
            borderColor: accent,
            backgroundColor: accent,
            pointRadius: 4,
            pointHoverRadius: 6,
            showLine: false,
            order: 1,
          },
          {
            label: '提案点 (EI 最大)',
            data: [{ x: bestXReal, y: bestYReal }],
            borderColor: warn,
            backgroundColor: warn,
            pointRadius: 8,
            pointStyle: 'rectRot',
            showLine: false,
            order: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: `${FEATURE_LABELS[xFeature].label} (${FEATURE_LABELS[xFeature].unit})`,
              color: textLo,
            },
            grid: { color: borderFaint },
          },
          y: {
            title: {
              display: true,
              text: `${FEATURE_LABELS[yFeature].label} (${FEATURE_LABELS[yFeature].unit})`,
              color: textLo,
            },
            grid: { color: borderFaint },
          },
        },
        plugins: {
          legend: {
            labels: { color: textLo, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const px = ctx.parsed.x ?? 0
                const py = ctx.parsed.y ?? 0
                return `${ctx.dataset.label}: (${px.toFixed(2)}, ${py.toFixed(2)})`
              },
            },
          },
        },
      },
    })
    return () => {
      chartInstance.current?.destroy()
      chartInstance.current = null
    }
  }, [analysis, xFeature, yFeature])

  return (
    <div className="flex flex-col gap-4">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold text-text-hi flex items-center gap-2">
            <Icon name="spark" size={16} />
            ベイズ最適化 — 次実験候補の提案
          </h1>
          <p className="text-[12px] text-text-lo mt-0.5">
            ガウス過程回帰 (RBF カーネル) で目的変数をモデル化し、
            Expected Improvement 獲得関数を最大化する点を「次に試すべき実験」として提案します。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="ai">EXPERIMENTAL</Badge>
        </div>
      </div>

      {/* コントロール */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">特徴変数 (X軸)</label>
            <Select value={xFeature} onChange={e => setXFeature(e.target.value as FeatureKey)}>
              {Object.entries(FEATURE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ({v.unit})</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">目的変数 (Y軸 — 最大化)</label>
            <Select value={yFeature} onChange={e => setYFeature(e.target.value as FeatureKey)}>
              {Object.entries(FEATURE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ({v.unit})</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* グラフ or エラー */}
      {!analysis ? (
        <Card className="p-6 text-center">
          <p className="text-[13px] text-text-md">
            {xFeature === yFeature
              ? 'X 軸と Y 軸に異なる変数を選択してください。'
              : 'データ点が不足しています (3 点以上必要)。'}
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div style={{ height: 420 }}>
              <canvas ref={chartRef} />
            </div>
          </Card>

          {/* 提案パネル */}
          <SectionCard title="提案された次実験点">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
                <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">{FEATURE_LABELS[xFeature].label}</div>
                <div className="text-[15px] font-bold text-text-hi font-mono">
                  {denormalize(analysis.best.x, analysis.xMin, analysis.xMax).toFixed(2)}
                </div>
                <div className="text-[10px] text-text-lo mt-0.5">{FEATURE_LABELS[xFeature].unit}</div>
              </div>
              <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
                <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">予測 {FEATURE_LABELS[yFeature].label}</div>
                <div className="text-[15px] font-bold text-text-hi font-mono">
                  {denormalize(analysis.best.mean, analysis.yMin, analysis.yMax).toFixed(2)}
                </div>
                <div className="text-[10px] text-text-lo mt-0.5">{FEATURE_LABELS[yFeature].unit}</div>
              </div>
              <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
                <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">不確実性 ±σ</div>
                <div className="text-[15px] font-bold font-mono" style={{ color: 'var(--warn)' }}>
                  ±{(analysis.best.std * (analysis.yMax - analysis.yMin)).toFixed(2)}
                </div>
                <div className="text-[10px] text-text-lo mt-0.5">{FEATURE_LABELS[yFeature].unit}</div>
              </div>
              <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
                <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">EI (獲得関数)</div>
                <div className="text-[15px] font-bold font-mono" style={{ color: 'var(--accent)' }}>
                  {analysis.best.ei.toFixed(4)}
                </div>
                <div className="text-[10px] text-text-lo mt-0.5">期待改善値</div>
              </div>
            </div>
          </SectionCard>
        </>
      )}

      {/* 技術ノート */}
      <Card className="p-3 border-dashed" style={{ borderColor: 'var(--border-faint)' }}>
        <p className="text-[11px] font-bold text-text-lo mb-1">アルゴリズム</p>
        <p className="text-[11px] text-text-md leading-relaxed">
          <strong>ガウス過程回帰 (GP)</strong>: RBF カーネル
          <code className="font-mono text-[10px] px-1">k(x,x') = σ² exp(−(x−x')²/2ℓ²)</code> で
          任意の 2 点間の相関を定義し、既知データから任意点の予測平均と分散を閉形式で求める。
          内部では Cholesky 分解で <code className="font-mono text-[10px]">K⁻¹y</code> を安定的に計算。
          <br />
          <strong>Expected Improvement (EI)</strong>: 現在の最良値を更新する期待値
          <code className="font-mono text-[10px] px-1">EI(x) = (μ−f*)·Φ(z) + σ·φ(z)</code> を最大化する点を選ぶ。
          不確実性が高い領域 (探索) と平均が高い領域 (活用) のバランスを取る。
          <br />
          <strong>制限</strong>: 現状は 1D 版 MVP。ハイパーパラメータは固定値 (ℓ=0.15, σ²=0.3, noise=0.02)。
          多次元最適化・Thompson Sampling・制約付き最適化は今後の課題。
        </p>
      </Card>
    </div>
  )
}
