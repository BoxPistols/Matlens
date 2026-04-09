import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { devApiProxy } from './dev-api-proxy.js';

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_ prefixed) so OPENAI_API_KEY etc. are available
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), devApiProxy()],
    build: {
      outDir: 'dist'
    }
  };
});
