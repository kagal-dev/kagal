#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { consola } from 'consola';
import { VERSION } from './index';

const main = defineCommand({
  meta: {
    name: 'kagal',
    version: VERSION,
    description: 'Kagal fleet management agent',
  },
  run() {
    consola.info('kagal agent');
  },
});

runMain(main);
