/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--bg-surface)',
        raised: 'var(--bg-raised)',
        sunken: 'var(--bg-sunken)',
        hover: 'var(--bg-hover)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'accent-mid': 'var(--accent-mid)',
        ai: 'var(--ai-col)',
        'ai-dim': 'var(--ai-dim)',
        vec: 'var(--vec)',
        'vec-dim': 'var(--vec-dim)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        err: 'var(--err)',
        'err-dim': 'var(--err-dim)',
        'text-hi': 'var(--text-hi)',
        'text-md': 'var(--text-md)',
        'text-lo': 'var(--text-lo)',
        border: 'var(--border-default)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        ui: ['var(--font-ui)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
