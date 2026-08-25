import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Charting is only needed on the Reports page and is one of the
          // heavier dependencies (Recharts pulls in D3 internals) — isolating
          // it means it's cached separately by the browser and never
          // downloaded at all by roles that can't access Reports.
          charts: ['recharts'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});