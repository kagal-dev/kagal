import {
  cloudflareTest,
} from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './wrangler.jsonc',
      },
    }),
  ],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: [
        'text', 'json-summary', 'json', 'html',
      ],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/__tests__/**',
        '**/dist/**',
      ],
    },
  },
});
