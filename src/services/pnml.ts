/**
 * PNML エクスポーター — ISO/IEC 15909-2 準拠
 *
 * Place/Transition ネット (P/T net) を PNML XML として出力する。
 * PNML は Petri net の標準交換フォーマットで、PIPE・GreatSPN 等のツールで読み込める。
 */

import type { PetriNetDef, PlaceId } from '../data/metalTestWorkflow'
import { downloadTextFile } from './downloadFile'

/**
 * Petri net 定義とトークン状態から PNML XML 文字列を生成する。
 *
 * @param net     ネット定義（PlaceDef / TransitionDef の配列）
 * @param tokens  現在のトークン配置（PlaceId → 個数）
 * @param netId   ネット識別子（デフォルト: "metalTestWorkflow"）
 * @returns PNML XML 文字列
 */
export function exportPnml(
  net: PetriNetDef,
  tokens: Record<PlaceId, number>,
  netId = 'metalTestWorkflow',
): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<pnml xmlns="http://www.pnml.org/version-2009/grammar/pnml">',
    `  <net id="${esc(netId)}" type="http://www.pnml.org/version-2009/grammar/ptnet">`,
    '    <name><text>金属試験ワークフロー</text></name>',
    '    <page id="main">',
  ]

  // Places
  for (const p of net.places) {
    const marking = tokens[p.id] ?? 0
    lines.push(`      <place id="${esc(p.id)}">`)
    lines.push(`        <name><text>${esc(p.fullLabel)}</text></name>`)
    lines.push(`        <graphics><position x="${p.x}" y="${p.y}"/></graphics>`)
    if (marking > 0) {
      lines.push(`        <initialMarking><text>${marking}</text></initialMarking>`)
    }
    if (p.capacity !== undefined) {
      lines.push(`        <capacity><text>${p.capacity}</text></capacity>`)
    }
    lines.push('      </place>')
  }

  // Transitions
  for (const t of net.transitions) {
    lines.push(`      <transition id="${esc(t.id)}">`)
    lines.push(`        <name><text>${esc(t.label)}</text></name>`)
    lines.push(`        <graphics><position x="${t.x}" y="${t.y}"/></graphics>`)
    lines.push('      </transition>')
  }

  // Arcs
  let arcIdx = 0
  for (const t of net.transitions) {
    for (const src of t.inputs) {
      lines.push(`      <arc id="a${arcIdx++}" source="${esc(src)}" target="${esc(t.id)}">`)
      lines.push('        <inscription><text>1</text></inscription>')
      lines.push('      </arc>')
    }
    for (const tgt of t.outputs) {
      lines.push(`      <arc id="a${arcIdx++}" source="${esc(t.id)}" target="${esc(tgt)}">`)
      lines.push('        <inscription><text>1</text></inscription>')
      lines.push('      </arc>')
    }
  }

  lines.push('    </page>')
  lines.push('  </net>')
  lines.push('</pnml>')

  return lines.join('\n')
}

/** XML 特殊文字をエスケープする */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * PNML を Blob としてダウンロードする。
 * @param xml      exportPnml() の戻り値
 * @param filename ダウンロードファイル名
 */
/** PNML を Blob ダウンロード。downloadTextFile に委譲してパターン重複を解消。 */
export function downloadPnml(xml: string, filename = 'workflow.pnml'): void {
  downloadTextFile(xml, filename, 'application/xml')
}
