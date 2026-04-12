/**
 * downloadFile — ブラウザで文字列をファイルとしてダウンロードする共通ユーティリティ
 *
 * 各所にコピペされていた Blob / createObjectURL / 隠し `<a>` click パターンを集約。
 * Firefox 互換性 (DOM append 必須) と URL.revokeObjectURL の遅延 revoke を統一する。
 *
 * 既存の downloadPnml / downloadMaimlFile も将来この関数に集約可能だが、本 PR では
 * 新規呼出側のみ利用し、既存 API の破壊は行わない。
 */

const REVOKE_DELAY_MS = 1000

/**
 * 文字列を Blob 化して MIME 型指定でダウンロードさせる。
 * @param content  ファイル内容
 * @param filename 保存名（拡張子込み）
 * @param mime     MIME 型（例: 'text/csv', 'application/json', 'application/xml'）
 */
export function downloadTextFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  // Firefox は <a> が DOM にないと click() を無視する
  document.body.appendChild(a)
  a.click()
  a.remove()
  // ダウンロード開始前に revoke するとブラウザが失敗することがあるため遅延
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}
