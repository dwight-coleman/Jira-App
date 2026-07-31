import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind all interfaces so the dev server is reachable when running on a
    // remote VM (e.g. a cloud host with a forwarded port), not just localhost.
    host: true,
    port: 5173,
    // Same-origin API calls in dev: the frontend can call /api/... directly and
    // Vite forwards to the backend, so no CORS round-trip and no need to bake an
    // absolute backend URL into the client.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    // Split vendor code so a change to app code doesn't invalidate the whole
    // bundle, and the browser can fetch these in parallel. Keeps first paint
    // usable on constrained networks.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          datagrid: ['@mui/x-data-grid'],
          charts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
