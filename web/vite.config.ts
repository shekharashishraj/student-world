import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/materials/grid', '@babylonjs/loaders/glTF', '@babylonjs/havok'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/keys': 'http://localhost:3000',
      '/lti': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
