export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: 'faq' | 'guide' | 'ai'
  timestamp: number
}

/**
 * Story context exposed to ChatSupport. The required fields (title,
 * name, description) come from Storybook's meta.parameters.docs; the
 * optional ones are injected by the `.storybook/preview.tsx` decorator
 * from `context.argTypes` / `context.args` and fed into the AI system
 * prompt so the model can answer prop-specific questions without
 * anyone hand-maintaining an argTypes mirror in storyGuideMap.
 */
export interface StoryContext {
  title: string
  name: string
  description?: string
  /**
   * Storybook's auto-generated argTypes. Keys are prop names, values
   * carry the type, control, description etc. Kept untyped so a
   * Storybook version bump that adds fields doesn't break the chat.
   */
  argTypes?: Record<string, unknown>
  /** Current arg values selected in the Controls panel. */
  args?: Record<string, unknown>
}

export interface FaqEntry {
  keywords: string[]
  question: string
  answer: string
}

export interface StoryGuide {
  title: string
  tips: string[]
  codeRef?: string
  relatedStories?: string[]
}

/**
 * A concrete AI model the chat panel can route a request to. Values map
 * 1:1 to the `provider` field accepted by the backend `/api/ai` endpoint
 * (see `lib/validation.js`).
 *
 * `openai` is the full-fat gpt-5.4 model — too expensive to put on the
 * shared pool, so the UI locks it behind a user-supplied key via the
 * `requiresUserKey` flag below. The cheap variants (`-nano`, `-mini`,
 * `gemini`) can be served straight from the shared pool.
 */
export type Provider = 'openai-nano' | 'openai-mini' | 'openai' | 'gemini'

export interface ModelOption {
  /** Wire value sent to `/api/ai` as the `provider` field. */
  value: Provider
  /** Human label shown in the model selector. */
  label: string
  /** One-line description shown underneath the label in the selector. */
  description: string
  /** Eligible for the shared-pool (backend) call path. */
  projectKeyEnabled?: boolean
  /**
   * Cannot be used without a user-supplied API key. The UI disables the
   * option with a lock icon when this is true and no key is set.
   */
  requiresUserKey?: boolean
}

/** Rate-limit snapshot as reported by the backend. */
export interface RateLimitInfo {
  remaining: number
  limit: number
}
