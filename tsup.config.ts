import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'plugin/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  platform: 'node',
  external: ['vite'],
  tsconfig: 'tsconfig.build.json',
});
