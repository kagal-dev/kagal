import { DurableObject } from 'cloudflare:workers';

import type { KagalRegistryEnv } from './registry';
import { HEALTH_PATH } from './consts';

/** Supervisor DO binding. */
export interface KagalSupervisorEnv extends KagalRegistryEnv {
  KAGAL_SUPERVISOR: DurableObjectNamespace<KagalSupervisor>
}

export class KagalSupervisor extends DurableObject<KagalSupervisorEnv> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === HEALTH_PATH) {
      return this.health();
    }
    return this.notFound();
  }

  private health(): Response {
    return Response.json({ ok: true, name: 'KagalSupervisor' });
  }

  private notFound(): Response {
    return new Response('not found', { status: 404 });
  }

  // TODO: fleet coordination
}

/** Get a named Supervisor DO stub. */
export function getSupervisor(
  env: KagalSupervisorEnv,
  name: string,
): DurableObjectStub<KagalSupervisor> {
  const id = env.KAGAL_SUPERVISOR.idFromName(name);
  return env.KAGAL_SUPERVISOR.get(id);
}
