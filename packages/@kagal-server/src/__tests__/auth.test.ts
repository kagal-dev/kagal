import { describe, expect, it } from 'vitest';

import { kagalAuth } from '../index';

describe('kagalAuth', () => {
  it('returns undefined (not yet implemented)', () => {
    const result = kagalAuth(
      new Request('http://fake-host/'),
      {} as never,
    );
    expect(result).toBeUndefined();
  });
});
