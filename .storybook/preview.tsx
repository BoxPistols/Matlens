import type { Preview } from '@storybook/react-vite'
import { useEffect, useRef, useMemo } from 'react'
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

      // Keep refs up-to-date every render but exclude them from useMemo deps.
      // This prevents currentStory from being recreated every time the user
      // tweaks a control (which changes context.args on each keystroke).
      const argTypesRef = useRef(context.argTypes)
      const argsRef = useRef(context.args)
      argTypesRef.current = context.argTypes
      argsRef.current = context.args

      const description = context.parameters?.docs?.description?.component as string | undefined
      const currentStory = useMemo(() => ({
        title: context.title,
        name: context.name,
        description,
        argTypes: argTypesRef.current as Record<string, unknown> | undefined,
        args: argsRef.current as Record<string, unknown> | undefined,
      }), [context.title, context.name, description])

      const disableDecoratorChat = context.parameters?.disableDecoratorChat === true

      return (
        <ThemeWrapper theme={theme}>
          <Story />
          {context.viewMode !== 'docs' && !disableDecoratorChat && (
            <ChatSupport currentStory={currentStory} />
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