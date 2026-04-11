import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { devApiProxy } from './dev-api-proxy.js';

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_ prefixed) so OPENAI_API_KEY etc. are available
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  // Opt-in bundle visualizer: set `ANALYZE=1 pnpm build` to write
  // dist/stats.html. Default builds (CI, Vercel) stay lean — no extra
  // file writes, no extra deps walked.
  const analyze = process.env.ANALYZE === '1';

  return {
    plugins: [
      react(),
      devApiProxy(),
      analyze && visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
    ].filter(Boolean),
    resolve: {
      // Prevent duplicate React instances (e.g. lucide-react v1.x useLucideContext)
      dedupe: ['react', 'react-dom'],
    },
    build: {
      outDir: 'dist',
    },
  };
});
