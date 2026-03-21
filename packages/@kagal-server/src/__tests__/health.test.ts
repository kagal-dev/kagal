import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { KagalServer } from '../index';

describe('health', () => {
  it('discovers gateway paths', async () => {
    const kagal = new KagalServer();
    const paths = await kagal.discover(env);
    expect(paths.supervisorPrefix).toBeDefined();
    expect(paths.supervisor.health).toBeDefined();
  });

  it('caches discovery result', async () => {
    const kagal = new KagalServer();
    const first = await kagal.discover(env);
    const second = await kagal.discover(env);
    expect(second).toBe(first);
  });

  it('checks supervisor health', async () => {
    const kagal = new KagalServer();
    const result = await kagal.health(env);
    expect(result.ok).toBe(true);
    expect(result.name).toBe('@kagal/server');
    expect(result.dependencies).toBeDefined();

    const sup = result.dependencies!.KagalSupervisor;
    expect(sup).toBeDefined();
    expect(sup.ok).toBe(true);
    expect(sup.name).toBe('KagalSupervisor');
  });
});
