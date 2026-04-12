/// <reference types="@react-three/fiber" />
/**
 * 結晶構造 3D ビューア (PoC / モックデータ)
 * Three.js + @react-three/fiber で BCC / FCC / HCP 原子配置をインタラクティブ可視化。
 * 格子歪みスライダーで圧縮・引張変形もリアルタイム表示。
 */
import { Suspense, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'

type Structure = 'BCC' | 'FCC' | 'HCP'

interface MatDef {
  id: string; name: string; structure: Structure
  a: number; c: number; color: string
  density: number; E: number; ys: number; uts: number; hv: number; tm: number
  desc: string
}

const MATS: MatDef[] = [
  {
    id: 'ti64', name: 'Ti-6Al-4V', structure: 'HCP',
    a: 2.95, c: 4.68, color: '#60a5fa',
    density: 4.43, E: 114, ys: 880, uts: 950, hv: 334, tm: 1660,
    desc: 'α+β型チタン合金。航空機エンジン ファン・コンプレッサーに使用。',
  },
  {
    id: 'in718', name: 'Inconel 718', structure: 'FCC',
    a: 3.60, c: 3.60, color: '#fbbf24',
    density: 8.19, E: 200, ys: 1100, uts: 1380, hv: 400, tm: 1336,
    desc: 'γ″析出強化 Ni 基超合金。タービンディスクに使用。',
  },
  {
    id: 'sus316', name: 'SUS316L', structure: 'FCC',
    a: 3.59, c: 3.59, color: '#94a3b8',
    density: 7.98, E: 193, ys: 290, uts: 580, hv: 180, tm: 1400,
    desc: 'オーステナイト系ステンレス鋼。耐食性・溶接性に優れる。',
  },
  {
    id: 's45c', name: 'S45C', structure: 'BCC',
    a: 2.87, c: 2.87, color: '#a8a29e',
    density: 7.85, E: 206, ys: 490, uts: 690, hv: 201, tm: 1515,
    desc: '機械構造用炭素鋼。汎用部品・金型・軸類に使用。',
  },
  {
    id: 'a7075', name: 'A7075-T6', structure: 'FCC',
    a: 4.05, c: 4.05, color: '#d4d4d8',
    density: 2.81, E: 72, ys: 503, uts: 572, hv: 150, tm: 635,
    desc: 'Al-Zn-Mg-Cu 系高強度アルミ合金。航空機構造部材に使用。',
  },
]

const N = 3 // スーパーセル繰り返し数
const SQRT3 = Math.sqrt(3)

function getAtoms(m: MatDef): [number, number, number][] {
  const { structure: s, a, c } = m
  const pts: [number, number, number][] = []

  if (s === 'BCC') {
    const basis: [number, number, number][] = [[0, 0, 0], [.5, .5, .5]]
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++)
      for (const [fx, fy, fz] of basis) pts.push([(i + fx) * a, (j + fy) * a, (k + fz) * a])

  } else if (s === 'FCC') {
    const basis: [number, number, number][] = [[0, 0, 0], [.5, .5, 0], [.5, 0, .5], [0, .5, .5]]
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++)
      for (const [fx, fy, fz] of basis) pts.push([(i + fx) * a, (j + fy) * a, (k + fz) * a])

  } else {
    // HCP: a1=(a,0,0), a2=(a/2,a√3/2,0), a3=(0,0,c)
    // 基底原子: (0,0,0) と (2a/3, a/√3, c/2)
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
      const ox = i * a + j * a / 2, oy = j * a * SQRT3 / 2, oz = k * c
      pts.push([ox, oy, oz])
      pts.push([ox + 2 * a / 3, oy + a * SQRT3 / 3, oz + c / 2])
    }
  }
  return pts
}

type Edge = [[number, number, number], [number, number, number]]

function getCellEdges(m: MatDef): Edge[] {
  const { structure: s, a, c } = m
  if (s !== 'HCP') {
    const v: [number, number, number][] = [
      [0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0],
      [0, 0, a], [a, 0, a], [a, a, a], [0, a, a],
    ]
    return [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
      .map(([i, j]) => [v[i!]!, v[j!]!] as Edge)
  }
  // HCP 菱形プリズム単位セル
  const vb: [number, number, number][] = [
    [0, 0, 0], [a, 0, 0], [a + a / 2, a * SQRT3 / 2, 0], [a / 2, a * SQRT3 / 2, 0],
  ]
  const vt = vb.map(([x, y]) => [x, y, c] as [number, number, number])
  const edges: Edge[] = []
  for (let i = 0; i < 4; i++) {
    edges.push([vb[i]!, vb[(i + 1) % 4]!])
    edges.push([vt[i]!, vt[(i + 1) % 4]!])
    edges.push([vb[i]!, vt[i]!])
  }
  return edges
}

function Atom({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.27, 14, 14]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.18} />
    </mesh>
  )
}

function Scene({ m, strain }: { m: MatDef; strain: number }) {
  const eff = useMemo(
    () => ({ ...m, a: m.a * (1 + strain / 100), c: m.c * (1 + strain / 100) }),
    [m, strain]
  )
  const atoms = useMemo(() => getAtoms(eff), [eff])
  const edges = useMemo(() => getCellEdges(eff), [eff])

  const center = useMemo((): [number, number, number] => {
    if (!atoms.length) return [0, 0, 0]
    const s = atoms.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0])
    return [s[0] / atoms.length, s[1] / atoms.length, s[2] / atoms.length]
  }, [atoms])

  return (
    <group position={[-center[0], -center[1], -center[2]]}>
      {atoms.map((p, i) => <Atom key={i} pos={p} color={m.color} />)}
      {edges.map(([p1, p2], i) => (
        <Line key={i} points={[p1, p2]} color="#eab308" lineWidth={1.5} />
      ))}
    </group>
  )
}

const STRUCT_CLS: Record<Structure, string> = {
  BCC: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  FCC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  HCP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}
const STRUCT_DESC: Record<Structure, string> = {
  BCC: '体心立方格子 — 2原子/セル',
  FCC: '面心立方格子 — 4原子/セル',
  HCP: '六方最密充填 — 2原子/セル (c/a≈1.633)',
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px] py-1.5 border-b border-[var(--border)] last:border-0">
      <span className="text-text-lo">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  )
}

export function Crystal3DPage() {
  const [selId, setSelId] = useState('ti64')
  const [strain, setStrain] = useState(0)
  const mat = MATS.find(m => m.id === selId)!

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h1 className="text-xl font-bold">結晶構造 3D ビューア</h1>
        <p className="text-sm text-text-lo mt-1">
          金属材料の原子配置を 3 次元でインタラクティブに可視化する PoC。
          格子歪みスライダーで圧縮・引張変形をシミュレート。
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* 左パネル: 材料選択 + 物性値 */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pb-2">
          <div className="text-[11px] font-semibold text-text-lo uppercase tracking-wider">材料選択</div>

          {MATS.map(m => (
            <button
              key={m.id}
              onClick={() => { setSelId(m.id); setStrain(0) }}
              className={`text-left p-2.5 rounded-lg border text-sm transition-all ${
                selId === m.id
                  ? 'border-accent bg-accent/10'
                  : 'border-[var(--border)] hover:border-accent/40 bg-[var(--bg-raised)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <span className="font-medium text-[13px]">{m.name}</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${STRUCT_CLS[m.structure]}`}>
                  {m.structure}
                </span>
              </div>
            </button>
          ))}

          {/* 物性値パネル */}
          <div className="text-[11px] font-semibold text-text-lo uppercase tracking-wider mt-1">物性値</div>
          <div className="rounded-lg bg-[var(--bg-raised)] p-3 text-sm">
            <p className="text-[11px] text-text-lo mb-2 leading-relaxed">{mat.desc}</p>
            <div className={`text-[11px] px-2 py-1 rounded border mb-3 font-medium ${STRUCT_CLS[mat.structure]}`}>
              {STRUCT_DESC[mat.structure]}
            </div>
            <PropRow label="格子定数 a" value={`${mat.a} Å`} />
            {mat.structure === 'HCP' && <>
              <PropRow label="格子定数 c" value={`${mat.c} Å`} />
              <PropRow label="c/a 比" value={(mat.c / mat.a).toFixed(3)} />
            </>}
            <PropRow label="密度" value={`${mat.density} g/cm³`} />
            <PropRow label="ヤング率" value={`${mat.E} GPa`} />
            <PropRow label="降伏応力" value={`${mat.ys} MPa`} />
            <PropRow label="引張強さ" value={`${mat.uts} MPa`} />
            <PropRow label="硬度" value={`${mat.hv} HV`} />
            <PropRow label="融点" value={`${mat.tm} °C`} />
          </div>

          {/* 格子歪みスライダー */}
          <div className="rounded-lg bg-[var(--bg-raised)] p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-semibold">格子歪み</span>
              <span className={`text-[12px] font-mono font-bold ${
                strain > 0 ? 'text-red-400' : strain < 0 ? 'text-blue-400' : 'text-text-lo'
              }`}>
                {strain > 0 ? '+' : ''}{strain.toFixed(1)}%
              </span>
            </div>
            <input
              type="range" min={-10} max={10} step={0.5} value={strain}
              onChange={e => setStrain(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-text-lo mt-1">
              <span>圧縮</span>
              <button onClick={() => setStrain(0)} className="hover:text-accent transition-colors">
                リセット
              </button>
              <span>引張</span>
            </div>
            {strain !== 0 && (
              <div className="mt-2 text-[11px] text-text-lo">
                a = {(mat.a * (1 + strain / 100)).toFixed(3)} Å
                {mat.structure === 'HCP' &&
                  <> · c = {(mat.c * (1 + strain / 100)).toFixed(3)} Å</>
                }
              </div>
            )}
          </div>

          {/* 凡例 */}
          <div className="rounded-lg bg-[var(--bg-raised)] p-3 text-[11px] text-text-lo">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-0.5 bg-yellow-400" />
              <span>単位セル輪郭 (黄)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: mat.color }} />
              <span>{mat.name} 原子 ({N}×{N}×{N} スーパーセル)</span>
            </div>
          </div>
        </div>

        {/* 3D キャンバス */}
        <div className="flex-1 rounded-xl overflow-hidden relative" style={{ minHeight: 400 }}>
          <Canvas
            camera={{ position: [8, 6, 8], fov: 45 }}
            gl={{ antialias: true }}
            dpr={[1, 2]}
            style={{ width: '100%', height: '100%' }}
          >
            <color attach="background" args={['#080c18']} />
            <fog attach="fog" args={['#080c18', 18, 40]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[10, 15, 5]} intensity={1.5} />
            <directionalLight position={[-8, -5, -10]} intensity={0.4} color="#8ab4f8" />
            <pointLight position={[0, 0, 0]} intensity={0.15} color={mat.color} />
            <Suspense fallback={null}>
              <Scene m={mat} strain={strain} />
            </Suspense>
            <OrbitControls autoRotate autoRotateSpeed={0.6} enableDamping dampingFactor={0.07} />
          </Canvas>

          {/* 構造バッジ (右上) */}
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className={`text-[11px] px-2.5 py-1 rounded-md border font-mono font-bold ${STRUCT_CLS[mat.structure]}`}>
              {mat.structure} · {mat.name}
            </span>
          </div>

          {/* 操作ガイド (下中央) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/30 pointer-events-none select-none whitespace-nowrap">
            ドラッグで回転 · スクロールでズーム · 右ドラッグでパン
          </div>
        </div>
      </div>
    </div>
  )
}
