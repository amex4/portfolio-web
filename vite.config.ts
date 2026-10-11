import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { seo } from './vite-plugins/seo';

export default defineConfig({
  // GitHub Pages serves this repo at /portfolio-web/. Local dev stays at /.
  base: process.env.GITHUB_ACTIONS ? '/portfolio-web/' : '/',
  plugins: [react(), tailwindcss(), seo()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Keep React in its own long-cacheable chunk.
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (/node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id))
            return 'motion';
        },
      },
    },
  },
});
