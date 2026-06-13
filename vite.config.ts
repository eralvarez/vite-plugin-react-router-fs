import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileBasedRouting } from './plugin/index.js';

export default defineConfig({
  build: { outDir: 'dist-app' },
  plugins: [react(), tailwindcss(), fileBasedRouting({ routesDir: 'src/routes', output: 'src/routes.ts' })],
});
