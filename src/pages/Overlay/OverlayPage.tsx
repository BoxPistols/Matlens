/**
 * OverlayPage — シミュレーション vs 実績値の比較 Overlay (issue #2 ③)
 * Hall-Petch 予測 と DB の実測値をスライダーでブレンド比較する。
 * ※ プロトタイプ: Hall-Petch パラメータは材料プリセット値
 */
import { useState, useMemo, useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { Card, Badge, Select, SectionCard } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import type { Material } from '../../types'
import { hallPetch, HALL_PETCH_PRESETS } from '../../services/empiricalFormulas'

Chart.register(...registerables)

interface OverlayPageProps { db: Material[] }

type FeatureKey = 'hv' | 'ts' | 'el'
const FEATURE_LABELS: Record<FeatureKey, { label: string; unit: string }> = {
  hv: { label: '硬度 (Vickers)', unit: 'HV' },
  ts: { label: '引張強さ',       unit: 'MPa' },
  el: { label: '弾性率',         unit: 'GPa' },
}
const CAT_TO_PRESET: Record<string, string> = {
  '金属合金': 'iron', 'セラミクス': 'titanium', 'ポリマー': 'aluminum', '複合材料': 'copper',
}

export const OverlayPage = ({ db }: OverlayPageProps) => {
  const [selectedId, setSelectedId] = useState(db[0]?.id ?? '')
  const [feature, setFeature] = useState<FeatureKey>('hv')
  const [blendPct, setBlendPct] = useState(50)
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInst = useRef<Chart | null>(null)

  const selected = db.find(m => m.id === selectedId)
  const grainSizes = useMemo(() => Array.from({ length: 20 }, (_, i) => Math.round(10 + i * 10)), [])

  const prediction = useMemo(() => {
    if (!selected) return grainSizes.map(() => 0)
    const preset = HALL_PETCH_PRESETS[CAT_TO_PRESET[selected.cat] ?? 'iron']!
    return grainSizes.map(d => {
      const sigma = hallPetch(preset.sigma0, preset.k, d)
      if (feature === 'hv') return sigma / 3
      if (feature === 'ts') return sigma
      return preset.sigma0 / 10
    })
  }, [selected, grainSizes, feature])

  const actual = useMemo(() => {
    if (!selected) return grainSizes.map(() => 0)
    const val = selected[feature] ?? 0
    return grainSizes.map((_, i) => val + (Math.sin(i * 0.8) * val * 0.04))
  }, [selected, feature, grainSizes])

  const blended = useMemo(() =>
    prediction.map((p, i) => p + ((actual[i]! - p) * blendPct / 100)),
  [prediction, actual, blendPct])

  useEffect(() => {
    if (!chartRef.current || !selected) return
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null }
    const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
    const textLo = css('--text-lo') || '#888'
    const borderFaint = css('--border-faint') || '#ccc'

    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: grainSizes,
        datasets: [
          { label: '予測 (Hall-Petch)', data: prediction, borderColor: '#5a9ae0', borderDash: [6,3], pointRadius: 2, borderWidth: 2, tension: 0.4 },
          { label: '実測データ', data: actual, borderColor: '#00c896', pointRadius: 2, borderWidth: 2, tension: 0.4 },
          { label: `ブレンド (予測${100-blendPct}% : 実測${blendPct}%)`, data: blended, borderColor: '#f0b040', fill: false, pointRadius: 3, borderWidth: 2.5, tension: 0.4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: '結晶粒径 d (μm)', color: textLo }, grid: { color: borderFaint } },
          y: { title: { display: true, text: `${FEATURE_LABELS[feature].label} (${FEATURE_LABELS[feature].unit})`, color: textLo }, grid: { color: borderFaint } },
        },
        plugins: { legend: { labels: { color: textLo, font: { size: 11 } } } },
      },
    })
    return () => { chartInst.current?.destroy(); chartInst.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, feature, prediction, actual, blended, grainSizes])

  useEffect(() => {
    if (!chartInst.current) return
    const ds = chartInst.current.data.datasets[2]
    if (ds) { ds.data = blended; ds.label = `ブレンド (予測${100-blendPct}% : 実測${blendPct}%)` }
    chartInst.current.update('none')
  }, [blendPct, blended])

  const actualVal = selected ? (selected[feature] ?? 0) : 0
  const predMid = prediction[10] ?? 0
  const deviation = predMid > 0 ? ((actualVal - predMid) / predMid * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[16px] font-bold text-text-hi flex items-center gap-2">
          <Icon name="similar" size={16} />
          シミュレーション vs 実績値 (Overlay)
        </h1>
        <p className="text-[12px] text-text-lo mt-0.5">
          Hall-Petch 予測とDB実測値を重ねて比較。スライダーで予測↔実測をブレンド表示。
          <Badge variant="amber" className="ml-2 text-[10px]">モックデータ</Badge>
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">材料</label>
            <Select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {db.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">比較特性</label>
            <Select value={feature} onChange={e => setFeature(e.target.value as FeatureKey)}>
              {Object.entries(FEATURE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">
              ブレンド: 予測{100-blendPct}% ↔ 実測{blendPct}%
            </label>
            <input type="range" min={0} max={100} value={blendPct} onChange={e => setBlendPct(+e.target.value)}
              className="w-full accent-[var(--warn)]" aria-label="予測と実測のブレンド比率" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div style={{ height: 320 }}>
          <canvas ref={chartRef} role="img" aria-label="予測vs実測オーバーレイグラフ" />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard title="予測値 (Hall-Petch 中央)">
          <p className="text-[20px] font-bold font-mono text-text-hi">{predMid.toFixed(0)}</p>
          <p className="text-[11px] text-text-lo">{FEATURE_LABELS[feature].unit}</p>
        </SectionCard>
        <SectionCard title="実測値 (DB)">
          <p className="text-[20px] font-bold font-mono text-text-hi">{actualVal}</p>
          <p className="text-[11px] text-text-lo">{FEATURE_LABELS[feature].unit}</p>
        </SectionCard>
        <SectionCard title="乖離率">
          <p className={`text-[20px] font-bold font-mono ${Math.abs(deviation) > 15 ? 'text-[var(--warn)]' : 'text-[var(--ok)]'}`}>
            {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
          </p>
        </SectionCard>
      </div>

      <Card className="p-3 border-dashed" style={{ borderColor: 'var(--border-faint)' }}>
        <p className="text-[11px] text-text-lo">
          ※ 予測は Hall-Petch 式をカテゴリ別プリセットで計算した参考値。
          実際のデジタルツインでは FEM / MD シミュレーション結果と連携します。
        </p>
      </Card>
    </div>
  )
}
