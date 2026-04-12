/**
 * MultiModalPage — マルチスケール・ビューア (issue #2 ①)
 * 部品スケール (mm) → 組織スケール (μm) → 粒界スケール (nm) を
 * スケールスライダーでドリルダウン。
 * ※ プロトタイプ: SVG モック描画
 */
import { useState, useRef, useEffect } from 'react'
import { Card, Badge, SectionCard } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import type { Material } from '../../types'

interface MultiModalPageProps { db: Material[] }

const SCALE_LEVELS = [
  { label: 'L1 — 部品スケール', unit: 'mm', desc: '部品全体の形状・寸法。3D CAD モデルと対応。' },
  { label: 'L2 — 組織スケール', unit: 'μm', desc: '多結晶組織。結晶粒径・分布が強度特性を支配。' },
  { label: 'L3 — 粒界スケール', unit: 'nm', desc: '粒界偏析・析出物。腐食・き裂進展の起点。' },
]

function MacroView({ material }: { material: Material }) {
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: 'var(--bg-sunken)', borderRadius: 6 }}>
      <rect x={60} y={40} width={180} height={140} rx={8} fill="none" stroke="var(--accent)" strokeWidth={2} />
      {[90, 210].flatMap(cx => [60, 160].map(cy => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={12} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      )))}
      <line x1={60} y1={195} x2={240} y2={195} stroke="var(--text-lo)" strokeWidth={0.8} />
      <text x={150} y={210} textAnchor="middle" fontSize={9} fill="var(--text-lo)" fontFamily="monospace">
        {(material.dn > 0 ? (90 / material.dn).toFixed(0) : 180)} mm
      </text>
      <text x={150} y={28} textAnchor="middle" fontSize={10} fontWeight="bold" fill="var(--text-md)">{material.name.slice(0, 18)}</text>
      <text x={150} y={125} textAnchor="middle" fontSize={9} fill="var(--text-lo)">密度: {material.dn} g/cm³</text>
    </svg>
  )
}

function MicroView({ material }: { material: Material }) {
  const grainSize = Math.max(10, Math.min(60, 3000 / (material.hv || 200)))
  const grains: { cx: number; cy: number; r: number; angle: number }[] = []
  let s = 0
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  for (let i = 0; i < 40; i++) grains.push({ cx: 20 + rng()*260, cy: 20 + rng()*180, r: grainSize*(0.6+rng()*0.8), angle: rng()*360 })
  const colors = ['#1a3048','#1d3a5c','#1e4070','#163558','#122a44']
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: '#0a1520', borderRadius: 6 }}>
      <defs><clipPath id="mc"><rect x={0} y={0} width={300} height={220}/></clipPath></defs>
      <g clipPath="url(#mc)">
        {grains.map((g, i) => (
          <ellipse key={i} cx={g.cx} cy={g.cy} rx={g.r} ry={g.r*0.7}
            transform={`rotate(${g.angle},${g.cx},${g.cy})`}
            fill={colors[i%5]} stroke="#3a6090" strokeWidth={0.8} />
        ))}
      </g>
      <text x={150} y={14} textAnchor="middle" fontSize={9} fill="#6090b0" fontFamily="monospace">
        結晶粒径 ≈ {grainSize.toFixed(0)} μm (HV {material.hv} から推定)
      </text>
    </svg>
  )
}

function NanoView({ material }: { material: Material }) {
  const isFCC = material.name.includes('SUS') || material.name.includes('ニッケル') || material.name.includes('アルミ')
  const dots: { x: number; y: number; gb: boolean }[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 20 + c * 28 + (isFCC && r%2===1 ? 14 : 0)
      const y = 20 + r * 24
      dots.push({ x, y, gb: r === 3 || r === 4 })
    }
  }
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: '#080c14', borderRadius: 6 }}>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={6} fill={d.gb?'#f06060':'#4080c0'} stroke={d.gb?'#ff8080':'#6090d0'} strokeWidth={0.5} opacity={0.85}/>)}
      <line x1={0} y1={107} x2={300} y2={107} stroke="#f0606088" strokeWidth={2} strokeDasharray="6,3"/>
      <text x={150} y={14} textAnchor="middle" fontSize={9} fill="#6090b0" fontFamily="monospace">
        {isFCC ? 'FCC 配列' : 'BCC 配列'} — 粒界 (赤) が腐食・き裂の起点
      </text>
    </svg>
  )
}

export const MultiModalPage = ({ db }: MultiModalPageProps) => {
  const [selectedId, setSelectedId] = useState(db[0]?.id ?? '')
  const [scale, setScale] = useState(0)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const material = db.find(m => m.id === selectedId) ?? db[0]
  const level = scale < 34 ? 0 : scale < 67 ? 1 : 2

  const zoom = (dir: 1 | -1) => {
    if (animRef.current) clearInterval(animRef.current)
    setAnimating(true)
    animRef.current = setInterval(() => {
      setScale(s => {
        const next = s + dir * 2
        if (next >= 100 || next <= 0) { clearInterval(animRef.current!); setAnimating(false) }
        return Math.min(100, Math.max(0, next))
      })
    }, 20)
  }
  useEffect(() => () => { if (animRef.current) clearInterval(animRef.current) }, [])
  if (!material) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[16px] font-bold text-text-hi flex items-center gap-2">
          <Icon name="embed" size={16} />
          マルチスケール・ビューア (マクロ ↔ マイクロ)
        </h1>
        <p className="text-[12px] text-text-lo mt-0.5">
          部品スケール (mm) から結晶粒界 (nm) までをドリルダウンして観察。
          <Badge variant="amber" className="ml-2 text-[10px]">モック描画</Badge>
        </p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">材料選択</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px]">
              {db.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => zoom(-1)} disabled={scale <= 0 || animating}
              className="px-3 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] hover:bg-hover disabled:opacity-30">← マクロ</button>
            <button onClick={() => zoom(1)} disabled={scale >= 100 || animating}
              className="px-3 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] hover:bg-hover disabled:opacity-30">マイクロ →</button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-text-lo mb-1">
            {SCALE_LEVELS.map((l, i) => <span key={i} className={level === i ? 'text-accent font-bold' : ''}>{l.label}</span>)}
          </div>
          <input type="range" min={0} max={100} value={scale} onChange={e => setScale(+e.target.value)}
            className="w-full accent-[var(--vec-col)]" aria-label="マクロ〜ナノのスケール切り替え" />
          <div className="flex justify-between text-[10px] text-text-lo mt-0.5">
            <span>mm</span><span>μm</span><span>nm</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Card className="p-4">
            <div className="text-[11px] font-bold text-text-lo mb-2">
              {SCALE_LEVELS[level]?.label} — {SCALE_LEVELS[level]?.unit}
            </div>
            {level === 0 && <MacroView material={material} />}
            {level === 1 && <MicroView material={material} />}
            {level === 2 && <NanoView material={material} />}
          </Card>
        </div>
        <div className="flex flex-col gap-3">
          <SectionCard title="材料情報">
            <div className="flex flex-col gap-1 text-[12px]">
              {[['名称', material.name.slice(0,20)], ['組成', material.comp.slice(0,18)], ['硬度', `${material.hv} HV`], ['引張強さ', `${material.ts} MPa`], ['密度', `${material.dn} g/cm³`]].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-text-lo">{k}</span>
                  <span className="font-semibold truncate max-w-[130px] font-mono text-[11px]">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="スケール解説">
            <p className="text-[11px] text-text-md leading-relaxed">{SCALE_LEVELS[level]?.desc}</p>
          </SectionCard>
        </div>
      </div>

      <Card className="p-3 border-dashed" style={{ borderColor: 'var(--border-faint)' }}>
        <p className="text-[11px] text-text-lo">
          ※ プロトタイプ: L2/L3 は Hall-Petch から推定した模式図です。
          実運用では顕微鏡画像 (SEM/OM) や X 線 CT データを MaiML で紐付けて表示します。
        </p>
      </Card>
    </div>
  )
}
