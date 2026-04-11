/**
 * PetriNetPage — 金属試験ワークフローの Petri net 可視化
 *
 * P/T net セマンティクス:
 *   Place (丸) = 状態バッファ。内部のトークン (●) がサンプルの所在を表す。
 *   Transition (四角) = 工程操作。全入力 place にトークンがあり capacity を
 *     超えない場合に発火可能。
 *   フィードバックループ (再加工 t4) は DAG で表現不可 → Petri net 採用の決定理由。
 */

import { useState, useReducer, useMemo, type KeyboardEvent } from 'react'
import { Button, Badge, Card } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import {
  METAL_TEST_WORKFLOW,
  INITIAL_TOKENS,
  type PlaceId,
  type TransitionId,
  type PlaceDef,
  type TransitionDef,
} from '../../data/metalTestWorkflow'
import { exportPnml, downloadPnml } from '../../services/pnml'
import {
  tokenReducer,
  isEnabled,
  straightArcPath,
  reworkArcPath,
} from './petriNetLogic'

// ─── 定数 ──────────────────────────────────────────────────────────────────
const PLACE_R  = 22   // Place 半径 (px)
const TRANS_W  = 14   // Transition 半幅
const TRANS_H  = 26   // Transition 半高
const TOKEN_R  = 5    // トークンドット半径
const SVG_W    = 760
const SVG_H    = 430
const LABEL_OFFSET = 32  // ノード中心からラベルまでの距離

// ─── トークン表示 ────────────────────────────────────────────────────────────
function Tokens({ count }: { count: number }) {
  if (count === 0) return null
  if (count === 1) return <circle cx={0} cy={0} r={TOKEN_R} fill="var(--text-hi)" />
  if (count === 2) return (
    <g>
      <circle cx={-7} cy={0} r={TOKEN_R} fill="var(--text-hi)" />
      <circle cx={7}  cy={0} r={TOKEN_R} fill="var(--text-hi)" />
    </g>
  )
  if (count === 3) return (
    <g>
      <circle cx={0}  cy={-7} r={TOKEN_R} fill="var(--text-hi)" />
      <circle cx={-7} cy={6}  r={TOKEN_R} fill="var(--text-hi)" />
      <circle cx={7}  cy={6}  r={TOKEN_R} fill="var(--text-hi)" />
    </g>
  )
  // 4+ トークン: 数字表示
  return <text textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold" fill="var(--text-hi)">{count}</text>
}

// ─── Place ノード ────────────────────────────────────────────────────────────
function PlaceNode({ place, tokens }: { place: PlaceDef; tokens: number }) {
  const stroke = place.isInitial
    ? 'var(--ok)'
    : place.isFinal
    ? 'var(--accent)'
    : place.isReject
    ? 'var(--warn)'
    : 'var(--border-strong)'
  const strokeWidth = place.isInitial || place.isFinal ? 2.5 : 1.5
  const atCapacity = place.capacity !== undefined && tokens >= place.capacity

  return (
    <g transform={`translate(${place.x},${place.y})`}>
      <circle
        r={PLACE_R}
        fill="var(--bg-raised)"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Tokens count={tokens} />
      <text
        y={LABEL_OFFSET}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={9}
        fill="var(--text-md)"
        style={{ userSelect: 'none' }}
      >
        {place.label}
      </text>
      {place.capacity !== undefined && (
        <text
          y={LABEL_OFFSET + 11}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={8}
          fontWeight="bold"
          fill={atCapacity ? 'var(--warn)' : 'var(--text-lo)'}
          style={{ userSelect: 'none' }}
        >
          {tokens}/{place.capacity}
        </text>
      )}
    </g>
  )
}

// ─── Transition ノード ───────────────────────────────────────────────────────
interface TransitionNodeProps {
  transition: TransitionDef
  enabled: boolean
  onFire: () => void
}

function TransitionNode({ transition, enabled, onFire }: TransitionNodeProps) {
  const isRework = transition.isRework
  const isReject = transition.isReject

  const fill = enabled
    ? isRework ? 'var(--warn-dim)' : isReject ? 'var(--warn-dim)' : 'var(--accent-dim)'
    : 'var(--bg-raised)'
  const stroke = enabled
    ? isRework ? 'var(--warn)' : isReject ? 'var(--warn)' : 'var(--accent)'
    : 'var(--border-faint)'

  // Row 1 上方の t4 はラベルを上に置く
  const labelY = isRework ? -TRANS_H - 4 : TRANS_H + 12

  const handleKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (!enabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onFire()
    }
  }

  return (
    <g
      transform={`translate(${transition.x},${transition.y})`}
      onClick={enabled ? onFire : undefined}
      onKeyDown={enabled ? handleKeyDown : undefined}
      tabIndex={enabled ? 0 : undefined}
      style={{ cursor: enabled ? 'pointer' : 'default', outline: 'none' }}
      role={enabled ? 'button' : undefined}
      aria-label={enabled ? `${transition.label}を実行` : undefined}
      aria-disabled={!enabled}
    >
      <rect
        x={-TRANS_W}
        y={-TRANS_H}
        width={TRANS_W * 2}
        height={TRANS_H * 2}
        rx={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={enabled ? 2 : 1}
      />
      <text
        y={labelY}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={9}
        fill={enabled ? (isRework || isReject ? 'var(--warn)' : 'var(--accent)') : 'var(--text-lo)'}
        style={{ userSelect: 'none' }}
      >
        {transition.label}
      </text>
    </g>
  )
}

// ─── Arc (resolved path を受け取るだけの薄いレンダラー) ────────────────────
interface ArcProps {
  d: string
  isRework?: boolean
  isReject?: boolean
}

function Arc({ d, isRework, isReject }: ArcProps) {
  const color = isRework || isReject ? 'var(--warn)' : 'var(--text-lo)'
  const dashArray = isRework ? '5,3' : undefined
  const marker = isRework || isReject ? 'url(#arrow-warn)' : 'url(#arrow)'
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray={dashArray}
      fill="none"
      markerEnd={marker}
    />
  )
}

// ─── メインページ ────────────────────────────────────────────────────────────
interface NodeRef {
  x: number
  y: number
  isPlace: boolean
}

type ArcDef = {
  key: string
  d: string
  isRework?: boolean
  isReject?: boolean
}

export const PetriNetPage = () => {
  const [tokens, dispatch] = useReducer(tokenReducer, { ...INITIAL_TOKENS })
  const [history, setHistory] = useState<string[]>([])

  const net = METAL_TEST_WORKFLOW

  // ノード ID → 座標/種別 の高速ルックアップ (O(1))
  const nodeMap = useMemo(() => {
    const m = new Map<PlaceId | TransitionId, NodeRef>()
    for (const p of net.places)      m.set(p.id, { x: p.x, y: p.y, isPlace: true })
    for (const t of net.transitions) m.set(t.id, { x: t.x, y: t.y, isPlace: false })
    return m
  }, [net])

  // 全弧パスを一度だけ計算
  const arcs = useMemo<ArcDef[]>(() => {
    const result: ArcDef[] = []
    for (const t of net.transitions) {
      const trNode = nodeMap.get(t.id)!
      for (const srcId of t.inputs) {
        const src = nodeMap.get(srcId)!
        const d = t.isRework
          ? reworkArcPath(src, trNode, true, PLACE_R, TRANS_W)
          : straightArcPath(src.x, src.y, src.isPlace, trNode.x, trNode.y, trNode.isPlace, PLACE_R, TRANS_W, TRANS_H)
        result.push({ key: `${srcId}-${t.id}`, d, isRework: t.isRework, isReject: t.isReject })
      }
      for (const tgtId of t.outputs) {
        const tgt = nodeMap.get(tgtId)!
        const d = t.isRework
          ? reworkArcPath(trNode, tgt, false, PLACE_R, TRANS_W)
          : straightArcPath(trNode.x, trNode.y, trNode.isPlace, tgt.x, tgt.y, tgt.isPlace, PLACE_R, TRANS_W, TRANS_H)
        result.push({ key: `${t.id}-${tgtId}`, d, isRework: t.isRework, isReject: t.isReject })
      }
    }
    return result
  }, [net, nodeMap])

  const handleFire = (t: TransitionDef) => {
    // 呼出側（TransitionNode の enabled ガード）で発火可能性は保証されているが
    // ロジック破損時の安全のため二重チェック。
    if (!isEnabled(t, tokens, net.places)) return
    dispatch({ type: 'fire', transition: t })
    setHistory(prev => [`${t.label} (${t.id}) 発火`, ...prev.slice(0, 19)])
  }

  const handleReset = () => {
    dispatch({ type: 'reset' })
    setHistory([])
  }

  const handleExport = () => {
    const xml = exportPnml(net, tokens)
    downloadPnml(xml, 'metal-test-workflow.pnml')
  }

  const enabledCount = net.transitions.filter(t => isEnabled(t, tokens, net.places)).length
  const totalTokens = Object.values(tokens).reduce((a, b) => a + b, 0)
  const completed = tokens['p10'] ?? 0
  const rejected  = tokens['p11'] ?? 0

  return (
    <div className="flex flex-col gap-4">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[16px] font-bold text-text-hi flex items-center gap-2">
            <Icon name="workflow" size={16} />
            ペトリネット ワークフロー
          </h1>
          <p className="text-[12px] text-text-lo mt-0.5">
            金属試験プロセスの P/T ネット可視化。
            トークン (●) がサンプルの進行状況を表す。発火可能なトランジション（青/橙枠）をクリックまたは Enter/Space で工程を進める。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={enabledCount > 0 ? 'green' : 'gray'}>
            {enabledCount} 件 発火可能
          </Badge>
          <Button size="sm" variant="default" onClick={() => dispatch({ type: 'add', placeId: 'p0' })}>
            <Icon name="plus" size={13} /> サンプル追加
          </Button>
          <Button size="sm" variant="default" onClick={handleExport}>
            <Icon name="download" size={13} /> PNML
          </Button>
          <Button size="sm" variant="default" onClick={handleReset}>
            <Icon name="refresh" size={13} /> リセット
          </Button>
        </div>
      </div>

      {/* SVG キャンバス */}
      <Card className="overflow-x-auto p-0">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ minWidth: `${SVG_W}px`, background: 'var(--bg-raised)' }}
          aria-label="金属試験ワークフロー Petri net"
        >
          <defs>
            {/* 通常弧の矢印 */}
            <marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M 0,0 L 7,3.5 L 0,7 Z" fill="var(--text-lo)" />
            </marker>
            {/* 警告色（再加工・廃棄）矢印 */}
            <marker id="arrow-warn" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M 0,0 L 7,3.5 L 0,7 Z" fill="var(--warn)" />
            </marker>
          </defs>

          {/* 行ラベル */}
          <text x={8} y={90} dominantBaseline="central" fontSize={8} fill="var(--text-lo)" style={{ userSelect: 'none' }}>Row 1</text>
          <text x={8} y={220} dominantBaseline="central" fontSize={8} fill="var(--text-lo)" style={{ userSelect: 'none' }}>Row 2</text>
          <text x={8} y={350} dominantBaseline="central" fontSize={8} fill="var(--text-lo)" style={{ userSelect: 'none' }}>Row 3</text>

          {/* ガイドライン */}
          <line x1={25} y1={90}  x2={735} y2={90}  stroke="var(--border-faint)" strokeWidth={0.5} strokeDasharray="3,3" />
          <line x1={25} y1={220} x2={735} y2={220} stroke="var(--border-faint)" strokeWidth={0.5} strokeDasharray="3,3" />
          <line x1={25} y1={350} x2={310} y2={350} stroke="var(--border-faint)" strokeWidth={0.5} strokeDasharray="3,3" />

          {/* 弧（ノードより先に描画） */}
          {arcs.map(a => (
            <Arc key={a.key} d={a.d} isRework={a.isRework} isReject={a.isReject} />
          ))}

          {/* Transition ノード */}
          {net.transitions.map(t => (
            <TransitionNode
              key={t.id}
              transition={t}
              enabled={isEnabled(t, tokens, net.places)}
              onFire={() => handleFire(t)}
            />
          ))}

          {/* Place ノード（最前面） */}
          {net.places.map(p => (
            <PlaceNode key={p.id} place={p} tokens={tokens[p.id] ?? 0} />
          ))}

          {/* 凡例 */}
          <g transform="translate(590,380)">
            <circle r={8} fill="var(--bg-raised)" stroke="var(--ok)" strokeWidth={2} />
            <text x={12} y={0} dominantBaseline="central" fontSize={8} fill="var(--text-lo)">初期</text>
            <circle cx={50} r={8} fill="var(--bg-raised)" stroke="var(--accent)" strokeWidth={2} />
            <text x={62} y={0} dominantBaseline="central" fontSize={8} fill="var(--text-lo)">完了</text>
            <circle cx={100} r={8} fill="var(--bg-raised)" stroke="var(--warn)" strokeWidth={2} />
            <text x={112} y={0} dominantBaseline="central" fontSize={8} fill="var(--text-lo)">廃棄</text>
          </g>
        </svg>
      </Card>

      {/* ステータスパネル */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* トークンサマリー */}
        <Card className="p-3">
          <p className="text-[11px] font-bold text-text-lo mb-2">サンプル状況</p>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-text-md">総サンプル数</span>
              <span className="font-bold text-text-hi">{totalTokens}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-md">完了</span>
              <span className="font-bold" style={{ color: 'var(--ok)' }}>{completed}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-md">廃棄/不合格</span>
              <span className="font-bold" style={{ color: 'var(--warn)' }}>{rejected}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-md">進行中</span>
              <span className="font-bold text-text-hi">{totalTokens - completed - rejected}</span>
            </div>
          </div>
        </Card>

        {/* Place トークン詳細 */}
        <Card className="p-3 sm:col-span-2">
          <p className="text-[11px] font-bold text-text-lo mb-2">各工程のトークン数</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {net.places.map(p => {
              const count = tokens[p.id] ?? 0
              const atCap = p.capacity !== undefined && count >= p.capacity
              return (
                <div key={p.id} className="flex justify-between items-center text-[11px]">
                  <span className="text-text-md truncate">
                    {p.fullLabel}
                    {p.capacity !== undefined && (
                      <span className="text-text-lo ml-1">(max {p.capacity})</span>
                    )}
                  </span>
                  {count > 0
                    ? <Badge variant={p.isReject ? 'amber' : p.isFinal ? 'green' : atCap ? 'amber' : 'blue'}>{count}</Badge>
                    : <span className="text-text-lo">—</span>
                  }
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 発火履歴 */}
      {history.length > 0 && (
        <Card className="p-3">
          <p className="text-[11px] font-bold text-text-lo mb-2">発火ログ</p>
          <ol className="flex flex-col gap-0.5">
            {history.map((h, i) => (
              <li key={i} className="text-[11px] text-text-md font-mono">
                <span className="text-text-lo mr-2">{history.length - i}.</span>
                {h}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* 技術ノート */}
      <Card className="p-3 border-dashed" style={{ borderColor: 'var(--border-faint)' }}>
        <p className="text-[11px] font-bold text-text-lo mb-1">なぜペトリネットか</p>
        <p className="text-[11px] text-text-md leading-relaxed">
          再加工ループ（後加工済 → 一次加工済）は有向非巡回グラフ (DAG) では表現できない。
          ペトリネットはサイクルを自然に扱い、複数サンプルの並行進行・place 容量制約（長時間試験の並行ステーション数）・
          合流/分岐も一つのモデルで記述できる。PNML エクスポートで PIPE・GreatSPN などの解析ツールと連携可能。
        </p>
      </Card>
    </div>
  )
}
