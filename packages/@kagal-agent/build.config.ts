import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  sourcemap: true,
  rollup: {
    output: {
      // Adds shebang to the CLI entry inferred from
      // package.json "bin" → "kagal": "./dist/cli.mjs"
      banner: (chunk: { fileName: string }) =>
        chunk.fileName === 'cli.mjs' ? '#!/usr/bin/env node' : '',
    },
  },
});
