// Floating-mode wrapper. Pins the panel to the bottom-right corner and
// exposes three resize handles (top, left, top-left) so the user can
// grow the panel toward the viewport's upper-left.

import React from 'react'
import type { WidgetSize, ResizeDirection } from '../hooks/useResize'

interface ChatPanelProps {
  size: WidgetSize
  onResizeStart: (
    direction: ResizeDirection,
  ) => (e: React.MouseEvent) => void
  children: React.ReactNode
}

const HANDLE_THICKNESS = 5

export const ChatPanel = ({ size, onResizeStart, children }: ChatPanelProps) => {
  return (
    <div
      role="dialog"
      aria-label="デザインシステム コンシェルジュ"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: size.width,
        height: size.height,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        fontFamily: 'var(--font-ui)',
        overflow: 'hidden',
      }}
    >
      {/* Resize handles — rendered behind the content via absolute
          positioning + negative offsets so they straddle the panel
          border for a generous hit area without eating layout space. */}
      <div
        onMouseDown={onResizeStart('top-left')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          cursor: 'nw-resize',
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={onResizeStart('top')}
        style={{
          position: 'absolute',
          top: 0,
          left: 12,
          right: 0,
          height: HANDLE_THICKNESS,
          cursor: 'n-resize',
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={onResizeStart('left')}
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          bottom: 0,
          width: HANDLE_THICKNESS,
          cursor: 'ew-resize',
          zIndex: 10,
        }}
      />
      {children}
    </div>
  )
}
