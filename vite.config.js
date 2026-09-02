import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths for universal hosting (Vercel, Netlify, GitHub Pages)
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          tween: ['@tweenjs/tween.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false,
  }
});
