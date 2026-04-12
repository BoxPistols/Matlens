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

/**
 * 結晶構造推定 (名称ベース簡易判定)
 * FCC: Al/Cu/Ni/Au/Ag 基合金、オーステナイト系ステンレス (SUS2xx/3xx 系)
 * HCP: Ti/Mg/Zn/Zr/Co/Be
 * BCC: α-Fe (炭素鋼・工具鋼・軸受鋼)、フェライト/マルテンサイト系ステンレス (SUS4xx/6xx)、W/Mo/Cr、Kovar
 */
function detectLattice(m: Material): Lattice {
  if (m.cat === '複合材料') return 'COMPOSITE'
  if (m.cat === 'ポリマー')  return 'AMORPHOUS'
  if (m.cat === 'セラミクス') return 'CERAMIC'
  const n = m.name
  // HCP を先に判定 (BeCu は後段 FCC で上書き)
  if (/BeCu|ベリリウム銅/.test(n)) return 'FCC'
  // FCC: Cu 合金 / Al 合金 / Ni 基超合金 / オーステナイト系 / 貴金属
  if (/SUS2|SUS3|オーステナイト|Inconel|Hastelloy|Monel|インコネル|純ニッケル|ニッケル超合金|純アルミ|A\d{4}|純銅|無酸素銅|黄銅|青銅|真鍮|C\d{4}|Cu[- ]|Au|Ag|白金|Pt/.test(n)) return 'FCC'
  // HCP: Ti/Mg/Zn/Zr/Co/Be (SUS329 二相は α+γ 混合だが FCC 側で既判定)
  if (/チタン|Ti[- ]|Ti\d|マグネシウム|Mg[- ]|AZ\d+|亜鉛|Zn[- ]|コバルト|Co[- ]|ジルコ|Zr[- ]|ベリリウム|Be[- ]/.test(n)) return 'HCP'
  // 残り (炭素鋼 / 工具鋼 / SUS4xx / SUS6xx / W / Mo / Cr / Kovar) → BCC
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

type MacroShape = 'turbine' | 'disc' | 'shaft' | 'plate' | 'pipe' | 'gear' | 'tool' |
                  'bladeAirfoil' | 'ring' | 'insulator' | 'substrate' |
                  'housing' | 'gasket' | 'film' | 'laminate' | 'honeycomb'

function detectMacroShape(m: Material): { shape: MacroShape; label: string } {
  const n = m.name
  const cat = m.cat
  if (cat === '金属合金') {
    if (/Ti[- ]|チタン/.test(n)) return { shape:'bladeAirfoil', label:'エアフォイル翼' }
    if (/Inconel|Ni[- ]|ニッケル|Hastelloy|Monel|インコネル/.test(n)) return { shape:'turbine', label:'タービンディスク' }
    if (/SKH|SKD|ハイス|工具|高速度/.test(n)) return { shape:'tool', label:'切削工具' }
    if (/SCM|クロモリ|SNCM|SNC/.test(n)) return { shape:'shaft', label:'駆動シャフト' }
    if (/SUS3|オーステナイト|ステンレス/.test(n)) return { shape:'pipe', label:'ステンレス管' }
    if (/SUS4|フェライト|マルテンサイト/.test(n)) return { shape:'gear', label:'歯車' }
    if (/S[ABCES]\d{2}C|炭素鋼|SS\d/.test(n)) return { shape:'plate', label:'構造用鋼板' }
    if (/A\d{4}|アルミ|Al[- ]|純アルミ|ジュラ/.test(n)) return { shape:'plate', label:'アルミパネル' }
    if (/黄銅|青銅|Cu|銅|真鍮|brass/i.test(n)) return { shape:'pipe', label:'銅管' }
    if (/Mg|マグネシウム|AZ31/.test(n)) return { shape:'housing', label:'Mg 筐体' }
    return { shape:'disc', label:'汎用部品' }
  }
  if (cat === 'セラミクス') {
    if (/Al2O3|アルミナ|ZrO2|ジルコニア/.test(n)) return { shape:'ring', label:'セラミックリング' }
    if (/窒化|SiC|Si3N4|BN|SiAlON/.test(n)) return { shape:'bladeAirfoil', label:'セラミック翼' }
    if (/PZT|BaTiO|圧電/.test(n)) return { shape:'substrate', label:'圧電素子' }
    return { shape:'insulator', label:'絶縁碍子' }
  }
  if (cat === 'ポリマー') {
    if (/PTFE|テフロン|シリコン|フッ素/.test(n)) return { shape:'gasket', label:'ガスケット' }
    if (/PE|ポリエチ|PP|ポリプロ/.test(n)) return { shape:'film', label:'ポリマーフィルム' }
    if (/ABS|PC|ポリカ|PA|ナイロン|POM/.test(n)) return { shape:'housing', label:'樹脂筐体' }
    return { shape:'housing', label:'樹脂部品' }
  }
  if (cat === '複合材料') {
    if (/CFRP|炭素繊維/.test(n)) return { shape:'laminate', label:'CFRP 積層板' }
    if (/GFRP|ガラス繊維/.test(n)) return { shape:'laminate', label:'GFRP 積層板' }
    if (/ハニカム|サンド/.test(n)) return { shape:'honeycomb', label:'ハニカムコア' }
    return { shape:'laminate', label:'複合材料板' }
  }
  return { shape:'plate', label:'汎用部品' }
}

function MacroView({ material, c }: { material: Material; c: Palette }) {
  const { shape, label } = detectMacroShape(material)
  return (
    <svg viewBox="0 0 300 240" width="100%" style={{ background: c.bg, borderRadius: 6 }}>
      <text x={150} y={22} textAnchor="middle" fontSize={11} fontWeight="bold" fill={c.fg}>
        {material.name.slice(0, 24)}
      </text>
      <g transform="translate(0 10)">
        {shape === 'turbine' && <ShapeTurbine c={c} />}
        {shape === 'disc' && <ShapeDisc c={c} />}
        {shape === 'shaft' && <ShapeShaft c={c} />}
        {shape === 'plate' && <ShapePlate c={c} />}
        {shape === 'pipe' && <ShapePipe c={c} />}
        {shape === 'gear' && <ShapeGear c={c} />}
        {shape === 'tool' && <ShapeTool c={c} />}
        {shape === 'bladeAirfoil' && <ShapeAirfoil c={c} />}
        {shape === 'ring' && <ShapeRing c={c} />}
        {shape === 'insulator' && <ShapeInsulator c={c} />}
        {shape === 'substrate' && <ShapeSubstrate c={c} />}
        {shape === 'housing' && <ShapeHousing c={c} />}
        {shape === 'gasket' && <ShapeGasket c={c} />}
        {shape === 'film' && <ShapeFilm c={c} />}
        {shape === 'laminate' && <ShapeLaminate c={c} />}
        {shape === 'honeycomb' && <ShapeHoneycomb c={c} />}
      </g>
      <text x={10} y={230} textAnchor="start" fontSize={10} fill={c.muted} fontFamily="monospace">
        {label}
      </text>
      <text x={290} y={230} textAnchor="end" fontSize={10} fill={c.muted} fontFamily="monospace">
        ρ={material.dn} g/cm³
      </text>
    </svg>
  )
}

function ShapeTurbine({ c }: { c: Palette }) {
  const blades = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <g transform="translate(150 110)">
      <circle r={55} fill="none" stroke={c.accent} strokeWidth={1} opacity={0.5} />
      <circle r={28} fill={c.accent2} opacity={0.35} stroke={c.accent} strokeWidth={1.5} />
      <circle r={10} fill={c.accent} />
      {blades.map(a => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M 22 -5 Q 50 -10 62 0 Q 50 10 22 5 Z" fill={c.accent} opacity={0.65} stroke={c.accent} strokeWidth={0.6} />
        </g>
      ))}
    </g>
  )
}
function ShapeDisc({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 110)">
      <ellipse rx={80} ry={18} fill={c.accent2} opacity={0.5} stroke={c.accent} strokeWidth={1.2} />
      <ellipse rx={80} ry={18} cy={20} fill={c.accent} opacity={0.8} stroke={c.accent} strokeWidth={1.2} />
      <ellipse rx={80} ry={18} fill="none" stroke={c.accent} strokeWidth={1.5} />
      <line x1={-80} y1={0} x2={-80} y2={20} stroke={c.accent} strokeWidth={1.5} />
      <line x1={80} y1={0} x2={80} y2={20} stroke={c.accent} strokeWidth={1.5} />
    </g>
  )
}
function ShapeShaft({ c }: { c: Palette }) {
  return (
    <g transform="translate(30 100)">
      <rect x={0} y={0} width={240} height={24} fill={c.accent} opacity={0.7} stroke={c.accent} strokeWidth={1}/>
      <rect x={40} y={-8} width={30} height={40} fill={c.accent2} stroke={c.accent} strokeWidth={1}/>
      <rect x={160} y={-8} width={30} height={40} fill={c.accent2} stroke={c.accent} strokeWidth={1}/>
    </g>
  )
}
function ShapePlate({ c }: { c: Palette }) {
  return (
    <g>
      <rect x={50} y={60} width={200} height={100} fill={c.accent} opacity={0.5} stroke={c.accent} strokeWidth={1.5}/>
      <line x1={50} y1={60} x2={60} y2={50} stroke={c.accent} strokeWidth={1}/>
      <line x1={250} y1={60} x2={260} y2={50} stroke={c.accent} strokeWidth={1}/>
      <line x1={60} y1={50} x2={260} y2={50} stroke={c.accent} strokeWidth={1}/>
      <circle cx={80} cy={80} r={5} fill={c.bg} stroke={c.accent} strokeWidth={1}/>
      <circle cx={220} cy={80} r={5} fill={c.bg} stroke={c.accent} strokeWidth={1}/>
      <circle cx={80} cy={140} r={5} fill={c.bg} stroke={c.accent} strokeWidth={1}/>
      <circle cx={220} cy={140} r={5} fill={c.bg} stroke={c.accent} strokeWidth={1}/>
    </g>
  )
}
function ShapePipe({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 110)">
      <ellipse cx={-90} rx={14} ry={36} fill={c.accent2} stroke={c.accent} strokeWidth={1.2}/>
      <ellipse cx={90} rx={14} ry={36} fill={c.accent} opacity={0.7} stroke={c.accent} strokeWidth={1.2}/>
      <rect x={-90} y={-36} width={180} height={72} fill={c.accent} opacity={0.45}/>
      <line x1={-90} y1={-36} x2={90} y2={-36} stroke={c.accent} strokeWidth={1.5}/>
      <line x1={-90} y1={36} x2={90} y2={36} stroke={c.accent} strokeWidth={1.5}/>
      <ellipse cx={-90} rx={14} ry={36} fill="none" stroke={c.accent} strokeWidth={1.5}/>
      <ellipse cx={-90} rx={8} ry={22} fill={c.bg} stroke={c.accent} strokeWidth={1}/>
    </g>
  )
}
function ShapeGear({ c }: { c: Palette }) {
  const teeth = 16
  const pts: string[] = []
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2
    const r = i % 2 === 0 ? 60 : 48
    pts.push(`${Math.cos(a)*r},${Math.sin(a)*r}`)
  }
  return (
    <g transform="translate(150 110)">
      <polygon points={pts.join(' ')} fill={c.accent} opacity={0.65} stroke={c.accent} strokeWidth={1.2}/>
      <circle r={20} fill={c.bg} stroke={c.accent} strokeWidth={1.2}/>
      <circle r={8} fill={c.accent}/>
    </g>
  )
}
function ShapeTool({ c }: { c: Palette }) {
  return (
    <g transform="translate(60 110)">
      <rect x={0} y={-8} width={100} height={16} fill={c.accent} opacity={0.7} stroke={c.accent}/>
      <polygon points="100,-8 180,-12 180,12 100,8" fill={c.accent2} stroke={c.accent} strokeWidth={1}/>
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={105+i*15} y1={-10} x2={100+i*15} y2={10} stroke={c.accent} strokeWidth={0.8}/>
      ))}
    </g>
  )
}
function ShapeAirfoil({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 110)">
      <path d="M -80 5 Q -40 -35 30 -25 Q 70 -10 80 10 Q 70 18 30 20 Q -30 22 -80 10 Z"
        fill={c.accent} opacity={0.7} stroke={c.accent} strokeWidth={1.5}/>
      <path d="M -80 5 Q -40 -35 30 -25 Q 70 -10 80 10" stroke={c.fg} strokeWidth={0.8} fill="none" opacity={0.6}/>
    </g>
  )
}
function ShapeRing({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 110)">
      <circle r={62} fill="none" stroke={c.accent} strokeWidth={2}/>
      <circle r={32} fill="none" stroke={c.accent} strokeWidth={2}/>
      <circle r={62} fill={c.accent} opacity={0.25}/>
      <circle r={32} fill={c.bg}/>
      {[0,60,120,180,240,300].map(a => (
        <circle key={a} cx={Math.cos(a*Math.PI/180)*47} cy={Math.sin(a*Math.PI/180)*47} r={4} fill={c.accent} />
      ))}
    </g>
  )
}
function ShapeInsulator({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 110)">
      {[-40,-20,0,20,40].map(y => (
        <ellipse key={y} cy={y} rx={36} ry={8} fill={c.accent} opacity={0.55} stroke={c.accent} strokeWidth={0.8}/>
      ))}
      <rect x={-6} y={-55} width={12} height={110} fill={c.accent2}/>
    </g>
  )
}
function ShapeSubstrate({ c }: { c: Palette }) {
  return (
    <g transform="translate(70 70)">
      <rect width={160} height={90} fill={c.accent2} opacity={0.5} stroke={c.accent} strokeWidth={1.2}/>
      {[0,1,2,3].map(r => [0,1,2,3,4,5].map(col => (
        <rect key={`${r}-${col}`} x={12 + col*24} y={12 + r*20} width={16} height={12}
          fill={c.accent} opacity={0.8} stroke={c.accent} strokeWidth={0.4}/>
      )))}
    </g>
  )
}
function ShapeHousing({ c }: { c: Palette }) {
  return (
    <g>
      <rect x={70} y={70} width={160} height={90} rx={14} fill={c.accent2} opacity={0.5} stroke={c.accent} strokeWidth={2} />
      <rect x={90} y={90} width={50} height={50} rx={3} fill="none" stroke={c.accent} strokeWidth={1} />
      <rect x={160} y={90} width={50} height={50} rx={3} fill="none" stroke={c.accent} strokeWidth={1} />
    </g>
  )
}
function ShapeGasket({ c }: { c: Palette }) {
  return (
    <g transform="translate(150 110)">
      <circle r={62} fill={c.accent} opacity={0.55} stroke={c.accent} strokeWidth={1.5}/>
      <circle r={32} fill={c.bg}/>
      {[0,45,90,135,180,225,270,315].map(a => (
        <circle key={a} cx={Math.cos(a*Math.PI/180)*47} cy={Math.sin(a*Math.PI/180)*47} r={4} fill={c.bg} stroke={c.accent} strokeWidth={0.6}/>
      ))}
    </g>
  )
}
function ShapeFilm({ c }: { c: Palette }) {
  return (
    <g>
      <path d="M 40 80 Q 90 60 150 80 T 260 80 L 260 160 Q 210 180 150 160 T 40 160 Z"
        fill={c.accent} opacity={0.45} stroke={c.accent} strokeWidth={1.2}/>
    </g>
  )
}
function ShapeLaminate({ c }: { c: Palette }) {
  return (
    <g>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={60} y={60 + i*14} width={180} height={10} fill={i%2? c.accent : c.accent2} opacity={0.75} />
      ))}
    </g>
  )
}
function ShapeHoneycomb({ c }: { c: Palette }) {
  const cells: string[] = []
  const hx = 16, hy = 14
  for (let r = 0; r < 6; r++) {
    for (let col = 0; col < 9; col++) {
      const cx = 70 + col * hx * 1.5 + (r%2)*(hx*0.75)
      const cy = 70 + r * hy * 1.5
      const pts = [0,60,120,180,240,300].map(a => `${cx+Math.cos(a*Math.PI/180)*hx},${cy+Math.sin(a*Math.PI/180)*hx}`).join(' ')
      cells.push(pts)
    }
  }
  return (
    <g>
      {cells.map((p, i) => (
        <polygon key={i} points={p} fill="none" stroke={c.accent} strokeWidth={0.9} opacity={0.7}/>
      ))}
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
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [latFilter, setLatFilter] = useState<Lattice | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const current = db.find(m => m.id === value)

  const catCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const m of db) c[m.cat] = (c[m.cat] || 0) + 1
    return c
  }, [db])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    const match = db.filter(m => {
      if (catFilter && m.cat !== catFilter) return false
      if (latFilter && detectLattice(m) !== latFilter) return false
      if (!qq) return true
      return m.name.toLowerCase().includes(qq) ||
        m.id.toLowerCase().includes(qq) ||
        m.comp.toLowerCase().includes(qq) ||
        (m.memo || '').toLowerCase().includes(qq)
    })
    const groups = new Map<string, Material[]>()
    for (const m of match) {
      if (!groups.has(m.cat)) groups.set(m.cat, [])
      groups.get(m.cat)!.push(m)
    }
    return { groups: [...groups.entries()], total: match.length }
  }, [db, q, catFilter, latFilter])

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
        <div className="absolute z-20 mt-1 w-full bg-surface border border-[var(--border-default)] rounded shadow-lg max-h-[440px] flex flex-col">
          <div className="p-2 border-b border-[var(--border-faint)] flex flex-col gap-2">
            <div className="relative">
              <Icon name="search" size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-lo pointer-events-none" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="材料名・ID・組成・メモで検索 (例: ステンレス, Inconel, Ti)"
                className="w-full pl-7 pr-7 py-1.5 text-[12px] bg-raised rounded border border-[var(--border-faint)] outline-none focus:border-accent"/>
              {q && (
                <button onClick={() => setQ('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-lo hover:text-text-hi">
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setCatFilter(null)}
                className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
                  catFilter === null ? 'bg-accent text-white border-accent' : 'bg-raised border-[var(--border-faint)] hover:bg-hover text-text-md'
                }`}>
                全カテゴリ ({db.length})
              </button>
              {(['金属合金','セラミクス','ポリマー','複合材料'] as const).map(cat => (
                <button key={cat} onClick={() => setCatFilter(catFilter === cat ? null : cat)}
                  className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
                    catFilter === cat ? 'bg-accent text-white border-accent' : 'bg-raised border-[var(--border-faint)] hover:bg-hover text-text-md'
                  }`}>
                  {cat} ({catCounts[cat] || 0})
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-text-lo self-center pr-1">結晶構造:</span>
              {(['FCC','BCC','HCP','AMORPHOUS','COMPOSITE','CERAMIC'] as const).map(lat => (
                <button key={lat} onClick={() => setLatFilter(latFilter === lat ? null : lat)}
                  className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
                    latFilter === lat ? 'bg-accent text-white border-accent' : 'bg-raised border-[var(--border-faint)] hover:bg-hover text-text-md'
                  }`}>
                  {lat}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-text-lo">
              {filtered.total} 件ヒット {q && `· "${q}"`}
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.groups.length === 0 && <div className="p-3 text-[11px] text-text-lo text-center">該当なし</div>}
            {filtered.groups.map(([cat, items]) => (
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
