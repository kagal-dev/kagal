import type { KagalPaths } from '@kagal/worker';

import type { KagalServerEnv } from './types';

/** Fetch JSON from the gateway via service binding.
 *  If {@link agentID} is provided, replaces `:id` in
 *  the URL template. Throws on non-ok responses. */
export async function fetchJSON<T>(
  env: KagalServerEnv,
  url: string,
  agentID?: string,
): Promise<T> {
  const resolved = agentID ?
    url.replace(':id', encodeURIComponent(agentID)) :
    url;
  const response = await env.KAGAL_WORKER.fetch(
    new Request(resolved),
  );
  if (!response.ok) {
    throw new Error(
      `fetch ${resolved} failed: ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

/** Like {@link fetchJSON} but returns {@link fallback}
 *  (or `undefined`) on failure instead of throwing. */
export async function doFetchJSON<T>(
  env: KagalServerEnv,
  url: string,
  fallback?: T,
  agentID?: string,
): Promise<T | undefined> {
  try {
    return await fetchJSON<T>(env, url, agentID);
  } catch {
    return fallback;
  }
}

function resolveSubPaths<
  T extends { [K in keyof T]: string },
>(
  base: URL,
  sub: T,
): T {
  const result = {} as T;
  const trailing = `${base}/`;
  for (const key of Object.keys(sub) as (keyof T)[]) {
    result[key] = new URL(
      sub[key] as string, trailing,
    ).href as T[keyof T];
  }
  return result;
}

/** Resolve a {@link KagalPaths} directory into full
 *  href strings against a base URL. Agent URLs retain
 *  the `:id` template token for later substitution. */
export function pathsToHREF(
  base: string,
  paths: KagalPaths,
): KagalPaths {
  const agentBase = new URL(paths.agentsPrefix, base);
  const supBase = new URL(paths.supervisorPrefix, base);
  return {
    agentsPrefix: agentBase.href,
    agents: resolveSubPaths(agentBase, paths.agents),
    supervisorPrefix: supBase.href,
    supervisor: resolveSubPaths(supBase, paths.supervisor),
  };
}
