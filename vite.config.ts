import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Universal relative base for GitHub Pages / Vercel / Netlify
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('fabric')) return 'fabric';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react') || id.includes('zustand')) return 'vendor';
          }
        }
      }
    }
  }
});
