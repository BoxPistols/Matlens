import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import { useGlobals } from 'storybook/preview-api'
import { ChatSupport } from '../src/components/ui/ChatSupport'
import '../src/index.css'

// Auto-recover from stale chunk references after a new deployment.
//
// Storybook ships each story as a content-hashed chunk (e.g.
// `ComponentDevelopment.stories-<HASH>.js`). When Vercel rolls out a new
// build the hash changes, but a cached iframe.html in the browser (bfcache
// or memory cache) still references the old filename. The dynamic import
// then 404s with "Failed to fetch dynamically imported module".
//
// Vite surfaces this as a `vite:preloadError` event — listen for it once
// per session and hard-reload so the browser re-fetches a fresh
// iframe.html with the current chunk hashes. Guarded by sessionStorage so
// we never enter a reload loop if the failure is real (e.g. an actually
// missing file, not just a stale reference).
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    const RELOAD_KEY = 'matlens-storybook-preload-reloaded'
    if (sessionStorage.getItem(RELOAD_KEY)) return
    sessionStorage.setItem(RELOAD_KEY, '1')
    window.location.reload()
  })
}

const ThemeWrapper = ({ children, theme }: { children: React.ReactNode; theme: string }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-hi)', padding: '24px', fontFamily: 'var(--font-ui)' }}>
      {children}
    </div>
  )
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const [globals] = useGlobals()
      const theme = globals.theme || 'light'

      return (
        <ThemeWrapper theme={theme}>
          <Story />
          {context.viewMode !== 'docs' && (
            <ChatSupport
              key={context.id}
              currentStory={{
                title: context.title,
                name: context.name,
                description: context.parameters?.docs?.description?.component,
                // argTypes / args come straight from Storybook's own
                // metadata — the decorator passes them through so the
                // AI system prompt can answer prop-specific questions
                // without anyone hand-maintaining a mirror table.
                argTypes: context.argTypes as Record<string, unknown> | undefined,
                args: context.args as Record<string, unknown> | undefined,
              }}
            />
          )}
        </ThemeWrapper>
      )
    },
  ],
  globalTypes: {
    theme: {
      description: 'テーマ切替',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'eng', title: 'Eng' },
          { value: 'cae', title: 'CAE' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Guide',
          'Design Philosophy',
          'DesignTokens',
          'Components', ['Atoms', 'Molecules', 'Organisms'],
          'Patterns',
        ],
      },
    },
  },
}

export default preview