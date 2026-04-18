/**
 * 結晶構造 3D ビューア — Scientific Instrument Panel
 * PoC: Three.js + @react-three/fiber / BCC · FCC · HCP 原子配置可視化
 * 修正: min-font 12px / 余白改善 / N=2 + 結合線追加
 */
import { Suspense, useState, useMemo, createContext, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../../hooks/useTheme/useTheme'

// ─── Types & Data ─────────────────────────────────────────────

type Structure = 'BCC' | 'FCC' | 'HCP'

interface MatDef {
  id: string; name: string; structure: Structure
  a: number; c: number; color: string
  density: number; E: number; ys: number; uts: number; hv: number; tm: number
  desc: string
}

const MATS: MatDef[] = [
  { id:'ti64',   name:'Ti-6Al-4V',   structure:'HCP', a:2.95, c:4.68, color:'#60a5fa', density:4.43, E:114,  ys:880,  uts:950,  hv:334, tm:1660, desc:'α+β型チタン合金。航空機エンジン ファン・コンプレッサーに使用。' },
  { id:'in718',  name:'Inconel 718', structure:'FCC', a:3.60, c:3.60, color:'#fbbf24', density:8.19, E:200,  ys:1100, uts:1380, hv:400, tm:1336, desc:'γ″析出強化 Ni 基超合金。タービンディスクに使用。' },
  { id:'sus316', name:'SUS316L',     structure:'FCC', a:3.59, c:3.59, color:'#94a3b8', density:7.98, E:193,  ys:290,  uts:580,  hv:180, tm:1400, desc:'オーステナイト系ステンレス鋼。耐食性・溶接性に優れる。' },
  { id:'s45c',   name:'S45C',        structure:'BCC', a:2.87, c:2.87, color:'#c0b090', density:7.85, E:206,  ys:490,  uts:690,  hv:201, tm:1515, desc:'機械構造用炭素鋼。汎用部品・金型・軸類に使用。' },
  { id:'a7075',  name:'A7075-T6',    structure:'FCC', a:4.05, c:4.05, color:'#d8dfe8', density:2.81, E:72,   ys:503,  uts:572,  hv:150, tm:635,  desc:'Al-Zn-Mg-Cu 系高強度アルミ合金。航空機構造部材に使用。' },
]

// ─── Three.js Logic ───────────────────────────────────────────

const N = 2  // 2×2×2 スーパーセル (原子少なめ = 構造が見やすい)
const SQRT3 = Math.sqrt(3)

function getAtoms(m: MatDef): [number,number,number][] {
  const { structure:s, a, c } = m
  const pts: [number,number,number][] = []
  if (s === 'BCC') {
    // z 方向は c を使用 (ひずみ時に a≠c の正方晶になる)
    const basis: [number,number,number][] = [[0,0,0],[.5,.5,.5]]
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++)
      for (const [fx,fy,fz] of basis) pts.push([(i+fx)*a,(j+fy)*a,(k+fz)*c])
  } else if (s === 'FCC') {
    const basis: [number,number,number][] = [[0,0,0],[.5,.5,0],[.5,0,.5],[0,.5,.5]]
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++)
      for (const [fx,fy,fz] of basis) pts.push([(i+fx)*a,(j+fy)*a,(k+fz)*c])
  } else {
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++) {
      const ox=i*a+j*a/2, oy=j*a*SQRT3/2, oz=k*c
      pts.push([ox,oy,oz])
      pts.push([ox+2*a/3, oy+a*SQRT3/3, oz+c/2])
    }
  }
  return pts
}

// 最近傍距離カットオフ (ひずみ後の a,c を考慮して大きい方基準)
function getNNCutoff(m: MatDef): number {
  const aMax = Math.max(m.a, m.c)
  if (m.structure === 'BCC') return aMax * Math.sqrt(3) / 2 * 1.15
  if (m.structure === 'FCC') return aMax / Math.sqrt(2) * 1.15
  return aMax * 1.25  // HCP
}

// 結合ペアを列挙
function getBonds(atoms: [number,number,number][], cutoff: number) {
  const c2 = cutoff * cutoff
  const segs: number[] = []
  for (let i=0; i<atoms.length; i++) {
    for (let j=i+1; j<atoms.length; j++) {
      const a=atoms[i]!, b=atoms[j]!
      const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2]
      if (dx*dx+dy*dy+dz*dz <= c2) {
        segs.push(a[0],a[1],a[2], b[0],b[1],b[2])
      }
    }
  }
  return segs
}

type Edge = [[number,number,number],[number,number,number]]

function getCellEdges(m: MatDef): Edge[] {
  const { structure:s, a, c } = m
  if (s !== 'HCP') {
    // ひずみ時は z 方向が c (≠ a) になる
    const v: [number,number,number][] = [
      [0,0,0],[a,0,0],[a,a,0],[0,a,0],[0,0,c],[a,0,c],[a,a,c],[0,a,c],
    ]
    return [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
      .map(([i,j]) => [v[i!]!, v[j!]!] as Edge)
  }
  const vb: [number,number,number][] = [
    [0,0,0],[a,0,0],[a+a/2,a*SQRT3/2,0],[a/2,a*SQRT3/2,0],
  ]
  const vt = vb.map(([x,y]) => [x,y,c] as [number,number,number])
  const edges: Edge[] = []
  for (let i=0;i<4;i++) {
    edges.push([vb[i]!,vb[(i+1)%4]!])
    edges.push([vt[i]!,vt[(i+1)%4]!])
    edges.push([vb[i]!,vt[i]!])
  }
  return edges
}

// ─── Three.js Components ──────────────────────────────────────

// 引張/圧縮方向を示す矢印 (Z軸上下)
function StrainArrows({ strain, halfZ }: { strain: number; halfZ: number }) {
  if (strain === 0) return null
  const isTension = strain > 0
  const col = isTension ? '#ff6060' : '#4499ff'
  const r = 0.18, h = 0.55, gap = 0.7
  const zPos = halfZ + gap + h / 2
  // tension: top→+Z out, bottom→-Z out  /  compression: top→-Z in, bottom→+Z in
  const topRot: [number, number, number] = isTension ? [-Math.PI / 2, 0, 0] : [Math.PI / 2, 0, 0]
  const botRot: [number, number, number] = isTension ? [Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, 0]
  return (
    <group>
      <mesh position={[0, 0, zPos]} rotation={topRot}>
        <coneGeometry args={[r, h, 10]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0, -zPos]} rotation={botRot}>
        <coneGeometry args={[r, h, 10]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

function Atom({ pos, color }: { pos:[number,number,number]; color:string }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.20, 16, 16]} />
      <meshStandardMaterial color={color} metalness={0.75} roughness={0.20} />
    </mesh>
  )
}

// 全結合を単一 LineSegments で描画 (描画コール1回)
function BondMesh({ segs, color, opacity }: { segs: number[]; color: string; opacity: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3))
    return geo
  }, [segs])
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} opacity={opacity} transparent />
    </lineSegments>
  )
}

// 単位セル輪郭 (単一 LineSegments)
function CellOutline({ edges, color }: { edges: Edge[]; color: string }) {
  const geometry = useMemo(() => {
    const pts = edges.flatMap(([a,b]) => [...a,...b])
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [edges])
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={1} />
    </lineSegments>
  )
}

function Scene({ m, strain, bondOpacity, cellEdgeColor }: { m:MatDef; strain:number; bondOpacity:number; cellEdgeColor:string }) {
  // 一軸ひずみ: Z 伸長 + ポアソン収縮 (ν≈0.3) で形状変化が視覚的に明確に
  const eff = useMemo(() => ({
    ...m,
    a: m.a * (1 - 0.30 * strain / 100),  // 横方向: 収縮
    c: m.c * (1 + strain / 100),           // Z軸: 伸長/圧縮
  }), [m, strain])
  const atoms = useMemo(() => getAtoms(eff), [eff])
  const edges = useMemo(() => getCellEdges(eff), [eff])
  const bondSegs = useMemo(() => getBonds(atoms, getNNCutoff(eff)), [atoms, eff])

  const center = useMemo((): [number,number,number] => {
    if (!atoms.length) return [0,0,0]
    const s = atoms.reduce((acc,p) => [acc[0]+p[0],acc[1]+p[1],acc[2]+p[2]],[0,0,0])
    return [s[0]/atoms.length, s[1]/atoms.length, s[2]/atoms.length]
  }, [atoms])

  // セル中心から最遠原子の Z 距離 (矢印配置用)
  const halfZ = useMemo(() => {
    if (!atoms.length) return 3
    const zs = atoms.map(p => p[2])
    const mean = zs.reduce((a, b) => a + b, 0) / zs.length
    return Math.max(...zs.map(z => Math.abs(z - mean))) + 0.25
  }, [atoms])

  const offset: [number,number,number] = [-center[0],-center[1],-center[2]]

  return (
    <>
      <group position={offset}>
        {atoms.map((p,i) => <Atom key={i} pos={p} color={m.color} />)}
        <BondMesh segs={bondSegs} color={m.color} opacity={bondOpacity} />
        <CellOutline edges={edges} color={cellEdgeColor} />
      </group>
      {/* 一軸ひずみ方向矢印 (引張=赤, 圧縮=青) */}
      <StrainArrows strain={strain} halfZ={halfZ} />
    </>
  )
}

// ─── Design Constants ─────────────────────────────────────────

type Palette = {
  bg: string; panel: string; surf: string; border: string; active: string;
  dim: string; med: string; hi: string; bright: string; gold: string;
  red: string; blue: string; cellEdge: string; fogNear: number; fogFar: number;
  ambient: number; dirMain: number; dirFill: number; bondOpacity: number;
}

const DARK: Palette = {
  bg:     '#030912',
  panel:  '#050e1c',
  surf:   '#0b1e2e',
  border: '#1a3d54',
  active: '#0f2740',
  dim:    '#8aa5b8',
  med:    '#b0cfe0',
  hi:     '#e5f4fb',
  bright: '#38d9ff',
  gold:   '#ffc04a',
  red:    '#ff7a7a',
  blue:   '#6bb0ff',
  cellEdge: '#ffc04a',
  fogNear: 16, fogFar: 38,
  ambient: 0.30, dirMain: 1.6, dirFill: 0.5, bondOpacity: 0.55,
}

const LIGHT: Palette = {
  bg:     '#eef2f7',
  panel:  '#ffffff',
  surf:   '#f3f6fa',
  border: '#c8d2dd',
  active: '#e3ecf5',
  dim:    '#6a7888',
  med:    '#344152',
  hi:     '#0b1b2a',
  bright: '#0369a1',
  gold:   '#a16207',
  red:    '#b91c1c',
  blue:   '#1d4ed8',
  cellEdge: '#92400e',
  fogNear: 22, fogFar: 60,
  ambient: 0.85, dirMain: 1.1, dirFill: 0.35, bondOpacity: 0.55,
}

const PaletteCtx = createContext<Palette>(DARK)
const useC = () => useContext(PaletteCtx)

function usePalette(): Palette {
  const { theme } = useTheme()
  return theme === 'light' ? LIGHT : DARK
}

const MONO = "'JetBrains Mono','IBM Plex Mono','Fira Code',monospace"

const STRUCT_COLOR: Record<Structure, string> = {
  BCC: '#ffc04a', FCC: '#0ea5e9', HCP: '#a78bfa',
}
const STRUCT_GLYPH: Record<Structure, string> = {
  BCC: '⊕', FCC: '⊞', HCP: '⬡',
}
const STRUCT_LABEL: Record<Structure, string> = {
  BCC: '体心立方 · 2原子/cell',
  FCC: '面心立方 · 4原子/cell',
  HCP: '六方最密 · 2原子/cell',
}

const PROP_RANGE: Record<string,[number,number]> = {
  density:[2,9], E:[60,220], ys:[200,1200], uts:[500,1500], hv:[100,450], tm:[500,1800],
}

function barPct(v:number, key:string): number {
  const [lo,hi] = PROP_RANGE[key]!
  return Math.max(3, Math.min(97, ((v-lo)/(hi-lo))*100))
}

// ─── Panel Sub-Components ─────────────────────────────────────

function PanelHeader({ children }: { children: string }) {
  const C = useC()
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
      <span style={{ color:C.dim, fontSize:12, fontFamily:MONO }}>▸</span>
      <span style={{ color:C.med, fontSize:12, fontFamily:MONO, letterSpacing:'0.12em', textTransform:'uppercase' }}>
        {children}
      </span>
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  )
}

function SpecimenCard({ m, active, onClick }: { m:MatDef; active:boolean; onClick:()=>void }) {
  const C = useC()
  const sc = STRUCT_COLOR[m.structure]
  return (
    <button
      onClick={onClick}
      style={{
        width:'100%', textAlign:'left', padding:'8px 12px',
        background: active ? C.active : 'transparent',
        border: `1px solid ${active ? sc+'55' : C.border}`,
        borderLeft: `3px solid ${active ? sc : 'transparent'}`,
        borderRadius:4, cursor:'pointer', marginBottom:6,
        transition:'all 0.15s ease',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:16, lineHeight:1, color: active ? sc : C.dim, transition:'color 0.15s' }}>
          {STRUCT_GLYPH[m.structure]}
        </span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:MONO, fontSize:13, fontWeight:600, color: active ? C.hi : C.med }}>
            {m.name}
          </div>
          <div style={{ fontFamily:MONO, fontSize:12, color: active ? sc : C.dim, marginTop:2 }}>
            {m.structure} · a={m.a}Å{m.structure==='HCP'?` · c=${m.c}Å`:''}
          </div>
        </div>
        {active && (
          <div style={{ width:5, height:5, borderRadius:'50%', background:sc, boxShadow:`0 0 6px ${sc}`, flexShrink:0 }} />
        )}
      </div>
    </button>
  )
}

function PropReadout({ sym, value, unit, rangeKey, color }: {
  sym:string; value:number; unit:string; rangeKey:string; color:string
}) {
  const C = useC()
  const p = barPct(value, rangeKey)
  const display = value >= 100 ? value.toFixed(0) : value.toFixed(2)
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:0 }}>
        <span style={{ fontFamily:MONO, fontSize:12, color:C.dim, width:28, flexShrink:0 }}>{sym}</span>
        <span style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color, letterSpacing:'-0.02em', minWidth:54 }}>
          {display}
        </span>
        <span style={{ fontFamily:MONO, fontSize:12, color:C.med }}>{unit}</span>
      </div>
      <div style={{ height:2, background:C.border, borderRadius:1, marginTop:5, marginLeft:28 }}>
        <div style={{ height:'100%', width:`${p}%`, background:color, borderRadius:1, opacity:0.65,
          transition:'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function LatticeReadout({ m, strain }: { m:MatDef; strain:number }) {
  const C = useC()
  const aEff = m.a * (1 - 0.30 * strain / 100)
  const cEff = m.c * (1 + strain / 100)
  const showC = m.structure === 'HCP' || strain !== 0
  return (
    <div style={{ fontFamily:MONO, fontSize:12 }}>
      {[
        { lbl:'a', val:aEff.toFixed(4), unit:'Å', color:C.bright },
        ...(showC ? [
          { lbl:'c', val:cEff.toFixed(4), unit:'Å', color:C.bright },
          { lbl:'c/a', val:(cEff/aEff).toFixed(4), unit:'', color:STRUCT_COLOR[m.structure] },
        ] : []),
      ].map(row => (
        <div key={row.lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline',
          padding:'5px 0', borderBottom:`1px solid ${C.border}` }}>
          <span style={{ color:C.med }}>{row.lbl}</span>
          <span style={{ color:row.color, fontWeight:600 }}>
            {row.val} <span style={{ color:C.dim, fontSize:12, fontWeight:400 }}>{row.unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Instrument Panel ─────────────────────────────────────────

function InstrumentPanel({ mat, strain, selId, onSelect, onStrain }: {
  mat:MatDef; strain:number; selId:string;
  onSelect:(id:string)=>void; onStrain:(v:number)=>void
}) {
  const C = useC()
  const sc = STRUCT_COLOR[mat.structure]
  const strSign = strain > 0 ? '+' : ''
  return (
    <div style={{
      width:240, flexShrink:0, height:'100%', overflowY:'auto',
      background:C.panel, borderRight:`1px solid ${C.border}`,
      padding:'16px 14px', display:'flex', flexDirection:'column', gap:20,
    }}>
      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:14 }}>
        <div style={{ fontFamily:MONO, fontSize:12, color:C.dim, letterSpacing:'0.18em',
          textTransform:'uppercase', marginBottom:6 }}>
          Matlens / XRD Analyzer
        </div>
        <div style={{ fontFamily:MONO, fontSize:15, fontWeight:700, color:C.hi, letterSpacing:'0.04em' }}>
          結晶構造ビューア
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#00ff7f', boxShadow:'0 0 8px #00ff7f' }} />
          <span style={{ fontFamily:MONO, fontSize:12, color:'#00ff7f' }}>SPECIMEN LOADED</span>
        </div>
      </div>

      {/* Specimen selector */}
      <div>
        <PanelHeader>SPECIMEN</PanelHeader>
        {MATS.map(m => (
          <SpecimenCard key={m.id} m={m} active={selId===m.id}
            onClick={() => { onSelect(m.id); onStrain(0) }} />
        ))}
      </div>

      {/* Current specimen info card */}
      <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:6, padding:'12px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:20, color:sc }}>{STRUCT_GLYPH[mat.structure]}</span>
          <div>
            <div style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:C.hi }}>{mat.name}</div>
            <div style={{ fontFamily:MONO, fontSize:12, color:sc, marginTop:2 }}>{STRUCT_LABEL[mat.structure]}</div>
          </div>
        </div>
        <div style={{ fontFamily:MONO, fontSize:12, color:C.med, lineHeight:1.7 }}>{mat.desc}</div>
      </div>

      {/* Lattice parameters */}
      <div>
        <PanelHeader>LATTICE PARAMS</PanelHeader>
        <LatticeReadout m={mat} strain={strain} />
        {strain !== 0 && (
          <div style={{ marginTop:8, fontFamily:MONO, fontSize:12, color:strain>0?C.red:C.blue,
            padding:'5px 8px', background:strain>0?'#ff000014':'#4499ff14', borderRadius:4 }}>
            ε = {strSign}{strain.toFixed(1)}% {strain>0?'(引張)':'(圧縮)'}
          </div>
        )}
      </div>

      {/* Mechanical properties */}
      <div>
        <PanelHeader>MECH. PROPERTIES</PanelHeader>
        <PropReadout sym="ρ"  value={mat.density} unit="g/cm³" rangeKey="density" color={sc} />
        <PropReadout sym="E"  value={mat.E}       unit="GPa"   rangeKey="E"       color={C.bright} />
        <PropReadout sym="σy" value={mat.ys}      unit="MPa"   rangeKey="ys"      color={C.hi} />
        <PropReadout sym="σu" value={mat.uts}     unit="MPa"   rangeKey="uts"     color={C.hi} />
        <PropReadout sym="HV" value={mat.hv}      unit="HV"    rangeKey="hv"      color={C.gold} />
        <PropReadout sym="Tm" value={mat.tm}      unit="°C"    rangeKey="tm"      color="#ff8866" />
      </div>

      {/* Strain control */}
      <div>
        <PanelHeader>STRAIN CONTROL</PanelHeader>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
          <span style={{ fontFamily:MONO, fontSize:12, color:C.med }}>ε (lattice strain)</span>
          <span style={{ fontFamily:MONO, fontSize:16, fontWeight:700,
            color:strain>0?C.red : strain<0?C.blue : C.dim }}>
            {strSign}{strain.toFixed(1)}<span style={{ fontSize:12 }}>%</span>
          </span>
        </div>
        <input
          type="range" min={-30} max={30} step={1} value={strain}
          onChange={e => onStrain(Number(e.target.value))}
          style={{ width:'100%', accentColor:strain>0?C.red:strain<0?C.blue:C.med, marginBottom:6 }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:MONO, fontSize:12, color:C.dim }}>
          <span>−30%</span>
          <button
            onClick={() => onStrain(0)}
            style={{ background:'none', border:'none', color:C.med, cursor:'pointer',
              fontFamily:MONO, fontSize:12, padding:0 }}
          >
            ZERO
          </button>
          <span>+30%</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop:'auto', borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:18, height:1, background:C.gold }} />
          <span style={{ fontFamily:MONO, fontSize:12, color:C.dim }}>UNIT CELL</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:mat.color }} />
          <span style={{ fontFamily:MONO, fontSize:12, color:C.dim }}>{mat.name} atoms</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:18, height:1, background:mat.color, opacity:0.45 }} />
          <span style={{ fontFamily:MONO, fontSize:12, color:C.dim }}>bonds ({N}³ supercell)</span>
        </div>
      </div>
    </div>
  )
}

// ─── Canvas HUD ───────────────────────────────────────────────

function CanvasHUD({ mat, strain }: { mat:MatDef; strain:number }) {
  const C = useC()
  const sc = STRUCT_COLOR[mat.structure]
  const hud: React.CSSProperties = {
    position:'absolute', pointerEvents:'none',
    fontFamily:MONO, textShadow:'0 0 12px currentColor',
  }
  const aEff = (mat.a*(1+strain/100)).toFixed(3)
  const cEff = (mat.c*(1+strain/100)).toFixed(3)
  const atomCount = N*N*N * (mat.structure==='FCC'?4:2)
  return <>
    {/* Top-left: axes */}
    <div style={{ ...hud, top:14, left:14, fontSize:12, color:C.dim, lineHeight:2 }}>
      <div>X ─── [100]</div>
      <div>Y ─── [010]</div>
      <div>Z ─── [001]</div>
    </div>

    {/* Top-right: structure badge */}
    <div style={{ ...hud, top:14, right:14, textAlign:'right' }}>
      <div style={{ fontSize:24, color:sc, lineHeight:1 }}>{STRUCT_GLYPH[mat.structure]}</div>
      <div style={{ fontSize:13, fontWeight:700, color:sc, letterSpacing:'0.1em', marginTop:2 }}>{mat.structure}</div>
      <div style={{ fontSize:12, color:C.med, marginTop:2 }}>{mat.name}</div>
    </div>

    {/* Bottom-left: live lattice */}
    <div style={{ ...hud, bottom:30, left:14, fontSize:12, color:C.bright, lineHeight:2 }}>
      <div>a = {aEff} Å</div>
      {(mat.structure==='HCP' || strain !== 0) && <div>c = {cEff} Å</div>}
    </div>

    {/* Bottom-center: controls */}
    <div style={{ ...hud, bottom:12, left:'50%', transform:'translateX(-50%)',
      fontSize:12, color:C.med, whiteSpace:'nowrap' }}>
      DRAG · ROTATE &nbsp;|&nbsp; SCROLL · ZOOM &nbsp;|&nbsp; RIGHT-DRAG · PAN
    </div>

    {/* Bottom-right: stats */}
    <div style={{ ...hud, bottom:30, right:14, fontSize:12, color:C.dim, textAlign:'right', lineHeight:2 }}>
      <div>{N}³ supercell</div>
      <div style={{ color:C.med }}>{atomCount} atoms</div>
    </div>
  </>
}

// ─── Page ─────────────────────────────────────────────────────

export function Crystal3DPage() {
  const [selId, setSelId] = useState('ti64')
  const [strain, setStrain] = useState(0)
  const mat = MATS.find(m => m.id === selId)!
  const C = usePalette()

  return (
    <PaletteCtx.Provider value={C}>
      <div style={{ display:'flex', height:'100%', minHeight:0, background:C.bg,
        borderRadius:8, overflow:'hidden', border:`1px solid ${C.border}` }}>
        {/* Instrument Panel */}
        <InstrumentPanel
          mat={mat} strain={strain} selId={selId}
          onSelect={setSelId} onStrain={setStrain}
        />

        {/* 3D Viewport */}
        <div style={{ flex:1, position:'relative', minHeight:400 }}>
          <Canvas
            camera={{ position:[7,5,9], fov:48 }}
            gl={{ antialias:true }}
            dpr={[1,2]}
            style={{ width:'100%', height:'100%' }}
          >
            <color attach="background" args={[C.bg]} />
            <fog attach="fog" args={[C.bg, C.fogNear, C.fogFar]} />
            <ambientLight intensity={C.ambient} />
            <directionalLight position={[10,14,6]} intensity={C.dirMain} />
            <directionalLight position={[-8,-6,-10]} intensity={C.dirFill} color={C.blue} />
            <pointLight position={[0,0,0]} intensity={0.25} color={mat.color} />
            <Suspense fallback={null}>
              <Scene m={mat} strain={strain} bondOpacity={C.bondOpacity} cellEdgeColor={C.cellEdge} />
            </Suspense>
            <OrbitControls autoRotate autoRotateSpeed={0.3} enableDamping dampingFactor={0.07} />
          </Canvas>
          <CanvasHUD mat={mat} strain={strain} />
        </div>
      </div>
    </PaletteCtx.Provider>
  )
}
