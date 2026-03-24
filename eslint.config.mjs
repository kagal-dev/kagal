// @ts-check
import { defineConfig, GLOB_SRC } from '@poupe/eslint-config';

export default defineConfig({
  ignores: [
    '.claude/**/memory',
    '.tmp',
    '**/.wrangler',
  ],
}, {
  // TODO: upstream to @poupe/eslint-config
  files: [GLOB_SRC],
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
  },
});
