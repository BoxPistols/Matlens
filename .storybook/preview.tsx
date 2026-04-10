import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import { useGlobals } from 'storybook/preview-api'
import { ChatSupport } from '../src/components/ui/ChatSupport'
import '../src/index.css'

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