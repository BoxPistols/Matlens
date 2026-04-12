/**
 * DownloadPreviewModal — ダウンロード前のプレビュー確認モーダル
 *
 * 全データダウンロードはこのモーダルを一度挟んでから実行する。
 * ユーザーが内容・サイズ・行数を確認してから「ダウンロード実行」を押す UX。
 *
 * 使い方:
 *   const [previewOpen, setPreviewOpen] = useState(false)
 *   const handleExport = () => setPreviewOpen(true)
 *   <DownloadPreviewModal
 *     open={previewOpen}
 *     onClose={() => setPreviewOpen(false)}
 *     onConfirm={() => { downloadX(content, filename); setPreviewOpen(false) }}
 *     title="PNML エクスポート"
 *     filename="workflow.pnml"
 *     content={xml}
 *     language="xml"
 *   />
 */

import { useMemo } from 'react'
import { Button } from '../atoms'
import { Modal } from './molecules'
import { Icon } from '../Icon'

export type DownloadPreviewLanguage = 'xml' | 'json' | 'csv' | 'markdown' | 'text'

export interface DownloadPreviewModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  filename: string
  content: string
  language?: DownloadPreviewLanguage
  /** プレビュー説明文（任意） */
  description?: string
  /** プレビューに表示する最大行数。長大なファイルはここで切り詰める */
  maxPreviewLines?: number
}

const DEFAULT_MAX_LINES = 500

/**
 * ダウンロードする文字列の統計情報を計算する
 */
function computeStats(content: string) {
  const bytes = new Blob([content]).size
  const lines = content.split('\n').length
  const chars = content.length
  return { bytes, lines, chars }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export const DownloadPreviewModal = ({
  open,
  onClose,
  onConfirm,
  title,
  filename,
  content,
  language = 'text',
  description,
  maxPreviewLines = DEFAULT_MAX_LINES,
}: DownloadPreviewModalProps) => {
  const stats = useMemo(() => computeStats(content), [content])

  // 長大なファイルは冒頭のみ表示（ダウンロード自体はフル内容）
  const preview = useMemo(() => {
    const all = content.split('\n')
    if (all.length <= maxPreviewLines) return { text: content, truncated: false }
    return {
      text: all.slice(0, maxPreviewLines).join('\n'),
      truncated: true,
    }
  }, [content, maxPreviewLines])

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-3xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="default" size="sm" onClick={onConfirm}>
            <Icon name="download" size={13} /> ダウンロード実行
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {description && (
          <p className="text-[12px] text-text-md">{description}</p>
        )}

        {/* メタ情報バー */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] p-2.5 rounded border border-[var(--border-faint)]" style={{ background: 'var(--bg-sunken)' }}>
          <div className="flex items-center gap-2">
            <Icon name={language === 'json' ? 'json' : language === 'csv' ? 'csv' : 'pdf'} size={14} className="text-text-lo" />
            <code className="text-text-hi font-mono">{filename}</code>
            <span className="text-text-lo uppercase text-[9px] tracking-[.08em] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-raised)' }}>
              {language}
            </span>
          </div>
          <div className="flex items-center gap-3 text-text-lo">
            <span>{formatBytes(stats.bytes)}</span>
            <span>·</span>
            <span>{stats.lines.toLocaleString()} 行</span>
            <span>·</span>
            <span>{stats.chars.toLocaleString()} 文字</span>
          </div>
        </div>

        {/* プレビューコード領域 */}
        <pre
          className="overflow-auto max-h-[50vh] p-3 text-[11px] font-mono leading-[1.5] rounded border border-[var(--border-faint)] whitespace-pre"
          style={{ background: 'var(--bg-sunken)', color: 'var(--text-md)' }}
          aria-label={`${filename} のプレビュー`}
        >
          {preview.text}
          {preview.truncated && (
            <div className="mt-3 pt-3 border-t border-[var(--border-faint)] text-text-lo text-[10px]">
              ... 以降 {(stats.lines - maxPreviewLines).toLocaleString()} 行は省略（ダウンロードファイルには全内容が含まれます）
            </div>
          )}
        </pre>

        <p className="text-[10px] text-text-lo">
          「ダウンロード実行」でローカルに保存されます。内容に問題がなければ続行してください。
        </p>
      </div>
    </Modal>
  )
}
