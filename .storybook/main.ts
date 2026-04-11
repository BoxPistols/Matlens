import type { StorybookConfig } from '@storybook/react-vite';

// Backend base URL for the Matlens main-app `/api/ai` proxy.
//
// The Storybook deployment (matlens-storybook.vercel.app) is static and
// hosts zero Serverless Functions, so its AI chat calls the main app's
// `/api/ai` endpoint cross-origin. The main app's CORS allowlist in
// `lib/cors.js` already includes `matlens-storybook(-*)?.vercel.app`, and
// `lib/ratelimit.js` gives every IP a 30/day free tier.
//
// Override via `STORYBOOK_MATLENS_API_BASE` in Vercel project env vars if
// the main app ever moves to a custom domain. The default tracks the
// primary Vercel alias documented in the CORS allowlist.
const MATLENS_API_BASE =
  process.env.STORYBOOK_MATLENS_API_BASE || 'https://matlens.vercel.app';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-vite",
  "staticDirs": ["./assets"],
  viteFinal: async (viteConfig) => {
    viteConfig.define = {
      ...(viteConfig.define ?? {}),
      // Expose the backend URL to the browser bundle via
      // `import.meta.env.VITE_MATLENS_API_BASE`. We deliberately avoid
      // baking real secrets here — only the *public* URL of the shared
      // backend proxy. The proxy itself owns the provider keys.
      'import.meta.env.VITE_MATLENS_API_BASE': JSON.stringify(MATLENS_API_BASE),
    };
    return viteConfig;
  },
};
export default config;