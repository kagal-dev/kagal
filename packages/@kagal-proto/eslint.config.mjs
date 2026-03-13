// @ts-check
import { defineConfig } from '@poupe/eslint-config';

export default defineConfig(
  {
    files: ['src/gen/**'],
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
    },
  },
);
