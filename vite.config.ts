import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      'my-datepicker-core': '/packages/core/src/index.ts',
      'my-datepicker': '/packages/vanilla/src/index.ts',
    },
  },
});
