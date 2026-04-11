// Inline info banner displayed at the top of the message list whenever
// the user lands on a story that has a handwritten guide in
// storyGuideMap. Clicking it loads the guide as a bot message without
// spending AI quota.

import React from 'react'
import type { StoryContext } from '../chatSupportTypes'
import { getStoryGuide } from '../storyGuideMap'
import { Icon } from '../../../Icon/Icon'

interface PageContextBannerProps {
  currentStory: StoryContext | null
  onExplain: (storyTitle: string) => void
}

export const PageContextBanner = React.memo(
  ({ currentStory, onExplain }: PageContextBannerProps) => {
    if (!currentStory) return null
    const guide = getStoryGuide(currentStory.title)
    if (!guide) return null

    return (
      <div
        style={{
          margin: '0 0 10px 0',
          padding: '7px 10px',
          borderRadius: 8,
          background: 'var(--ai-dim)',
          border: '1px solid var(--border-faint)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon name="info" size={13} />
        <button
          type="button"
          onClick={() => onExplain(currentStory.title)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--ai-col)',
            cursor: 'pointer',
            textAlign: 'left',
            flex: 1,
          }}
        >
          {currentStory.title} の解説を見る
        </button>
      </div>
    )
  },
)
PageContextBanner.displayName = 'PageContextBanner'
