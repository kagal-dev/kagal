import { getAgent, getSupervisor } from '@kagal/worker';
import { env, runInDurableObject } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { HEALTH_PATH } from '../consts';

const newAgent = () => getAgent(env, 'test-agent');
const newSupervisor = () => getSupervisor(env, 'test-supervisor');

describe('KagalAgent', () => {
  it('can be instantiated', async () => {
    await runInDurableObject(newAgent(), (instance) => {
      expect(instance).toBeDefined();
    });
  });

  it('responds to /health', async () => {
    const response = await newAgent().fetch(
      `http://fake-host${HEALTH_PATH}`,
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true, name: 'KagalAgent' });
  });

  it('returns 404 for unknown paths', async () => {
    const response = await newAgent().fetch(
      'http://fake-host/unknown',
    );
    expect(response.status).toBe(404);
  });
});

describe('KagalSupervisor', () => {
  it('can be instantiated', async () => {
    await runInDurableObject(newSupervisor(), (instance) => {
      expect(instance).toBeDefined();
    });
  });

  it('responds to /health', async () => {
    const response = await newSupervisor().fetch(
      `http://fake-host${HEALTH_PATH}`,
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      ok: true, name: 'KagalSupervisor',
    });
  });

  it('returns 404 for unknown paths', async () => {
    const response = await newSupervisor().fetch(
      'http://fake-host/unknown',
    );
    expect(response.status).toBe(404);
  });
});
