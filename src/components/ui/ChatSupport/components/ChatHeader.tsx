// Chat panel header with a 2-row layout:
//
//   Row 1: bot avatar + 2-line title (current story name + full path)
//           or settings-mode title with a back chevron.
//   Row 2: action toolbar (layout toggle, settings, download, clear,
//           close) + quota / model badge.
//
// The header background is a soft gradient of the accent colour with a
// blurred backdrop so it reads as a distinct surface over whatever
// story is rendered behind it. All controls share the same hover
// treatment so the toolbar feels cohesive.

import React from 'react'
import type { Provider, RateLimitInfo, StoryContext } from '../chatSupportTypes'
import { MODELS } from '../chatSupportConstants'
import type { LayoutMode } from '../hooks/useChatConfig'
import { Icon } from '../../../Icon/Icon'

interface ChatHeaderProps {
  currentStory: StoryContext | null
  layoutMode: Extract<LayoutMode, 'floating' | 'sidebar'>
  onToggleLayout: () => void
  onOpenSettings: () => void
  onDownload: () => void
  onClear: () => void
  onClose: () => void
  showSettings: boolean
  onBackFromSettings: () => void
  provider: Provider
  hasUserKey: boolean
  rateLimit: RateLimitInfo | null
}

function iconButtonStyle(): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 6,
    color: 'var(--text-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.12s, color 0.12s',
  }
}

function IconButton({
  onClick,
  title,
  icon,
  size = 15,
  ariaLabel,
}: {
  onClick: () => void
  title: string
  icon: React.ComponentProps<typeof Icon>['name']
  size?: number
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      style={iconButtonStyle()}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-raised)'
        e.currentTarget.style.color = 'var(--text-hi)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-md)'
      }}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}

export const ChatHeader = React.memo(
  ({
    currentStory,
    layoutMode,
    onToggleLayout,
    onOpenSettings,
    onDownload,
    onClear,
    onClose,
    showSettings,
    onBackFromSettings,
    provider,
    hasUserKey,
    rateLimit,
  }: ChatHeaderProps) => {
    const modelLabel =
      MODELS.find(m => m.value === provider)?.label ?? 'nano'

    // Title behaviour mirrors kaze-ux: settings view shows "AI 設定 /
    // 戻る", otherwise the story name is the primary label and the full
    // title path is the secondary line.
    const primaryTitle = showSettings
      ? 'AI 設定'
      : currentStory?.name ?? 'デザインシステム コンシェルジュ'
    const secondaryTitle = showSettings
      ? 'モデル選択と自前 API キー'
      : currentStory?.title ?? 'トークン・設計原則について質問できます'

    return (
      <div
        style={{
          background:
            'linear-gradient(135deg, var(--ai-dim) 0%, var(--bg-surface) 60%, var(--accent-dim) 100%)',
          borderBottom: '1px solid var(--border-faint)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Row 1: avatar + title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px 4px 12px',
          }}
        >
          {showSettings ? (
            <button
              type="button"
              onClick={onBackFromSettings}
              aria-label="戻る"
              title="戻る"
              style={iconButtonStyle()}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-raised)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon name="chevronLeft" size={16} />
            </button>
          ) : (
            <div
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Icon name="bot" size={17} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-hi)',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {primaryTitle}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-lo)',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {secondaryTitle}
            </div>
          </div>
        </div>

        {/* Row 2: toolbar + quota badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 8px 6px 8px',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', gap: 2 }}>
            {!showSettings && (
              <>
                <IconButton
                  onClick={onToggleLayout}
                  title={
                    layoutMode === 'sidebar'
                      ? 'フローティングに切替'
                      : 'サイドバーに切替'
                  }
                  icon={layoutMode === 'sidebar' ? 'rag' : 'panelRight'}
                />
                <IconButton
                  onClick={onOpenSettings}
                  title="設定"
                  icon="settings"
                />
                <IconButton
                  onClick={onDownload}
                  title="会話をダウンロード"
                  icon="download"
                />
                <IconButton
                  onClick={onClear}
                  title="会話をクリア"
                  icon="trash"
                />
              </>
            )}
            <IconButton onClick={onClose} title="閉じる" icon="close" />
          </div>
          {!showSettings && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {!hasUserKey && rateLimit && (
                <span
                  title={`共有プール残り: ${rateLimit.remaining}/${rateLimit.limit}`}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background:
                      rateLimit.remaining === 0
                        ? 'var(--err)'
                        : rateLimit.remaining < 5
                          ? 'var(--warn)'
                          : 'var(--bg-raised)',
                    color:
                      rateLimit.remaining === 0 || rateLimit.remaining < 5
                        ? '#fff'
                        : 'var(--text-md)',
                    border: '1px solid var(--border-faint)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  残 {rateLimit.remaining}/{rateLimit.limit}
                </span>
              )}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: hasUserKey ? 'var(--accent)' : 'var(--text-md)',
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-faint)',
                  whiteSpace: 'nowrap',
                }}
              >
                {hasUserKey ? '自前キー / ' : ''}
                {modelLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  },
)
ChatHeader.displayName = 'ChatHeader'
