
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    },
    server: {
      proxy: {
        '/fugle-api': {
          target: 'https://api.fugle.tw',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fugle-api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
