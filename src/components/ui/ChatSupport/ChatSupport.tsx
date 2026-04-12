// Matlens design system concierge. Thin container that wires the chat
// state / config / message-routing hooks to the split UI components.
// Actual chat logic lives in the hooks; actual layout lives in the
// components; this file just decides which layout to render and which
// callbacks to plumb where.
//
// Layout mode (`closed` | `floating` | `sidebar`) is persisted in
// localStorage so the user's preference survives page reloads and
// story switches. When `closed`, only the FAB is visible.

import React, { useCallback, useMemo, useState } from 'react'
import type { StoryContext } from './chatSupportTypes'
import { getStoryGuide } from './storyGuideMap'
import { useChat } from './hooks/useChat'
import { useChatConfig } from './hooks/useChatConfig'
import { useChatMessage } from './hooks/useChatMessage'
import { useWidgetResize, useSidebarResize } from './hooks/useResize'
import { ChatFab } from './components/ChatFab'
import { ChatHeader } from './components/ChatHeader'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatInput } from './components/ChatInput'
import { ChatSettings } from './components/ChatSettings'
import { ChatPanel } from './components/ChatPanel'
import { ChatSidebar } from './components/ChatSidebar'
import { DownloadPreviewModal } from '../../molecules/DownloadPreviewModal'
import { downloadTextFile } from '../../../services/downloadFile'

interface ChatSupportProps {
  currentStory: StoryContext | null
}

function formatGuideForBanner(
  guide: NonNullable<ReturnType<typeof getStoryGuide>>,
): string {
  return [
    `**${guide.title}** のガイド:`,
    ...guide.tips.map(t => `- ${t}`),
    guide.codeRef ? `\nコード参照: \`${guide.codeRef}\`` : '',
    guide.relatedStories?.length
      ? `\n関連ストーリー: ${guide.relatedStories.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export const ChatSupport = ({ currentStory }: ChatSupportProps) => {
  const config = useChatConfig()
  const chat = useChat()
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [downloadPreviewOpen, setDownloadPreviewOpen] = useState(false)

  // プレビュー表示用のエクスポートペイロードを memoize
  // （モーダルが開いている間だけ生成して再計算を抑える）
  const exportPayload = useMemo(
    () => (downloadPreviewOpen ? chat.getExportPayload() : null),
    [downloadPreviewOpen, chat],
  )

  const handleDownloadPreview = useCallback(() => {
    setDownloadPreviewOpen(true)
  }, [])

  const handleConfirmDownload = useCallback(() => {
    if (!exportPayload) return
    downloadTextFile(exportPayload.content, exportPayload.filename, 'application/json')
    setDownloadPreviewOpen(false)
  }, [exportPayload])

  const message = useChatMessage({
    provider: config.provider,
    apiKey: config.apiKey,
    currentStory,
    chat,
    onOpenSettings: () => setShowSettings(true),
  })

  const widgetResize = useWidgetResize()
  const sidebarResize = useSidebarResize(
    config.sidebarWidth,
    config.setSidebarWidth,
  )

  const handleSend = useCallback(() => {
    const q = input.trim()
    if (!q) return
    setInput('')
    void message.send(q)
  }, [input, message])

  const handleQuickSelect = useCallback(
    (query: string) => {
      setInput('')
      void message.send(query)
    },
    [message],
  )

  // Info-banner click handler — drops the current story's guide into
  // the conversation as a bot message without hitting the AI proxy.
  const handleExplainStory = useCallback(
    (storyTitle: string) => {
      const guide = getStoryGuide(storyTitle)
      if (!guide) return
      chat.addMessage('assistant', formatGuideForBanner(guide), 'guide')
    },
    [chat],
  )

  const handleToggleLayout = useCallback(() => {
    config.setLayoutMode(
      config.layoutMode === 'sidebar' ? 'floating' : 'sidebar',
    )
  }, [config])

  const handleClose = useCallback(() => {
    setShowSettings(false)
    config.setLayoutMode('closed')
  }, [config])

  const handleOpen = useCallback(() => {
    // First-open preference: floating. Subsequent opens respect the
    // user's last used mode.
    config.setLayoutMode(
      config.layoutMode === 'closed' ? 'floating' : config.layoutMode,
    )
  }, [config])

  const body = (
    <>
      <ChatHeader
        currentStory={currentStory}
        layoutMode={config.layoutMode === 'sidebar' ? 'sidebar' : 'floating'}
        onToggleLayout={handleToggleLayout}
        onOpenSettings={() => setShowSettings(true)}
        onDownload={handleDownloadPreview}
        onClear={chat.clearMessages}
        onClose={handleClose}
        showSettings={showSettings}
        onBackFromSettings={() => setShowSettings(false)}
        provider={config.provider}
        hasUserKey={config.hasUserKey}
        rateLimit={message.rateLimit}
      />
      {showSettings ? (
        <ChatSettings
          provider={config.provider}
          onProviderChange={config.setProvider}
          apiKey={config.apiKey}
          onApiKeyChange={config.setApiKey}
        />
      ) : (
        <>
          <ChatMessageList
            messages={chat.messages}
            sending={message.sending}
            currentStory={currentStory}
            onQuickSelect={handleQuickSelect}
            onExplainStory={handleExplainStory}
          />
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={message.sending}
            hasUserKey={config.hasUserKey}
          />
        </>
      )}
    </>
  )

  // 現在のレイアウトモードに対応する本体要素
  let layoutEl: React.ReactNode
  if (config.layoutMode === 'closed') {
    layoutEl = <ChatFab onOpen={handleOpen} />
  } else if (config.layoutMode === 'sidebar') {
    layoutEl = (
      <ChatSidebar
        width={config.sidebarWidth}
        onResizeStart={sidebarResize.handleSidebarResize}
      >
        {body}
      </ChatSidebar>
    )
  } else {
    layoutEl = (
      <ChatPanel
        size={widgetResize.widgetSize}
        onResizeStart={widgetResize.handleResizeStart}
      >
        {body}
      </ChatPanel>
    )
  }

  return (
    <>
      {layoutEl}
      {/* 会話履歴ダウンロードはプレビューを挟んでから実行 */}
      {exportPayload && (
        <DownloadPreviewModal
          open={downloadPreviewOpen}
          onClose={() => setDownloadPreviewOpen(false)}
          onConfirm={handleConfirmDownload}
          title="会話履歴エクスポート プレビュー"
          filename={exportPayload.filename}
          content={exportPayload.content}
          language="json"
          description={`Storybook チャットの会話履歴を JSON でダウンロードします（${chat.messages.length} 件のメッセージ）。`}
        />
      )}
    </>
  )
}
