/**
 * NL Query Compiler — 自然言語クエリを構造化フィルタに変換
 *
 * 「ニッケル合金で硬度300以上」→ { cat: '金属合金', hvMin: 300 } のように
 * 日本語の自然言語クエリをパースしてフィルタ条件に分解する。
 *
 * AI (LLM) を使わずルールベースで高速に変換する。
 * ファセット検索 (A-2) と連携してフィルタチップを自動生成する用途。
 */

import type { MaterialCategory, MaterialStatus, Provenance } from '../types'

export interface CompiledFilter {
  text?: string
  cat?: MaterialCategory
  status?: MaterialStatus
  provenance?: Provenance
  hvMin?: number
  hvMax?: number
  tsMin?: number
  tsMax?: number
  elMin?: number
  elMax?: number
  dnMin?: number
  dnMax?: number
  remainder: string
  applied: string[]
}

const CAT_KEYWORDS: { pattern: RegExp; cat: MaterialCategory }[] = [
  { pattern: /(?:ニッケル|Ni基?|インコネル|ハステロイ|超合金)/i, cat: '金属合金' },
  { pattern: /(?:チタン|Ti合?金?)/i, cat: '金属合金' },
  { pattern: /(?:アルミ合金|Al合金|ジュラルミン|A\d{4})/i, cat: '金属合金' },
  { pattern: /(?:ステンレス|SUS|鋼|鉄|Fe|合金鋼|炭素鋼|金型鋼)/i, cat: '金属合金' },
  { pattern: /(?:銅|Cu|黄銅|青銅)/i, cat: '金属合金' },
  { pattern: /(?:マグネシウム|Mg)/i, cat: '金属合金' },
  { pattern: /(?:金属合金|金属)/i, cat: '金属合金' },
  { pattern: /(?:セラミクス|セラミック|アルミナ|ジルコニア)/i, cat: 'セラミクス' },
  { pattern: /(?:ポリマー|樹脂|プラスチック|エポキシ|ナイロン)/i, cat: 'ポリマー' },
  { pattern: /(?:複合材|CFRP|FRP|CMC|コンポジット)/i, cat: '複合材料' },
]

const STATUS_KEYWORDS: { pattern: RegExp; status: MaterialStatus }[] = [
  { pattern: /(?:承認済|承認)/i, status: '承認済' },
  { pattern: /(?:レビュー待|レビュー|未承認)/i, status: 'レビュー待' },
  { pattern: /(?:要修正|修正)/i, status: '要修正' },
  { pattern: /(?:登録済)/i, status: '登録済' },
]

const PROV_KEYWORDS: { pattern: RegExp; prov: Provenance }[] = [
  { pattern: /(?:装置|計測|instrument)/i, prov: 'instrument' },
  { pattern: /(?:手入力|手動|manual)/i, prov: 'manual' },
  { pattern: /(?:AI|推定|機械学習)/i, prov: 'ai' },
  { pattern: /(?:シミュレーション|sim)/i, prov: 'simulation' },
]

interface NumericRule {
  pattern: RegExp
  field: 'hv' | 'ts' | 'el' | 'dn'
  bound: 'min' | 'max'
}

const NUMERIC_RULES: NumericRule[] = [
  { pattern: /(?:硬度|HV)\s*(\d+(?:\.\d+)?)\s*以上/i, field: 'hv', bound: 'min' },
  { pattern: /(?:硬度|HV)\s*(\d+(?:\.\d+)?)\s*以下/i, field: 'hv', bound: 'max' },
  { pattern: /(?:引張|TS|引張強[さ度])\s*(\d+(?:\.\d+)?)\s*(?:MPa\s*)?以上/i, field: 'ts', bound: 'min' },
  { pattern: /(?:引張|TS|引張強[さ度])\s*(\d+(?:\.\d+)?)\s*(?:MPa\s*)?以下/i, field: 'ts', bound: 'max' },
  { pattern: /(?:弾性|ヤング|EL)\s*(\d+(?:\.\d+)?)\s*(?:GPa\s*)?以上/i, field: 'el', bound: 'min' },
  { pattern: /(?:弾性|ヤング|EL)\s*(\d+(?:\.\d+)?)\s*(?:GPa\s*)?以下/i, field: 'el', bound: 'max' },
  { pattern: /(?:密度|DN)\s*(\d+(?:\.\d+)?)\s*以上/i, field: 'dn', bound: 'min' },
  { pattern: /(?:密度|DN)\s*(\d+(?:\.\d+)?)\s*以下/i, field: 'dn', bound: 'max' },
]

/**
 * 自然言語クエリを構造化フィルタに変換する。
 *
 * @example
 * compileNlQuery("ニッケル合金で硬度300以上の承認済")
 * // → { cat: '金属合金', hvMin: 300, status: '承認済', remainder: '', applied: [...] }
 */
export function compileNlQuery(query: string): CompiledFilter {
  const result: CompiledFilter = { remainder: query.trim(), applied: [] }
  let q = result.remainder

  // カテゴリ
  for (const { pattern, cat } of CAT_KEYWORDS) {
    if (pattern.test(q)) {
      result.cat = cat
      result.applied.push(`カテゴリ: ${cat}`)
      q = q.replace(pattern, '').trim()
      break
    }
  }

  // ステータス
  for (const { pattern, status } of STATUS_KEYWORDS) {
    if (pattern.test(q)) {
      result.status = status
      result.applied.push(`ステータス: ${status}`)
      q = q.replace(pattern, '').trim()
      break
    }
  }

  // Provenance
  for (const { pattern, prov } of PROV_KEYWORDS) {
    if (pattern.test(q)) {
      result.provenance = prov
      result.applied.push(`出所: ${prov}`)
      q = q.replace(pattern, '').trim()
      break
    }
  }

  // 数値範囲
  for (const { pattern, field, bound } of NUMERIC_RULES) {
    const matches = [...q.matchAll(new RegExp(pattern, 'gi'))]
    const m = matches[0]
    if (m?.[1]) {
      const val = parseFloat(m[1])
      if (Number.isFinite(val)) {
        const key = `${field}${bound === 'min' ? 'Min' : 'Max'}` as keyof CompiledFilter
        ;(result as unknown as Record<string, unknown>)[key] = val
        result.applied.push(`${field} ${bound === 'min' ? '≥' : '≤'} ${val}`)
        q = q.replace(m[0], '').trim()
      }
    }
  }

  // 残りの接続詞・助詞を除去
  q = q.replace(/^[でのがをはにと、。]+|[でのがをはにと、。]+$/g, '').trim()

  if (q.length > 0) result.text = q
  result.remainder = q
  return result
}
