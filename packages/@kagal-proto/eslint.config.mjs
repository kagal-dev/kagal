// @ts-check
import { defineConfig, GLOB_SRC } from '@poupe/eslint-config';

export default defineConfig(
  // TODO: upstream arrow-parens to @poupe/eslint-config
  {
    files: [GLOB_SRC],
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
    },
  },
  {
    files: ['src/gen/**'],
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
    },
  },
);
