import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM + CJS builds
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    outDir: 'dist',
    target: 'es2020',
  },
  // UMD / IIFE build (for <script> tag usage)
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'MyDatepicker',
    dts: false,
    sourcemap: true,
    outDir: 'dist',
    outExtension: () => ({ js: '.umd.js' }),
    target: 'es2020',
    minify: true,
  },
]);
