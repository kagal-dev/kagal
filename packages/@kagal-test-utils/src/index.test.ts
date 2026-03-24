import { describe, expect, it } from 'vitest';

import { expectStatus } from './index';

describe('expectStatus', () => {
  it('passes when status matches', async () => {
    const response = new Response(undefined, { status: 200 });
    await expectStatus(response, 200);
  });

  it('passes with a promise', async () => {
    const response = Promise.resolve(
      new Response(undefined, { status: 404 }),
    );
    await expectStatus(response, 404);
  });

  it('fails when status does not match', async () => {
    const response = new Response(undefined, { status: 500 });
    await expect(
      expectStatus(response, 200),
    ).rejects.toThrow();
  });
});
