// @ts-check
import { defineConfig, GLOB_SRC } from '@poupe/eslint-config';

// TODO: upstream arrow-parens to @poupe/eslint-config
export default defineConfig({
  files: [GLOB_SRC],
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
  },
});
