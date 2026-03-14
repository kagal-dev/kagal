import { describe, expect, it } from 'vitest';

import { DurableObject } from './cloudflare-workers';

describe('DurableObject mock', () => {
  it('stores ctx and env from constructor', () => {
    const context = { id: 'test-ctx' };
    const env = { SOME_VAR: 'value' };
    const object = new DurableObject(context, env);

    expect(object.ctx).toBe(context);
    expect(object.env).toBe(env);
  });
});
