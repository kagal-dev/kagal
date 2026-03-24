import { KAGAL_PATHS } from '@kagal/worker';
import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import {
  doFetchJSON,
  fetchJSON,
  pathsToHREF,
} from '../utils';

const BASE = 'http://internal';

describe('pathsToHREF', () => {
  const result = pathsToHREF(BASE, KAGAL_PATHS);

  it('resolves agentsPrefix to full href', () => {
    expect(result.agentsPrefix)
      .toBe('http://internal/agent/:id');
  });

  it('resolves supervisorPrefix to full href', () => {
    expect(result.supervisorPrefix)
      .toBe('http://internal/supervisor');
  });

  it('resolves agent sub-paths against prefix', () => {
    expect(result.agents.health)
      .toBe('http://internal/agent/:id/health');
    expect(result.agents.ws)
      .toBe('http://internal/agent/:id/ws');
    expect(result.agents.tasks)
      .toBe('http://internal/agent/:id/tasks');
    expect(result.agents.claim)
      .toBe('http://internal/agent/:id/claim');
    expect(result.agents.tunnel)
      .toBe('http://internal/agent/:id/tunnel');
  });

  it('resolves supervisor sub-paths against prefix', () => {
    expect(result.supervisor.health)
      .toBe('http://internal/supervisor/health');
    expect(result.supervisor.agents)
      .toBe('http://internal/supervisor/agents');
    expect(result.supervisor.register)
      .toBe('http://internal/supervisor/register');
  });

  it('preserves :id template token in agent URLs', () => {
    for (const href of Object.values(result.agents)) {
      expect(href).toContain(':id');
    }
  });
});

describe('fetchJSON', () => {
  it('fetches and parses JSON', async () => {
    const paths = await fetchJSON<typeof KAGAL_PATHS>(
      env, `${BASE}/`,
    );
    expect(paths.agentsPrefix).toBe('agent/:id');
  });

  it('replaces :id with encoded agentID', async () => {
    const result = await fetchJSON(
      env,
      `${BASE}/agent/:id/health`,
      'test/agent',
    );
    expect(result).toEqual({
      ok: true, name: 'KagalAgent',
    });
  });

  it('throws on non-ok response', async () => {
    await expect(
      fetchJSON(env, `${BASE}/nonexistent`),
    ).rejects.toThrow('404');
  });
});

describe('doFetchJSON', () => {
  it('returns data on success', async () => {
    const result = await doFetchJSON(
      env, `${BASE}/`,
    );
    expect(result).toBeDefined();
  });

  it('returns fallback on failure', async () => {
    const fallback = { ok: false, name: 'down' };
    const result = await doFetchJSON(
      env, `${BASE}/nonexistent`, fallback,
    );
    expect(result).toBe(fallback);
  });

  it('returns undefined without fallback', async () => {
    const result = await doFetchJSON(
      env, `${BASE}/nonexistent`,
    );
    expect(result).toBeUndefined();
  });
});
