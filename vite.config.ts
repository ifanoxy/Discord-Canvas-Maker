import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // Détecte si la compilation tourne sous GitHub Actions
  const isGitHub = process.env.GITHUB_ACTIONS === 'true';

  return {
    plugins: [react()],
    base: isGitHub ? '/Discord-Canvas-Maker/' : '/',
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
  };
});
