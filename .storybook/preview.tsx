import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  decorators: [
    (Story) => {
      document.documentElement.setAttribute('data-theme', 'light');
      return (
        <div style={{ background: 'var(--bg-base)', color: 'var(--text-hi)', padding: '24px', fontFamily: 'var(--font-ui)' }}>
          <Story />
        </div>
      );
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
          { value: 'eng', title: 'Engineering' },
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
    a11y: { test: 'todo' },
  },
};

export default preview;