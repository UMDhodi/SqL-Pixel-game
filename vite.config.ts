import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'embedded-backend-server',
      async configureServer(server) {
        process.env.VITE_EMBEDDED = 'true';
        try {
          const { app } = await import('./server/index.js');
          server.middlewares.use(app);
          console.log('⚡ [Vite] Embedded Express Backend mounted! /api is permanently online in-process.');
        } catch (err) {
          console.error('[Vite] Failed to mount embedded backend:', err);
        }
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm'],
  },
});
