import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [],
  globalName: 'MyDatepickerCore',
  outDir: 'dist',
  splitting: false,
  target: 'es2020',
});