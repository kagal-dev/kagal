import type { HealthCheck, KagalPaths } from '@kagal/worker';

import type { KagalServerEnv } from './types';
import { doFetchJSON, fetchJSON, pathsToHREF } from './utils';

const BASE = 'http://internal';

const GATEWAY_DOWN: HealthCheck = {
  ok: false, name: 'KagalGateway',
};

const SUPERVISOR_DOWN: HealthCheck = {
  ok: false, name: 'KagalSupervisor',
};

function newHealthCheck(
  ...deps: HealthCheck[]
): HealthCheck {
  const dependencies: Record<string, HealthCheck> = {};
  for (const dep of deps) {
    dependencies[dep.name] = dep;
  }
  return {
    ok: deps.every((d) => d.ok),
    name: '@kagal/server',
    dependencies,
  };
}

/** Server-side helper that caches the gateway's path
 *  directory and provides DO-aware health checks. */
export class KagalServer<
  E extends KagalServerEnv = KagalServerEnv,
> {
  private paths?: KagalPaths;
  private urls?: KagalPaths;

  /** Fetch and cache the gateway's path directory. */
  async discover(env: E): Promise<KagalPaths> {
    if (this.paths) {
      return this.paths;
    }

    const paths = await fetchJSON<KagalPaths>(
      env, `${BASE}/`,
    );
    this.urls = pathsToHREF(BASE, paths);
    this.paths = paths;
    return paths;
  }

  /** Cascading health check: server + supervisor
   *  (via gateway). */
  async health(env: E): Promise<HealthCheck> {
    try {
      await this.discover(env);
    } catch {
      return newHealthCheck(GATEWAY_DOWN);
    }

    const supervisor = await doFetchJSON<HealthCheck>(
      env, this.urls!.supervisor.health,
      SUPERVISOR_DOWN,
    );

    return newHealthCheck(supervisor!);
  }
}
