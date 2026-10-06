import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/core/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});