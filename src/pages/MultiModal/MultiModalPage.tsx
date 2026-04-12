/**
 * MultiModalPage — マルチスケール・ビューア
 * 部品 (mm) → 組織 (μm) → 粒界 (nm) をドリルダウン。
 * 材料ごとに結晶構造・粒径・形状が変化する。
 */
import { useState, useRef, useEffect, useMemo } from 'react'
import { Card, Badge, SectionCard } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import type { Material } from '../../types'

interface MultiModalPageProps { db: Material[] }

type Lattice = 'BCC' | 'FCC' | 'HCP' | 'AMORPHOUS' | 'COMPOSITE' | 'CERAMIC'

const SCALE_LEVELS = [
  { label: 'L1 — 部品スケール', unit: 'mm', desc: '部品全体の形状・寸法。3D CAD モデルと対応。' },
  { label: 'L2 — 組織スケール', unit: 'μm', desc: '多結晶組織。結晶粒径・分布が強度特性を支配。' },
  { label: 'L3 — 粒界スケール', unit: 'nm', desc: '粒界偏析・析出物。腐食・き裂進展の起点。' },
]

function detectLattice(m: Material): Lattice {
  if (m.cat === '複合材料') return 'COMPOSITE'
  if (m.cat === 'ポリマー')  return 'AMORPHOUS'
  if (m.cat === 'セラミクス') return 'CERAMIC'
  const n = m.name
  if (/SUS3|オーステナイト|Inconel|Hastelloy|Monel|インコネル|ニッケル|純アルミ|純銅|A\d{4}|Cu|黄銅|青銅|Au|Ag/.test(n)) return 'FCC'
  if (/チタン|Ti[- ]|Ti\d|マグネシウム|Mg|亜鉛|Zn|コバルト|Co[- ]|ジルコ|Zr|Be/.test(n)) return 'HCP'
  return 'BCC'
}

type Palette = { bg: string; fg: string; muted: string; accent: string; accent2: string }
function usePalette(): Palette {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light'
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') !== 'light')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return dark
    ? { bg:'#0a1520', fg:'#c8e0f0', muted:'#6090b0', accent:'#4aa8ff', accent2:'#1a3048' }
    : { bg:'#f3f6fa', fg:'#0b1b2a', muted:'#5a6a7a', accent:'#0369a1', accent2:'#cfe0f0' }
}

// ─── L1 Macro ──────────────────────────────────────────────────

function MacroView({ material, c }: { material: Material; c: Palette }) {
  const cat = material.cat
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      {cat === '金属合金' && <MacroTurbine c={c} />}
      {cat === 'セラミクス' && <MacroRing c={c} />}
      {cat === 'ポリマー' && <MacroHousing c={c} />}
      {cat === '複合材料' && <MacroLaminate c={c} />}
      <text x={150} y={24} textAnchor="middle" fontSize={11} fontWeight="bold" fill={c.fg}>
        {material.name.slice(0, 22)}
      </text>
      <text x={150} y={208} textAnchor="middle" fontSize={10} fill={c.muted} fontFamily="monospace">
        ρ={material.dn} g/cm³ · {cat}
      </text>
    </svg>
  )
}
function MacroTurbine({ c }: { c: Palette }) {
  const blades = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <g transform="translate(150 115)">
      <circle r={26} fill={c.accent2} opacity={0.3} stroke={c.accent} strokeWidth={1.5} />
      <circle r={10} fill={c.accent} />
      {blades.map(a => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M 22 -5 Q 55 -12 70 0 Q 55 12 22 5 Z" fill={c.accent} opacity={0.6} stroke={c.accent} strokeWidth={0.8} />
        </g>
      ))}
      <text y={95} textAnchor="middle" fontSize={9} fill={c.muted} fontFamily="monospace">タービンブレード</text>
    </g>
  )
}
function MacroRing({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 115)">
      <circle r={55} fill="none" stroke={c.accent} strokeWidth={2} />
      <circle r={30} fill="none" stroke={c.accent} strokeWidth={2} />
      {[0,60,120,180,240,300].map(a => (
        <circle key={a} cx={Math.cos(a*Math.PI/180)*42} cy={Math.sin(a*Math.PI/180)*42} r={4} fill={c.accent} />
      ))}
      <text y={85} textAnchor="middle" fontSize={9} fill={c.muted} fontFamily="monospace">軸受リング</text>
    </g>
  )
}
function MacroHousing({ c }: { c: Palette }) {
  return (
    <g>
      <rect x={70} y={70} width={160} height={90} rx={14} fill={c.accent2} opacity={0.4} stroke={c.accent} strokeWidth={2} />
      <rect x={90} y={90} width={50} height={50} rx={3} fill="none" stroke={c.accent} strokeWidth={1} />
      <rect x={160} y={90} width={50} height={50} rx={3} fill="none" stroke={c.accent} strokeWidth={1} />
      <text x={150} y={180} textAnchor="middle" fontSize={9} fill={c.muted} fontFamily="monospace">樹脂筐体</text>
    </g>
  )
}
function MacroLaminate({ c }: { c: Palette }) {
  return (
    <g>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={60} y={65 + i*14} width={180} height={10} fill={i%2? c.accent : c.accent2} opacity={0.7} />
      ))}
      <text x={150} y={180} textAnchor="middle" fontSize={9} fill={c.muted} fontFamily="monospace">
        積層板 (0°/90°)
      </text>
    </g>
  )
}

// ─── L2 Micro ──────────────────────────────────────────────────

function MicroView({ material, c }: { material: Material; c: Palette }) {
  const lat = detectLattice(material)
  if (lat === 'COMPOSITE') return <MicroFiber c={c} />
  if (lat === 'AMORPHOUS') return <MicroAmorphous c={c} />
  const grainSize = Math.max(8, Math.min(55, 2600 / (material.hv || 200)))
  const grains: { cx: number; cy: number; r: number; angle: number }[] = []
  let s = material.id.charCodeAt(4) * 1000 + material.hv
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  const shape = lat === 'CERAMIC' ? 0.95 : lat === 'HCP' ? 0.55 : 0.75
  const count = lat === 'CERAMIC' ? 55 : 38
  for (let i = 0; i < count; i++) {
    grains.push({
      cx: 20 + rng()*260, cy: 25 + rng()*170,
      r: grainSize*(0.6+rng()*0.8), angle: rng()*360,
    })
  }
  const fill = (i: number) => lat === 'CERAMIC'
    ? ['#2a1a2a','#33202c','#3a2630','#2e1d28','#352230'][i%5]!
    : ['#1a3048','#1d3a5c','#1e4070','#163558','#122a44'][i%5]!
  const stroke = lat === 'CERAMIC' ? '#a060a0' : '#3a6090'
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      <defs><clipPath id="mc"><rect x={0} y={0} width={300} height={220}/></clipPath></defs>
      <g clipPath="url(#mc)">
        {grains.map((g, i) => (
          <ellipse key={i} cx={g.cx} cy={g.cy} rx={g.r} ry={g.r*shape}
            transform={`rotate(${g.angle},${g.cx},${g.cy})`}
            fill={fill(i)} stroke={stroke} strokeWidth={0.8} />
        ))}
      </g>
      <text x={150} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">
        {lat === 'CERAMIC' ? '等軸粒' : lat === 'HCP' ? '針状組織 (α相)' : '多結晶組織'}
        {' '}· 平均粒径 ≈ {grainSize.toFixed(0)} μm
      </text>
    </svg>
  )
}
function MicroFiber({ c }: { c: Palette }) {
  const fibers: { x: number; y: number }[] = []
  for (let x = 25; x < 300; x += 14) {
    for (let y = 30; y < 215; y += 14) {
      fibers.push({ x: x + ((y/14)|0)%2 * 7, y })
    }
  }
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      <rect x={0} y={0} width={300} height={220} fill="#2a1f18" />
      {fibers.map((f,i) => (
        <circle key={i} cx={f.x} cy={f.y} r={4.5} fill="#141414" stroke="#606060" strokeWidth={0.8}/>
      ))}
      <text x={150} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">
        繊維 (黒・φ7μm) + 樹脂マトリクス (茶)
      </text>
    </svg>
  )
}
function MicroAmorphous({ c }: { c: Palette }) {
  const chains: string[] = []
  let s = 12345
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  for (let k = 0; k < 18; k++) {
    let path = `M ${rng()*300} ${25 + rng()*180}`
    for (let i = 0; i < 12; i++) {
      path += ` Q ${rng()*300} ${25 + rng()*180} ${rng()*300} ${25 + rng()*180}`
    }
    chains.push(path)
  }
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      {chains.map((d,i) => (
        <path key={i} d={d} stroke={`hsl(${30+i*8}, 45%, 55%)`} strokeWidth={1.2} fill="none" opacity={0.8}/>
      ))}
      <text x={150} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">
        非晶質高分子鎖 (結晶なし)
      </text>
    </svg>
  )
}

// ─── L3 Nano ──────────────────────────────────────────────────

function NanoView({ material, c }: { material: Material; c: Palette }) {
  const lat = detectLattice(material)
  if (lat === 'AMORPHOUS') return <NanoAmorphous c={c} />
  if (lat === 'COMPOSITE') return <NanoInterface c={c} />
  if (lat === 'CERAMIC')   return <NanoCovalent c={c} material={material} />
  return <NanoMetal c={c} lat={lat} material={material} />
}

function NanoMetal({ c, lat, material }: { c: Palette; lat: Lattice; material: Material }) {
  const cols = 11, rows = 8
  const dots: { x: number; y: number; gb: boolean; kind: 'corner' | 'face' | 'body' }[] = []
  const baseX = 22, baseY = 30
  const dxF = 26, dyF = 22
  if (lat === 'FCC') {
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = baseX + col * dxF
        const y = baseY + r * dyF
        const gb = r === 3 || r === 4
        dots.push({ x, y, gb, kind: 'corner' })
        if (col < cols - 1 && r < rows - 1) {
          dots.push({ x: x + dxF/2, y: y + dyF/2, gb: (r === 3), kind: 'face' })
        }
      }
    }
  } else if (lat === 'BCC') {
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = baseX + col * dxF
        const y = baseY + r * dyF
        const gb = r === 3 || r === 4
        dots.push({ x, y, gb, kind: 'corner' })
        if (col < cols - 1 && r < rows - 1) {
          dots.push({ x: x + dxF/2, y: y + dyF/2, gb: (r === 3), kind: 'body' })
        }
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (dxF / 2)
      for (let col = 0; col < cols; col++) {
        const x = baseX + col * dxF + offset
        const y = baseY + r * (dyF * 0.87)
        const gb = r === 3 || r === 4
        dots.push({ x, y, gb, kind: 'corner' })
      }
    }
  }
  const atomColor = lat === 'FCC' ? '#4aa8ff' : lat === 'BCC' ? '#ffc04a' : '#a78bfa'
  const accentColor = lat === 'FCC' ? '#a0d4ff' : lat === 'BCC' ? '#ffd88a' : '#d4c4ff'
  const atomsPerCell = lat === 'FCC' ? 4 : 2
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      <defs>
        <radialGradient id={`atomG-${lat}`}>
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="70%" stopColor={atomColor} />
          <stop offset="100%" stopColor="#0a1a30" />
        </radialGradient>
        <radialGradient id="gbG">
          <stop offset="0%" stopColor="#ffb0b0" />
          <stop offset="70%" stopColor="#e04848" />
          <stop offset="100%" stopColor="#401010" />
        </radialGradient>
      </defs>
      {lat !== 'HCP' && dots.filter(d => d.kind === 'corner').map((d, i) => (
        <g key={`b${i}`}>
          <line x1={d.x} y1={d.y} x2={d.x + dxF} y2={d.y} stroke={atomColor} strokeWidth={0.3} opacity={0.35} />
          <line x1={d.x} y1={d.y} x2={d.x} y2={d.y + dyF} stroke={atomColor} strokeWidth={0.3} opacity={0.35} />
        </g>
      ))}
      {dots.map((d, i) => (
        <circle key={i}
          cx={d.x} cy={d.y}
          r={d.kind === 'corner' ? 5.5 : 4}
          fill={d.gb ? 'url(#gbG)' : `url(#atomG-${lat})`}
          opacity={d.kind === 'face' || d.kind === 'body' ? 0.78 : 1}
        />
      ))}
      <path d="M 0 107 Q 75 102 150 107 T 300 107" stroke="#e04848" strokeWidth={1.5}
        strokeDasharray="5,3" fill="none" opacity={0.75}/>
      <text x={150} y={16} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">
        {lat} 配列 · {atomsPerCell} 原子/セル · 粒界 (赤) に不純物偏析
      </text>
      <text x={150} y={212} textAnchor="middle" fontSize={9} fill={c.muted} fontFamily="monospace">
        {material.comp.slice(0, 34)}
      </text>
    </svg>
  )
}

function NanoAmorphous({ c }: { c: Palette }) {
  const dots: { x: number; y: number }[] = []
  let s = 4242
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  for (let i = 0; i < 100; i++) dots.push({ x: 15 + rng()*275, y: 25 + rng()*180 })
  const chains: string[] = []
  s = 9999
  for (let k = 0; k < 6; k++) {
    let p = `M ${rng()*300} ${25 + rng()*180}`
    for (let i = 0; i < 10; i++) p += ` L ${rng()*300} ${25 + rng()*180}`
    chains.push(p)
  }
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      {chains.map((d,i) => <path key={i} d={d} stroke="#9a8a6a" strokeWidth={1.4} fill="none" opacity={0.5}/>)}
      {dots.map((d,i) => <circle key={i} cx={d.x} cy={d.y} r={2.3} fill="#d0b890" opacity={0.9}/>)}
      <text x={150} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">
        ランダム配列 (長距離秩序なし) — 高分子鎖が絡み合う
      </text>
    </svg>
  )
}

function NanoInterface({ c }: { c: Palette }) {
  const fiberAtoms: {x:number;y:number}[] = []
  for (let y = 30; y < 210; y += 10) {
    for (let x = 25; x < 125; x += 10) fiberAtoms.push({x, y: y + (x % 20 ? 0 : 3)})
  }
  const matrixAtoms: {x:number;y:number}[] = []
  let s = 7777
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  for (let i = 0; i < 90; i++) matrixAtoms.push({ x: 160 + rng()*125, y: 25 + rng()*190 })
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      <rect x={0} y={0} width={145} height={220} fill="#121826"/>
      <rect x={155} y={0} width={145} height={220} fill="#251a12"/>
      {fiberAtoms.map((d,i) => <circle key={`f${i}`} cx={d.x} cy={d.y} r={3.3} fill="#80a0c0" stroke="#404040" strokeWidth={0.5}/>)}
      {matrixAtoms.map((d,i) => <circle key={`m${i}`} cx={d.x} cy={d.y} r={2.2} fill="#c0a060" opacity={0.8}/>)}
      <line x1={148} y1={0} x2={148} y2={220} stroke="#ff8040" strokeWidth={1.5} strokeDasharray="4,3"/>
      <line x1={152} y1={0} x2={152} y2={220} stroke="#ff8040" strokeWidth={1.5} strokeDasharray="4,3"/>
      <text x={72} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">繊維 (規則配列)</text>
      <text x={228} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">マトリクス (非晶)</text>
      <text x={150} y={212} textAnchor="middle" fontSize={9} fill="#ff8040" fontFamily="monospace">界面 — 剥離起点</text>
    </svg>
  )
}

function NanoCovalent({ c, material }: { c: Palette; material: Material }) {
  const hex: {x:number;y:number}[] = []
  const dx = 24, dy = 20
  for (let r = 0; r < 10; r++) {
    for (let col = 0; col < 13; col++) {
      hex.push({ x: 15 + col * dx + (r%2)*(dx/2), y: 20 + r * dy })
    }
  }
  return (
    <svg viewBox="0 0 300 220" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      {hex.map((a, i) => hex.slice(i+1).map((b, j) => {
        const d = Math.hypot(a.x-b.x, a.y-b.y)
        return d < 26 ? <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="#c070c0" strokeWidth={0.7} opacity={0.6}/> : null
      }))}
      {hex.map((d,i) => (
        <circle key={i} cx={d.x} cy={d.y} r={3.5}
          fill={i%3===0 ? '#ff80c0' : '#c080ff'} stroke="#e0a0e0" strokeWidth={0.5}/>
      ))}
      <text x={150} y={14} textAnchor="middle" fontSize={10} fill={c.fg} fontFamily="monospace">
        共有/イオン結合ネットワーク · 劈開面で脆性破壊
      </text>
      <text x={150} y={212} textAnchor="middle" fontSize={9} fill={c.muted} fontFamily="monospace">
        {material.comp.slice(0, 34)}
      </text>
    </svg>
  )
}

// ─── Material Combobox (検索 + カテゴリグルーピング) ────────────

function MaterialCombobox({ db, value, onChange }: {
  db: Material[]; value: string; onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)
  const current = db.find(m => m.id === value)
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    const match = qq
      ? db.filter(m =>
          m.name.toLowerCase().includes(qq) ||
          m.id.toLowerCase().includes(qq) ||
          m.comp.toLowerCase().includes(qq))
      : db
    const groups = new Map<string, Material[]>()
    for (const m of match) {
      if (!groups.has(m.cat)) groups.set(m.cat, [])
      groups.get(m.cat)!.push(m)
    }
    return [...groups.entries()]
  }, [db, q])

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={boxRef}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded border border-[var(--border-default)] bg-raised text-[12px] hover:bg-hover text-left">
        <span className="truncate">
          {current ? `${current.name} (${current.id})` : '材料を選択...'}
          {current && <span className="ml-2 text-text-lo text-[10px]">[{current.cat}]</span>}
        </span>
        <Icon name="chevronDown" size={12} className="text-text-lo flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-[var(--border-default)] rounded shadow-lg max-h-[380px] flex flex-col">
          <div className="p-2 border-b border-[var(--border-faint)]">
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="材料名・ID・組成で検索..."
              className="w-full px-2 py-1 text-[12px] bg-raised rounded border border-[var(--border-faint)] outline-none focus:border-accent"/>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && <div className="p-3 text-[11px] text-text-lo text-center">該当なし</div>}
            {filtered.map(([cat, items]) => (
              <div key={cat}>
                <div className="sticky top-0 px-3 py-1 bg-sunken text-[10px] font-bold uppercase tracking-wider text-text-lo flex items-center justify-between">
                  <span>{cat}</span>
                  <span>{items.length}</span>
                </div>
                {items.map(m => (
                  <button key={m.id} onClick={() => { onChange(m.id); setOpen(false); setQ('') }}
                    className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-hover flex items-center gap-2 ${m.id === value ? 'bg-accent-dim' : ''}`}>
                    <span className="font-mono text-text-lo text-[10px] w-[74px] flex-shrink-0">{m.id}</span>
                    <span className="flex-1 truncate">{m.name}</span>
                    {m.id === value && <Icon name="check" size={10} className="text-accent" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export const MultiModalPage = ({ db }: MultiModalPageProps) => {
  const [selectedId, setSelectedId] = useState(db[0]?.id ?? '')
  const [scale, setScale] = useState(0)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const material = db.find(m => m.id === selectedId) ?? db[0]
  const level = scale < 34 ? 0 : scale < 67 ? 1 : 2
  const c = usePalette()

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

  const lat = detectLattice(material)
  const latLabel: Record<Lattice,string> = {
    FCC:'FCC (面心立方)', BCC:'BCC (体心立方)', HCP:'HCP (六方最密)',
    AMORPHOUS:'非晶質', COMPOSITE:'繊維強化複合', CERAMIC:'共有/イオン結合',
  }

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
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <label className="text-[11px] font-bold text-text-lo uppercase tracking-[.05em] block mb-1">
              材料選択 ({db.length} 件)
            </label>
            <MaterialCombobox db={db} value={selectedId} onChange={setSelectedId} />
          </div>
          <div className="flex gap-2 pt-5">
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
            <div className="text-[11px] font-bold text-text-lo mb-2 flex items-center justify-between">
              <span>{SCALE_LEVELS[level]?.label} — {SCALE_LEVELS[level]?.unit}</span>
              {level === 2 && <Badge variant="gray" className="text-[10px]">{latLabel[lat]}</Badge>}
            </div>
            {level === 0 && <MacroView material={material} c={c} />}
            {level === 1 && <MicroView material={material} c={c} />}
            {level === 2 && <NanoView material={material} c={c} />}
          </Card>
        </div>
        <div className="flex flex-col gap-3">
          <SectionCard title="材料情報">
            <div className="flex flex-col gap-1 text-[12px]">
              {[
                ['名称', material.name.slice(0,20)],
                ['カテゴリ', material.cat],
                ['結晶構造', latLabel[lat]],
                ['組成', material.comp.slice(0,18)],
                ['硬度', `${material.hv} HV`],
                ['引張強さ', `${material.ts} MPa`],
                ['密度', `${material.dn} g/cm³`],
              ].map(([k,v]) => (
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
          ※ プロトタイプ: 結晶構造は名称から推定した模式図です。
          実運用では XRD / SEM / TEM 実測データを MaiML で紐付けて表示します。
        </p>
      </Card>
    </div>
  )
}
