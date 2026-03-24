import { describe, expect, it } from 'vitest';
import { version } from '../../package.json';
import { VERSION } from '../index';

describe('@kagal/server', () => {
  it('exports VERSION from package.json', () => {
    expect(VERSION).toBe(version);
  });
});
