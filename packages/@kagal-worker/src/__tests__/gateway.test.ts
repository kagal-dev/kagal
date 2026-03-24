import { expectStatus } from '@kagal/test-utils';
import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { KAGAL_PATHS } from '../consts';
import { KagalGateway } from '../gateway';

const gw = new KagalGateway();

function request(
  path: string,
  init?: RequestInit,
): Request {
  return new Request(`http://localhost${path}`, init);
}

describe('KagalGateway', () => {
  describe('discovery', () => {
    it('serves paths directory at /', async () => {
      const response = await gw.fetch(request('/'), env);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(KAGAL_PATHS);
    });

    it('accepts HEAD', async () => {
      const response = await gw.fetch(
        request('/', { method: 'HEAD' }), env,
      );
      expect(response.status).toBe(200);
    });

    it('rejects non-GET/HEAD', async () => {
      const response = await gw.fetch(
        request('/', { method: 'POST' }), env,
      );
      expect(response.status).toBe(405);
      expect(response.headers.get('allow')).toBe('GET, HEAD');
    });
  });

  describe('agent routes', () => {
    it('returns health via RPC', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/health'), env,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true, name: 'KagalAgent',
      });
    });

    it('accepts HEAD on health', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/health', { method: 'HEAD' }),
        env,
      );
      expect(response.status).toBe(200);
    });

    it('rejects non-GET on health', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/health', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(405);
    });

    it('returns 426 for ws without upgrade', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/ws'), env,
      );
      expect(response.status).toBe(426);
    });

    it('forwards ws upgrade to agent DO', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/ws', {
          headers: { upgrade: 'websocket' },
        }),
        env,
      );
      expect(response.status).toBe(501);
    });

    it('rejects non-GET on ws', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/ws', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(405);
    });

    it('returns 501 for GET tasks', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/tasks'), env,
      );
      expect(response.status).toBe(501);
    });

    it('returns 501 for POST tasks', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/tasks', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(501);
    });

    it('rejects DELETE on tasks', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/tasks', { method: 'DELETE' }),
        env,
      );
      expect(response.status).toBe(405);
      expect(response.headers.get('allow')).toBe('GET, HEAD, POST');
    });

    it('returns 501 for POST claim', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/claim', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(501);
    });

    it('rejects GET on claim', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/claim'), env,
      );
      expect(response.status).toBe(405);
    });

    it('returns 501 for GET tunnel', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/tunnel'), env,
      );
      expect(response.status).toBe(501);
    });

    it('returns 404 for unknown agent sub-path', async () => {
      const response = await gw.fetch(
        request('/agent/test-1/unknown'), env,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('supervisor routes', () => {
    it('returns health via RPC', async () => {
      const response = await gw.fetch(
        request('/supervisor/health'), env,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true, name: 'KagalSupervisor',
      });
    });

    it('rejects non-GET on health', async () => {
      const response = await gw.fetch(
        request('/supervisor/health', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(405);
    });

    it('returns 501 for GET agents', async () => {
      const response = await gw.fetch(
        request('/supervisor/agents'), env,
      );
      expect(response.status).toBe(501);
    });

    it('rejects non-GET on agents', async () => {
      const response = await gw.fetch(
        request('/supervisor/agents', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(405);
    });

    it('returns 501 for POST register', async () => {
      const response = await gw.fetch(
        request('/supervisor/register', { method: 'POST' }),
        env,
      );
      expect(response.status).toBe(501);
    });

    it('rejects GET on register', async () => {
      const response = await gw.fetch(
        request('/supervisor/register'), env,
      );
      expect(response.status).toBe(405);
    });

    it('returns 404 for unknown supervisor sub-path', async () => {
      const response = await gw.fetch(
        request('/supervisor/unknown'), env,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('unmatched', () => {
    it('returns 404 for unknown top-level path', async () => {
      const response = await gw.fetch(
        request('/unknown'), env,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('custom paths', () => {
    const custom = new KagalGateway({
      paths: {
        agentsPrefix: 'a/:id',
        supervisorPrefix: 'sup',
      },
    });

    it('routes custom agent prefix', async () => {
      const response = await custom.fetch(
        request('/a/test-1/health'), env,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true, name: 'KagalAgent',
      });
    });

    it('routes custom supervisor prefix', async () => {
      const response = await custom.fetch(
        request('/sup/health'), env,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true, name: 'KagalSupervisor',
      });
    });

    it('preserves non-overridden sub-paths', () => {
      expect(custom.paths.agents.ws).toBe('ws');
      expect(custom.paths.supervisor.agents).toBe('agents');
    });

    it('returns 404 for default paths', async () => {
      const response = await custom.fetch(
        request('/agent/test-1/health'), env,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('RPC methods', () => {
    it('agentHealth returns HealthCheck', async () => {
      const result = await gw.agentHealth(env, 'test-1');
      expect(result).toEqual({
        ok: true, name: 'KagalAgent',
      });
    });

    it('supervisorHealth returns HealthCheck', async () => {
      const result = await gw.supervisorHealth(env);
      expect(result).toEqual({
        ok: true, name: 'KagalSupervisor',
      });
    });

    it('agentWS returns 426 without upgrade', async () => {
      const response = await gw.agentWS(
        request('/ignored'), env, 'test-1',
      );
      expect(response.status).toBe(426);
    });

    it('agentWS forwards upgrade to agent DO', async () => {
      const response = await gw.agentWS(
        request('/ignored', {
          headers: { upgrade: 'websocket' },
        }),
        env,
        'test-1',
      );
      expect(response.status).toBe(501);
    });

    it('agentTasks returns 501', () =>
      expectStatus(gw.agentTasks(env, 'x'), 501));

    it('agentClaim returns 501', () =>
      expectStatus(gw.agentClaim(env, 'x'), 501));

    it('agentTunnel returns 501', () =>
      expectStatus(
        gw.agentTunnel(request('/ignored'), env, 'x'),
        501,
      ));

    it('supervisorAgents returns 501', () =>
      expectStatus(gw.supervisorAgents(env), 501));

    it('supervisorRegister returns 501', () =>
      expectStatus(gw.supervisorRegister(env), 501));
  });
});
