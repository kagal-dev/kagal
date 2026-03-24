import { expect } from 'vitest';

/** Assert a response (or promise of one) has the
 *  expected HTTP status code. */
export async function expectStatus(
  response: Promise<Response> | Response,
  status: number,
) {
  const resolved = await response;
  expect(resolved.status).toBe(status);
}
