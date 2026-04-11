// Sidebar-mode wrapper. Anchors the panel to the right edge of the
// viewport, full-height, with a drag handle on the left edge for
// width resizing.

import React from 'react'

interface ChatSidebarProps {
  width: number
  onResizeStart: (e: React.MouseEvent) => void
  children: React.ReactNode
}

export const ChatSidebar = ({ width, onResizeStart, children }: ChatSidebarProps) => {
  return (
    <div
      role="dialog"
      aria-label="デザインシステム コンシェルジュ (サイドバー)"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        fontFamily: 'var(--font-ui)',
        overflow: 'hidden',
      }}
    >
      {/* Left-edge resize handle. 6px wide hit area plus a 1px visual
          line in the hover state so the user knows where to grab. */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          zIndex: 10,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--accent)'
          e.currentTarget.style.opacity = '0.4'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.opacity = '1'
        }}
      />
      {children}
    </div>
  )
}
