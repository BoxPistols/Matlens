/**
 * SimulationPage — 経験式シミュレーション (Phase E Tier 1)
 *
 * 金属材料工学の代表的な経験式を対話的にパラメータ調整してグラフ表示する。
 * 全て「参考値」であり、実測データとの差異を明示する教育・探索ツール。
 */

import { useState, useRef, useEffect, useMemo, useContext } from 'react'
import { Chart, registerables } from 'chart.js'
import { Card, Select, SectionCard, Badge } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import { AppCtx } from '../../context/AppContext'
import type { AppContextValue } from '../../types'
import {
  hallPetch,
  HALL_PETCH_PRESETS,
  larsonMillerParameter,
  jmak,
  ruleOfMixtures,
} from '../../services/empiricalFormulas'

Chart.register(...registerables)

type FormulaId = 'hall-petch' | 'larson-miller' | 'jmak' | 'rom'

const FORMULAS_JA: { id: FormulaId; label: string; desc: string }[] = [
  { id: 'hall-petch',    label: 'Hall-Petch 式',             desc: '結晶粒径 → 降伏応力' },
  { id: 'larson-miller', label: 'Larson-Miller パラメータ',  desc: '温度×時間 → クリープ寿命' },
  { id: 'jmak',          label: 'JMAK 式',                   desc: '時間 → 変態分率' },
  { id: 'rom',           label: '複合則 (ROM)',               desc: '体積分率 → 弾性率' },
]

const FORMULAS_EN: { id: FormulaId; label: string; desc: string }[] = [
  { id: 'hall-petch',    label: 'Hall-Petch Equation',        desc: 'Grain Size → Yield Stress' },
  { id: 'larson-miller', label: 'Larson-Miller Parameter',    desc: 'Temp × Time → Creep Life' },
  { id: 'jmak',          label: 'JMAK Equation',              desc: 'Time → Transformation Fraction' },
  { id: 'rom',           label: 'Rule of Mixtures (ROM)',     desc: 'Volume Fraction → Modulus' },
]

export const SimulationPage = () => {
  const { t, lang } = useContext(AppCtx) as AppContextValue
  const FORMULAS = lang === 'en' ? FORMULAS_EN : FORMULAS_JA
  const [formula, setFormula] = useState<FormulaId>('hall-petch')
  const [preset, setPreset] = useState('iron')

  // Hall-Petch params
  const [grainMin, setGrainMin] = useState(1)
  const [grainMax, setGrainMax] = useState(100)

  // Larson-Miller params
  const [lmTemp, setLmTemp] = useState(973) // 700℃
  const [lmC, setLmC] = useState(20)

  // JMAK params
  const [jmakK, setJmakK] = useState(0.01)
  const [jmakN, setJmakN] = useState(2.5)
  const [jmakTmax, setJmakTmax] = useState(50)

  // ROM params
  const [romEf, setRomEf] = useState(400)
  const [romEm, setRomEm] = useState(70)

  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  const chartData = useMemo(() => {
    const N = 80
    if (formula === 'hall-petch') {
      const hp = HALL_PETCH_PRESETS[preset] ?? HALL_PETCH_PRESETS['iron']!
      const xs: number[] = []
      const ys: number[] = []
      for (let i = 0; i < N; i++) {
        const d = grainMin + (grainMax - grainMin) * (i / (N - 1))
        xs.push(d)
        ys.push(hallPetch(hp.sigma0, hp.k, d))
      }
      return {
        xLabel: t('結晶粒径 d (μm)', 'Grain Size d (μm)'), yLabel: t('降伏応力 σy (MPa)', 'Yield Stress σy (MPa)'),
        datasets: [{ label: `${hp.label}: σy = σ₀ + k/√d`, xs, ys, color: 'var(--accent)' }],
      }
    }
    if (formula === 'larson-miller') {
      const times = [10, 100, 500, 1000, 5000, 10000, 50000, 100000]
      const xs = times.map(t => Math.log10(t))
      const ys = times.map(t => larsonMillerParameter(lmTemp, t, lmC))
      return {
        xLabel: t('log₁₀(時間 h)', 'log₁₀(Time h)'), yLabel: 'LMP = T(C + log t)',
        datasets: [{ label: `T=${lmTemp}K, C=${lmC}`, xs, ys, color: 'var(--warn)' }],
      }
    }
    if (formula === 'jmak') {
      const xs: number[] = []
      const ys: number[] = []
      for (let i = 0; i < N; i++) {
        const t = jmakTmax * (i / (N - 1))
        xs.push(t)
        ys.push(jmak(t, jmakK, jmakN) * 100)
      }
      return {
        xLabel: t('時間 t', 'Time t'), yLabel: t('変態分率 X (%)', 'Transformation Fraction X (%)'),
        datasets: [{ label: `k=${jmakK}, n=${jmakN}`, xs, ys, color: 'var(--ok)' }],
      }
    }
    // ROM
    const xs: number[] = []
    const voigtY: number[] = []
    const reussY: number[] = []
    for (let i = 0; i <= N; i++) {
      const vf = i / N
      xs.push(vf * 100)
      const { voigt, reuss } = ruleOfMixtures(romEf, romEm, vf)
      voigtY.push(voigt)
      reussY.push(reuss)
    }
    return {
      xLabel: t('強化材体積分率 Vf (%)', 'Reinforcement Volume Fraction Vf (%)'), yLabel: t('弾性率 E (GPa)', 'Elastic Modulus E (GPa)'),
      datasets: [
        { label: 'Voigt (等ひずみ上界)', xs, ys: voigtY, color: 'var(--accent)' },
        { label: 'Reuss (等応力下界)', xs, ys: reussY, color: 'var(--warn)' },
      ],
    }
  }, [formula, preset, grainMin, grainMax, lmTemp, lmC, jmakK, jmakN, jmakTmax, romEf, romEm])

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }
    const cssVal = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
    const textLo = cssVal('--text-lo') || '#888'
    const borderFaint = cssVal('--border-faint') || '#ccc'

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: chartData.datasets[0]!.xs.map(x => x.toFixed(1)),
        datasets: chartData.datasets.map(ds => ({
          label: ds.label,
          data: ds.ys,
          borderColor: ds.color,
          backgroundColor: ds.color,
          pointRadius: 2,
          tension: 0.3,
          borderWidth: 2,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: chartData.xLabel, color: textLo }, grid: { color: borderFaint } },
          y: { title: { display: true, text: chartData.yLabel, color: textLo }, grid: { color: borderFaint } },
        },
        plugins: { legend: { labels: { color: textLo, font: { size: 11 } } } },
      },
    })
    return () => {
      chartInstance.current?.destroy()
      chartInstance.current = null
    }
  }, [chartData])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[16px] font-bold text-text-hi flex items-center gap-2">
          <Icon name="spark" size={16} />
          {t('経験式シミュレーション', 'Empirical Formula Simulation')}
        </h1>
        <p className="text-[12px] text-text-lo mt-0.5">
          {t('材料工学の代表的な経験式をインタラクティブに探索。結果は全て参考値であり、実測データとの差異を確認してください。', 'Explore representative empirical formulas in materials science interactively. All results are reference values — verify against experimental data.')}
        </p>
      </div>

      {/* 式の選択 */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">{t('経験式', 'Formula')}</label>
            <Select value={formula} onChange={e => setFormula(e.target.value as FormulaId)}>
              {FORMULAS.map(f => <option key={f.id} value={f.id}>{f.label} — {f.desc}</option>)}
            </Select>
          </div>

          {formula === 'hall-petch' && (
            <div>
              <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">{t('材料プリセット', 'Material Preset')}</label>
              <Select value={preset} onChange={e => setPreset(e.target.value)}>
                {Object.entries(HALL_PETCH_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </div>
          )}
        </div>

        {/* パラメータ入力 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {formula === 'hall-petch' && (
            <>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('粒径下限', 'Min Grain Size')} (μm)</span>
                <input type="number" min={0.1} step={1} value={grainMin} onChange={e => setGrainMin(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('粒径上限', 'Max Grain Size')} (μm)</span>
                <input type="number" min={1} step={10} value={grainMax} onChange={e => setGrainMax(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
            </>
          )}
          {formula === 'larson-miller' && (
            <>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('温度', 'Temperature')} T (K)</span>
                <input type="number" min={300} step={50} value={lmTemp} onChange={e => setLmTemp(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('定数', 'Constant')} C</span>
                <input type="number" min={10} max={30} step={1} value={lmC} onChange={e => setLmC(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
            </>
          )}
          {formula === 'jmak' && (
            <>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('速度定数', 'Rate Constant')} k</span>
                <input type="number" min={0.001} step={0.005} value={jmakK} onChange={e => setJmakK(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('Avrami 指数', 'Avrami Exponent')} n</span>
                <input type="number" min={1} max={4} step={0.5} value={jmakN} onChange={e => setJmakN(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('最大時間', 'Max Time')}</span>
                <input type="number" min={1} step={10} value={jmakTmax} onChange={e => setJmakTmax(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
            </>
          )}
          {formula === 'rom' && (
            <>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('強化材', 'Reinforcement')} Ef (GPa)</span>
                <input type="number" min={1} step={10} value={romEf} onChange={e => setRomEf(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
              <label className="text-[11px]">
                <span className="text-text-lo block mb-0.5">{t('マトリックス', 'Matrix')} Em (GPa)</span>
                <input type="number" min={1} step={5} value={romEm} onChange={e => setRomEm(+e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] font-mono" />
              </label>
            </>
          )}
        </div>
      </Card>

      {/* グラフ */}
      <Card className="p-4">
        <div style={{ height: 380 }}>
          <canvas ref={chartRef} />
        </div>
      </Card>

      {/* 数式解説 */}
      <SectionCard title={t("数式・前提条件", "Formulas & Assumptions")}>
        {formula === 'hall-petch' && (
          <div className="text-[12px] text-text-md leading-relaxed">
            <p className="font-mono mb-1">σ<sub>y</sub> = σ<sub>0</sub> + k / √d</p>
            <p>結晶粒径 d が小さいほど粒界が多く転位運動が妨げられ降伏応力が上昇する。</p>
            <p className="text-text-lo mt-1">適用範囲: d {'>'} 0.1 μm。ナノ結晶では逆 Hall-Petch が起こる。</p>
            <p className="text-text-lo">出典: E.O. Hall (1951), N.J. Petch (1953)</p>
          </div>
        )}
        {formula === 'larson-miller' && (
          <div className="text-[12px] text-text-md leading-relaxed">
            <p className="font-mono mb-1">LMP = T × (C + log<sub>10</sub> t)</p>
            <p>異なる温度・時間条件のクリープデータを 1 本のマスターカーブに統合する。C は材料定数 (一般に 20)。</p>
            <p className="text-text-lo mt-1">用途: Ni 基超合金・耐熱鋼の高温寿命評価。</p>
            <p className="text-text-lo">出典: Larson & Miller (1952)</p>
          </div>
        )}
        {formula === 'jmak' && (
          <div className="text-[12px] text-text-md leading-relaxed">
            <p className="font-mono mb-1">X(t) = 1 - exp(-k × t<sup>n</sup>)</p>
            <p>再結晶分率、ベイナイト変態、析出反応の時間依存性を S 字カーブでモデル化。</p>
            <p className="text-text-lo mt-1">n: 核生成・成長メカニズムに依存 (1〜4)。k: 温度依存の反応速度。</p>
            <p className="text-text-lo">出典: Avrami (1939-1941), Johnson & Mehl (1939)</p>
          </div>
        )}
        {formula === 'rom' && (
          <div className="text-[12px] text-text-md leading-relaxed">
            <p className="font-mono mb-1">Voigt: E = V<sub>f</sub>E<sub>f</sub> + (1-V<sub>f</sub>)E<sub>m</sub></p>
            <p className="font-mono mb-1">Reuss: 1/E = V<sub>f</sub>/E<sub>f</sub> + (1-V<sub>f</sub>)/E<sub>m</sub></p>
            <p>複合材料の弾性率上下界。実測値は通常この間に入る。</p>
            <p className="text-text-lo mt-1">用途: 繊維強化複合材、粒子分散強化材の初期設計。</p>
          </div>
        )}
      </SectionCard>

      <Card className="p-3 border-dashed" style={{ borderColor: 'var(--border-faint)' }}>
        <div className="flex items-center gap-2">
          <Badge variant="amber">{t('参考値', 'Reference')}</Badge>
          <p className="text-[11px] text-text-lo">
            {t('全ての計算結果は理論式に基づく参考値です。実際の材料特性は組成・加工・熱処理条件に強く依存するため、必ず実測データで検証してください。', 'All results are theoretical reference values. Actual material properties depend on composition, processing, and heat treatment — always verify with experimental data.')}
          </p>
        </div>
      </Card>
    </div>
  )
}
