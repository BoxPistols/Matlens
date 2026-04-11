// Drag-resize helpers for the chat panel.
//
// Two flavours:
//   - `useWidgetResize` — floating panel, resize from top / left / top-left.
//     Width and height both move, so the panel grows up and to the left
//     from its bottom-right anchor point.
//   - `useSidebarResize` — fixed right-edge sidebar, resize from the left
//     edge. Width only.
//
// Both are mouse-only. Touch handling is deliberately skipped — Storybook
// is primarily a desktop tool, and pinch-resize in an iframe'd preview is
// fiddly. If touch becomes important, swap MouseEvent for PointerEvent
// and re-test on iOS (where elastic scroll can fight drag handlers).

import { useCallback, useEffect, useRef, useState } from 'react'

export interface WidgetSize {
  width: number
  height: number
}

export const WIDGET_MIN_WIDTH = 320
export const WIDGET_MAX_WIDTH = 800
export const WIDGET_MIN_HEIGHT = 400
export const WIDGET_MAX_HEIGHT = 900

export const SIDEBAR_MIN_WIDTH = 320
export const SIDEBAR_MAX_WIDTH = 800

export type ResizeDirection = 'top' | 'left' | 'top-left'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Floating-panel resize. Returns the current panel size and a factory
 * that yields an `onMouseDown` handler for each of the 3 resize edges.
 *
 * The panel is anchored at its bottom-right corner (fixed bottom/right
 * positioning in the parent), so dragging the top edge up increases
 * height, dragging the left edge left increases width, and dragging the
 * top-left corner does both.
 */
export function useWidgetResize(
  initial: WidgetSize = { width: 400, height: 600 },
) {
  const [widgetSize, setWidgetSize] = useState<WidgetSize>(initial)
  // Store the latest cleanup so a subsequent drag start can abort any
  // stale listeners even if the previous mouseup fired while the tab
  // was backgrounded (bfcache edge case).
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  const handleResizeStart = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      cleanupRef.current?.()

      const startX = e.clientX
      const startY = e.clientY
      const startW = widgetSize.width
      const startH = widgetSize.height

      const onMove = (ev: MouseEvent) => {
        // `startX/Y - ev.clientX/Y` because the panel is anchored to
        // bottom-right — moving the mouse to the left of the start
        // position means the user wants a wider panel, not narrower.
        const dx = startX - ev.clientX
        const dy = startY - ev.clientY
        const nextWidth =
          direction === 'top'
            ? startW
            : clamp(startW + dx, WIDGET_MIN_WIDTH, WIDGET_MAX_WIDTH)
        const nextHeight =
          direction === 'left'
            ? startH
            : clamp(startH + dy, WIDGET_MIN_HEIGHT, WIDGET_MAX_HEIGHT)
        setWidgetSize({ width: nextWidth, height: nextHeight })
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        cleanupRef.current = null
      }

      cleanupRef.current = onUp
      document.body.style.cursor =
        direction === 'top-left'
          ? 'nw-resize'
          : direction === 'top'
            ? 'n-resize'
            : 'ew-resize'
      // Without this the browser will select text under the cursor
      // during a drag, which looks terrible.
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [widgetSize],
  )

  return { widgetSize, setWidgetSize, handleResizeStart }
}

/**
 * Sidebar resize. The sidebar is anchored to the right edge of the
 * viewport, so the drag handle sits on its *left* edge and dragging
 * left makes the sidebar wider.
 *
 * Width is a controlled value so the caller can persist it to
 * localStorage via `useChatConfig`.
 */
export function useSidebarResize(
  sidebarWidth: number,
  onWidthChange: (width: number) => void,
) {
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  const handleSidebarResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      cleanupRef.current?.()

      const startX = e.clientX
      const startW = sidebarWidth || 400

      const onMove = (ev: MouseEvent) => {
        const dx = startX - ev.clientX
        const nextWidth = clamp(startW + dx, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH)
        onWidthChange(nextWidth)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        cleanupRef.current = null
      }

      cleanupRef.current = onUp
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [sidebarWidth, onWidthChange],
  )

  return { handleSidebarResize }
}
