import { getAgent, getSupervisor } from '@kagal/worker';
import { env, runInDurableObject } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { KAGAL_AGENT_PATHS } from '../consts';

const newAgent = () => getAgent(env, 'test-agent');
const newSupervisor = () => getSupervisor(env, 'test-supervisor');

describe('KagalAgent', () => {
  it('can be instantiated', async () => {
    await runInDurableObject(newAgent(), (instance) => {
      expect(instance).toBeDefined();
    });
  });

  it('returns health via RPC', async () => {
    const result = await newAgent().health();
    expect(result).toEqual({ ok: true, name: 'KagalAgent' });
  });

  it('returns 404 for wrong path', async () => {
    const response = await newAgent().fetch(
      'http://fake-host/anything',
    );
    expect(response.status).toBe(404);
  });

  it('returns 426 for ws path without upgrade', async () => {
    const response = await newAgent().fetch(
      `http://fake-host/${KAGAL_AGENT_PATHS.ws}`,
    );
    expect(response.status).toBe(426);
  });
});

describe('KagalSupervisor', () => {
  it('can be instantiated', async () => {
    await runInDurableObject(newSupervisor(), (instance) => {
      expect(instance).toBeDefined();
    });
  });

  it('returns health via RPC', async () => {
    const result = await newSupervisor().health();
    expect(result).toEqual({
      ok: true, name: 'KagalSupervisor',
    });
  });

  it('returns 404 for any fetch', async () => {
    const response = await newSupervisor().fetch(
      'http://fake-host/anything',
    );
    expect(response.status).toBe(404);
  });
});
