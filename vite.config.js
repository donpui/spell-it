import { defineConfig } from 'vite';

export default defineConfig({
  // Use the repo name for GitHub Pages so assets resolve correctly
  base: '/spell-it/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});

