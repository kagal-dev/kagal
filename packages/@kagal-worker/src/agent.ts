import { DurableObject } from 'cloudflare:workers';

import { KAGAL_AGENT_PATHS } from './consts';
import {
  isWebSocketUpgrade,
  notFound,
  notImplemented,
  upgradeRequired,
} from './utils';

import type { KagalRegistryEnv } from './registry';
import type { HealthCheck, KagalAgentPaths } from './types';

/** Agent DO binding. */
export interface KagalAgentEnv extends KagalRegistryEnv {
  KAGAL_AGENT: DurableObjectNamespace<KagalAgent>
}

export class KagalAgent extends DurableObject<KagalAgentEnv> {
  /** Fetch handler. Only accepts WebSocket upgrades
   *  on the internal `ws` path. */
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname !== `/${KAGAL_AGENT_PATHS.ws}`) {
      return notFound();
    }
    if (!isWebSocketUpgrade(request)) {
      return upgradeRequired();
    }

    // TODO: WebSocket hibernation
    return notImplemented();
  }

  /** RPC: internal path directory. */
  paths(): KagalAgentPaths {
    return KAGAL_AGENT_PATHS;
  }

  /** RPC: agent health check. */
  health(): HealthCheck {
    return { ok: true, name: 'KagalAgent' };
  }

  // TODO: nonce chain, task queue
}

/** Get a named Agent DO stub. */
export function getAgent(
  env: KagalAgentEnv,
  name: string,
): DurableObjectStub<KagalAgent> {
  const id = env.KAGAL_AGENT.idFromName(name);
  return env.KAGAL_AGENT.get(id);
}
