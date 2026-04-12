/**
 * 結晶構造 3D ビューア — Scientific Instrument Panel デザイン
 * PoC: Three.js + @react-three/fiber / BCC · FCC · HCP 原子配置可視化
 */
import { Suspense, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'

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
  { id:'s45c',   name:'S45C',        structure:'BCC', a:2.87, c:2.87, color:'#a8a29e', density:7.85, E:206,  ys:490,  uts:690,  hv:201, tm:1515, desc:'機械構造用炭素鋼。汎用部品・金型・軸類に使用。' },
  { id:'a7075',  name:'A7075-T6',    structure:'FCC', a:4.05, c:4.05, color:'#e2e8f0', density:2.81, E:72,   ys:503,  uts:572,  hv:150, tm:635,  desc:'Al-Zn-Mg-Cu 系高強度アルミ合金。航空機構造部材に使用。' },
]

// ─── Three.js Logic ───────────────────────────────────────────

const N = 3
const SQRT3 = Math.sqrt(3)

function getAtoms(m: MatDef): [number,number,number][] {
  const { structure:s, a, c } = m
  const pts: [number,number,number][] = []
  if (s === 'BCC') {
    const basis: [number,number,number][] = [[0,0,0],[.5,.5,.5]]
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++)
      for (const [fx,fy,fz] of basis) pts.push([(i+fx)*a,(j+fy)*a,(k+fz)*a])
  } else if (s === 'FCC') {
    const basis: [number,number,number][] = [[0,0,0],[.5,.5,0],[.5,0,.5],[0,.5,.5]]
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++)
      for (const [fx,fy,fz] of basis) pts.push([(i+fx)*a,(j+fy)*a,(k+fz)*a])
  } else {
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) for (let k=0;k<N;k++) {
      const ox=i*a+j*a/2, oy=j*a*SQRT3/2, oz=k*c
      pts.push([ox,oy,oz])
      pts.push([ox+2*a/3, oy+a*SQRT3/3, oz+c/2])
    }
  }
  return pts
}

type Edge = [[number,number,number],[number,number,number]]

function getCellEdges(m: MatDef): Edge[] {
  const { structure:s, a, c } = m
  if (s !== 'HCP') {
    const v: [number,number,number][] = [
      [0,0,0],[a,0,0],[a,a,0],[0,a,0],[0,0,a],[a,0,a],[a,a,a],[0,a,a],
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

function Atom({ pos, color }: { pos:[number,number,number]; color:string }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.27,14,14]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.18} />
    </mesh>
  )
}

function Scene({ m, strain }: { m:MatDef; strain:number }) {
  const eff = useMemo(() => ({ ...m, a:m.a*(1+strain/100), c:m.c*(1+strain/100) }), [m,strain])
  const atoms = useMemo(() => getAtoms(eff), [eff])
  const edges = useMemo(() => getCellEdges(eff), [eff])
  const center = useMemo((): [number,number,number] => {
    if (!atoms.length) return [0,0,0]
    const s = atoms.reduce((acc,p) => [acc[0]+p[0],acc[1]+p[1],acc[2]+p[2]],[0,0,0])
    return [s[0]/atoms.length, s[1]/atoms.length, s[2]/atoms.length]
  }, [atoms])
  return (
    <group position={[-center[0],-center[1],-center[2]]}>
      {atoms.map((p,i) => <Atom key={i} pos={p} color={m.color} />)}
      {edges.map(([p1,p2],i) => <Line key={i} points={[p1,p2]} color="#e8a000" lineWidth={1.2} />)}
    </group>
  )
}

// ─── Design System ────────────────────────────────────────────

const C = {
  bg:     '#030912',
  panel:  '#050e1c',
  surf:   '#081828',
  border: '#0c2a3a',
  active: '#0b2033',
  dim:    '#1e4a5a',
  med:    '#4a7a90',
  hi:     '#8ec8e0',
  bright: '#00cfff',
  gold:   '#e8a000',
  red:    '#ff6060',
  blue:   '#4499ff',
}

const MONO = "'JetBrains Mono','IBM Plex Mono','Fira Code',monospace"

const STRUCT_COLOR: Record<Structure, string> = {
  BCC: C.gold, FCC: C.bright, HCP: '#a78bfa',
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
  density: [2, 9], E: [60, 220], ys: [200, 1200], uts: [500, 1500], hv: [100, 450], tm: [500, 1800],
}

function barPct(v:number, key:string): number {
  const [lo,hi] = PROP_RANGE[key]!
  return Math.max(2, Math.min(98, ((v-lo)/(hi-lo))*100))
}

// ─── Panel Sub-Components ─────────────────────────────────────

function PanelHeader({ children }: { children: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
      <span style={{ color:C.dim, fontSize:8, fontFamily:MONO }}>▸</span>
      <span style={{ color:C.med, fontSize:9, fontFamily:MONO, letterSpacing:'0.14em', textTransform:'uppercase' }}>
        {children}
      </span>
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  )
}

function SpecimenCard({ m, active, onClick }: { m:MatDef; active:boolean; onClick:()=>void }) {
  const sc = STRUCT_COLOR[m.structure]
  return (
    <button
      onClick={onClick}
      style={{
        width:'100%', textAlign:'left', padding:'7px 10px',
        background: active ? C.active : 'transparent',
        border: `1px solid ${active ? sc+'44' : C.border}`,
        borderLeft: `3px solid ${active ? sc : 'transparent'}`,
        borderRadius:4, cursor:'pointer', marginBottom:4,
        transition:'all 0.15s ease', position:'relative',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:14, lineHeight:1, color: active ? sc : C.dim, transition:'color 0.15s' }}>
          {STRUCT_GLYPH[m.structure]}
        </span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:MONO, fontSize:12, fontWeight:600, color: active ? C.hi : C.med, letterSpacing:'0.02em' }}>
            {m.name}
          </div>
          <div style={{ fontFamily:MONO, fontSize:9, color: active ? sc : C.dim, marginTop:1 }}>
            {m.structure} · a={m.a}Å{m.structure==='HCP'?` · c=${m.c}Å`:''}
          </div>
        </div>
        {active && (
          <div style={{ width:4, height:4, borderRadius:'50%', background:sc, boxShadow:`0 0 6px ${sc}` }} />
        )}
      </div>
    </button>
  )
}

function PropReadout({ sym, value, unit, rangeKey, color }: {
  sym:string; value:number; unit:string; rangeKey:string; color:string
}) {
  const p = barPct(value, rangeKey)
  const display = value >= 100 ? value.toFixed(0) : value.toFixed(2)
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:0 }}>
        <span style={{ fontFamily:MONO, fontSize:10, color:C.dim, width:28, flexShrink:0 }}>{sym}</span>
        <span style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color, letterSpacing:'-0.02em', minWidth:52 }}>
          {display}
        </span>
        <span style={{ fontFamily:MONO, fontSize:9, color:C.med }}>{unit}</span>
      </div>
      <div style={{ height:2, background:C.border, borderRadius:1, marginTop:4, marginLeft:28 }}>
        <div style={{ height:'100%', width:`${p}%`, background:color, borderRadius:1, opacity:0.7,
          transition:'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function LatticeReadout({ m, strain }: { m:MatDef; strain:number }) {
  const a = (m.a * (1 + strain/100)).toFixed(4)
  const c = (m.c * (1 + strain/100)).toFixed(4)
  const ca = (m.c / m.a).toFixed(4)
  return (
    <div style={{ fontFamily:MONO, fontSize:11 }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:`1px solid ${C.border}` }}>
        <span style={{ color:C.med }}>a</span>
        <span style={{ color:C.bright }}>{a} <span style={{ color:C.dim, fontSize:9 }}>Å</span></span>
      </div>
      {m.structure === 'HCP' && <>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:`1px solid ${C.border}` }}>
          <span style={{ color:C.med }}>c</span>
          <span style={{ color:C.bright }}>{c} <span style={{ color:C.dim, fontSize:9 }}>Å</span></span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:`1px solid ${C.border}` }}>
          <span style={{ color:C.med }}>c/a</span>
          <span style={{ color:STRUCT_COLOR['HCP'] }}>{ca}</span>
        </div>
      </>}
    </div>
  )
}

// ─── Instrument Panel ─────────────────────────────────────────

function InstrumentPanel({ mat, strain, selId, onSelect, onStrain }: {
  mat: MatDef; strain: number; selId: string;
  onSelect: (id:string)=>void; onStrain: (v:number)=>void
}) {
  const sc = STRUCT_COLOR[mat.structure]
  const strainSign = strain > 0 ? '+' : ''
  return (
    <div style={{
      width:220, flexShrink:0, height:'100%', overflowY:'auto',
      background:C.panel, borderRight:`1px solid ${C.border}`,
      padding:'12px 10px', display:'flex', flexDirection:'column', gap:14,
    }}>
      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:10 }}>
        <div style={{ fontFamily:MONO, fontSize:9, color:C.dim, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:4 }}>
          Matlens / XRD Analyzer
        </div>
        <div style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:C.hi, letterSpacing:'0.04em' }}>
          結晶構造ビューア
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#00ff7f', boxShadow:'0 0 8px #00ff7f' }} />
          <span style={{ fontFamily:MONO, fontSize:9, color:'#00ff7f' }}>SPECIMEN LOADED</span>
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

      {/* Current specimen info */}
      <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:4, padding:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <span style={{ fontSize:18, color:sc }}>{STRUCT_GLYPH[mat.structure]}</span>
          <div>
            <div style={{ fontFamily:MONO, fontSize:11, fontWeight:700, color:C.hi }}>{mat.name}</div>
            <div style={{ fontFamily:MONO, fontSize:9, color:sc }}>{STRUCT_LABEL[mat.structure]}</div>
          </div>
        </div>
        <div style={{ fontFamily:MONO, fontSize:9, color:C.med, lineHeight:1.6 }}>{mat.desc}</div>
      </div>

      {/* Lattice parameters */}
      <div>
        <PanelHeader>LATTICE PARAMS</PanelHeader>
        <LatticeReadout m={mat} strain={strain} />
        {strain !== 0 && (
          <div style={{ marginTop:6, fontFamily:MONO, fontSize:9, color: strain>0?C.red:C.blue,
            padding:'3px 6px', background: strain>0?'#ff000012':'#4499ff12', borderRadius:3 }}>
            ε = {strainSign}{strain.toFixed(1)}% {strain>0?'(引張)':'(圧縮)'}
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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
          <span style={{ fontFamily:MONO, fontSize:9, color:C.med }}>ε (lattice strain)</span>
          <span style={{ fontFamily:MONO, fontSize:14, fontWeight:700,
            color: strain>0?C.red : strain<0?C.blue : C.dim }}>
            {strainSign}{strain.toFixed(1)}<span style={{ fontSize:10 }}>%</span>
          </span>
        </div>
        <input
          type="range" min={-10} max={10} step={0.5} value={strain}
          onChange={e => onStrain(Number(e.target.value))}
          style={{ width:'100%', accentColor:strain>0?C.red:strain<0?C.blue:C.med, marginBottom:4 }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:MONO, fontSize:8, color:C.dim }}>
          <span>−10%</span>
          <button
            onClick={() => onStrain(0)}
            style={{ background:'none', border:'none', color:C.med, cursor:'pointer',
              fontFamily:MONO, fontSize:8, padding:0 }}
          >
            ZERO
          </button>
          <span>+10%</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop:'auto', borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <div style={{ width:16, height:1, background:C.gold }} />
          <span style={{ fontFamily:MONO, fontSize:8, color:C.dim }}>UNIT CELL</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:mat.color }} />
          <span style={{ fontFamily:MONO, fontSize:8, color:C.dim }}>
            {mat.name} · {N}³ supercell
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Canvas HUD Overlays ──────────────────────────────────────

function CanvasHUD({ mat, strain }: { mat:MatDef; strain:number }) {
  const sc = STRUCT_COLOR[mat.structure]
  const hudStyle: React.CSSProperties = {
    position:'absolute', pointerEvents:'none', fontFamily:MONO,
    textShadow:'0 0 10px currentColor',
  }
  const aEff = (mat.a * (1 + strain/100)).toFixed(3)
  const cEff = (mat.c * (1 + strain/100)).toFixed(3)
  return <>
    {/* Top-left: axes info */}
    <div style={{ ...hudStyle, top:12, left:12, fontSize:9, color:C.dim, lineHeight:1.8 }}>
      <div>X ─── [100]</div>
      <div>Y ─── [010]</div>
      <div>Z ─── [001]</div>
    </div>

    {/* Top-right: structure badge */}
    <div style={{ ...hudStyle, top:12, right:12, textAlign:'right' }}>
      <div style={{ fontSize:22, color:sc, lineHeight:1 }}>{STRUCT_GLYPH[mat.structure]}</div>
      <div style={{ fontSize:10, fontWeight:700, color:sc, letterSpacing:'0.1em' }}>{mat.structure}</div>
      <div style={{ fontSize:9, color:C.med, marginTop:2 }}>{mat.name}</div>
    </div>

    {/* Bottom-left: live lattice */}
    <div style={{ ...hudStyle, bottom:28, left:12, fontSize:9, color:C.bright, lineHeight:1.8 }}>
      <div>a = {aEff} Å</div>
      {mat.structure === 'HCP' && <div>c = {cEff} Å</div>}
    </div>

    {/* Bottom-center: controls */}
    <div style={{ ...hudStyle, bottom:10, left:'50%', transform:'translateX(-50%)',
      fontSize:9, color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap' }}>
      DRAG · ROTATE &nbsp;|&nbsp; SCROLL · ZOOM &nbsp;|&nbsp; RIGHT-DRAG · PAN
    </div>

    {/* Bottom-right: atom count */}
    <div style={{ ...hudStyle, bottom:28, right:12, fontSize:9, color:C.dim, textAlign:'right' }}>
      <div>{N}³ supercell</div>
      <div style={{ color:C.med }}>{N*N*N * (mat.structure==='BCC'?2:mat.structure==='HCP'?2:4)} atoms</div>
    </div>
  </>
}

// ─── Page ─────────────────────────────────────────────────────

export function Crystal3DPage() {
  const [selId, setSelId] = useState('ti64')
  const [strain, setStrain] = useState(0)
  const mat = MATS.find(m => m.id === selId)!

  return (
    <div style={{ display:'flex', height:'100%', minHeight:0, background:C.bg,
      borderRadius:8, overflow:'hidden', border:`1px solid ${C.border}` }}>
      {/* ── Instrument Panel ── */}
      <InstrumentPanel
        mat={mat} strain={strain} selId={selId}
        onSelect={setSelId} onStrain={setStrain}
      />

      {/* ── 3D Viewport ── */}
      <div style={{ flex:1, position:'relative', minHeight:400 }}>
        <Canvas
          camera={{ position:[8,6,8], fov:45 }}
          gl={{ antialias:true }}
          dpr={[1,2]}
          style={{ width:'100%', height:'100%' }}
        >
          <color attach="background" args={['#030912']} />
          <fog attach="fog" args={['#030912', 18, 42]} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10,15,5]} intensity={1.6} />
          <directionalLight position={[-8,-5,-10]} intensity={0.5} color="#4499ff" />
          <pointLight position={[0,0,0]} intensity={0.2} color={mat.color} />
          <Suspense fallback={null}>
            <Scene m={mat} strain={strain} />
          </Suspense>
          <OrbitControls autoRotate autoRotateSpeed={0.5} enableDamping dampingFactor={0.07} />
        </Canvas>
        <CanvasHUD mat={mat} strain={strain} />
      </div>
    </div>
  )
}
