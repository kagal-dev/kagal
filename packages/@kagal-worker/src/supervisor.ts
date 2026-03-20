import { DurableObject } from 'cloudflare:workers';

import { KAGAL_SUPERVISOR_PATHS } from './consts';
import { notFound } from './utils';

import type { KagalRegistryEnv } from './registry';
import type { HealthCheck, KagalSupervisorPaths } from './types';

/** Supervisor DO binding. */
export interface KagalSupervisorEnv extends KagalRegistryEnv {
  KAGAL_SUPERVISOR: DurableObjectNamespace<KagalSupervisor>
}

export class KagalSupervisor extends DurableObject<KagalSupervisorEnv> {
  /** Supervisor does not handle WebSocket upgrades. */
  async fetch(request: Request): Promise<Response> {
    void request;
    return notFound();
  }

  /** RPC: internal path directory. */
  paths(): KagalSupervisorPaths {
    return KAGAL_SUPERVISOR_PATHS;
  }

  /** RPC: supervisor health check. */
  health(): HealthCheck {
    return { ok: true, name: 'KagalSupervisor' };
  }

  // TODO: fleet coordination, agent listing
}

/** Get a named Supervisor DO stub. */
export function getSupervisor(
  env: KagalSupervisorEnv,
  name: string,
): DurableObjectStub<KagalSupervisor> {
  const id = env.KAGAL_SUPERVISOR.idFromName(name);
  return env.KAGAL_SUPERVISOR.get(id);
}
