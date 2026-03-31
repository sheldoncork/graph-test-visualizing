import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false
  }
});
