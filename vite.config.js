import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

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
  plugins: [
    {
      name: 'copy-google-verification',
      closeBundle() {
        // Copy Google verification file to dist after build
        try {
          copyFileSync(
            resolve(__dirname, 'googlea74d2d9b12c0df0a.html'),
            resolve(__dirname, 'dist', 'googlea74d2d9b12c0df0a.html')
          );
        } catch (error) {
          console.warn('Could not copy Google verification file:', error.message);
        }
      },
    },
  ],
});

