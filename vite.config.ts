import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Strip developer logging from production builds. console.error survives so
  // real failures still reach error reporting; the other 112 calls (many of which
  // print tokens, org ids and API payloads) do not ship to users.
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.warn', 'console.info'],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 600,
  },
});
