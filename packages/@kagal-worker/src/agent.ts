import { DurableObject } from 'cloudflare:workers';

import type { KagalRegistryEnv } from './registry';
import { HEALTH_PATH } from './consts';

/** Agent DO binding. */
export interface KagalAgentEnv extends KagalRegistryEnv {
  KAGAL_AGENT: DurableObjectNamespace<KagalAgent>
}

export class KagalAgent extends DurableObject<KagalAgentEnv> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === HEALTH_PATH) {
      return this.health();
    }
    return this.notFound();
  }

  private health(): Response {
    return Response.json({ ok: true, name: 'KagalAgent' });
  }

  private notFound(): Response {
    return new Response('not found', { status: 404 });
  }

  // TODO: WebSocket hibernation, nonce chain, task queue
}

/** Get a named Agent DO stub. */
export function getAgent(
  env: KagalAgentEnv,
  name: string,
): DurableObjectStub<KagalAgent> {
  const id = env.KAGAL_AGENT.idFromName(name);
  return env.KAGAL_AGENT.get(id);
}
