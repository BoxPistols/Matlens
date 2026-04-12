/**
 * PNML インポーター — ISO/IEC 15909-2 準拠の PNML XML を読み込む
 *
 * PIPE / GreatSPN 等の外部解析ツールで編集したネットを Matlens に戻す用途。
 * 現状は place の initialMarking (トークン配置) を取得するのが主目的。
 * ネット構造自体は固定 (METAL_TEST_WORKFLOW) なので、構造変更は無視する。
 *
 * セキュリティ: DOCTYPE 宣言 (XXE 対策) / サイズ制限 / 不正入力のバリデーション
 */

import type { PlaceId } from '../data/metalTestWorkflow'

/** インポート結果 */
export interface PnmlImportResult {
  /** place ID → トークン数 */
  tokens: Partial<Record<PlaceId, number>>
  /** 読み込まれた place 数 */
  placeCount: number
  /** 読み込まれた transition 数 */
  transitionCount: number
  /** 読み込まれた arc 数 */
  arcCount: number
  /** 警告メッセージ (未知の place ID 等) */
  warnings: string[]
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * PNML XML 文字列をパースしてトークン配置を抽出する。
 *
 * @param xml PNML XML 文字列
 * @returns PnmlImportResult
 * @throws DOCTYPE 検出時 (XXE 対策)、サイズ超過時
 */
export function importPnml(xml: string): PnmlImportResult {
  // セキュリティチェック
  if (xml.length > MAX_SIZE) {
    throw new Error(`PNML ファイルが大きすぎます (${(xml.length / 1024 / 1024).toFixed(1)} MB > 5 MB 上限)`)
  }
  if (/<!DOCTYPE/i.test(xml)) {
    throw new Error('DOCTYPE 宣言は XXE 攻撃防止のため許可されていません')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  // パースエラーチェック
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`PNML パースエラー: ${parseError.textContent?.slice(0, 200) ?? '不明'}`)
  }

  const warnings: string[] = []
  const tokens: Partial<Record<PlaceId, number>> = {}

  // places
  const places = doc.querySelectorAll('place')
  for (const place of places) {
    const id = place.getAttribute('id')
    if (!id) continue

    const markingEl = place.querySelector('initialMarking > text')
    if (markingEl?.textContent) {
      const marking = parseInt(markingEl.textContent.trim(), 10)
      if (Number.isFinite(marking) && marking >= 0) {
        tokens[id as PlaceId] = marking
      }
    }
  }

  const transitions = doc.querySelectorAll('transition')
  const arcs = doc.querySelectorAll('arc')

  return {
    tokens,
    placeCount: places.length,
    transitionCount: transitions.length,
    arcCount: arcs.length,
    warnings,
  }
}
