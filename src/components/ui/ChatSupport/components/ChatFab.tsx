// Floating action button shown when the chat panel is closed. Click it
// to open the panel in the user's last-used layout mode.

import React from 'react'
import { Icon } from '../../../Icon/Icon'

interface ChatFabProps {
  onOpen: () => void
}

export const ChatFab = React.memo(({ onOpen }: ChatFabProps) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="デザインシステム コンシェルジュを開く"
      title="デザインシステム コンシェルジュ"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <Icon name="bot" size={22} />
    </button>
  )
})
ChatFab.displayName = 'ChatFab'
