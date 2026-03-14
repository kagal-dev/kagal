import type { KagalRole } from '@kagal/worker';

export { KAGAL_ROLES } from '@kagal/worker';
export type { KagalRole } from '@kagal/worker';

export const ROUTE_METHODS = ['GET', 'POST', 'WS'] as const;

export type RouteMethod = typeof ROUTE_METHODS[number];

export interface KagalServerEnv {
  // Required: service binding to the DO Worker
  KAGAL_WORKER: Fetcher
}

export interface KagalAuthResult {
  agentID: string
  role: KagalRole
  fingerprint: string
  certExpired: boolean
}

export interface KagalServerConfig {
  // Service binding to the DO Worker.
  // Default: env.KAGAL_WORKER
  binding?: string

  // Accept expired but otherwise valid certs.
  // Default: true (offline-resilient)
  allowExpiredCerts?: boolean

  // Extract agent_id from cert subject DN.
  extractAgentID?: (subjectDN: string) => string | undefined

  // Determine role from cert subject DN.
  extractRole?: (subjectDN: string) => KagalRole | undefined
}

export interface KagalRoute<
  E extends KagalServerEnv = KagalServerEnv,
> {
  method: RouteMethod
  path: string
  handler: (
    request: Request,
    env: E,
    context: ExecutionContext,
  ) => Promise<Response>
}

export interface KagalRouter<
  E extends KagalServerEnv = KagalServerEnv,
> {
  routes: KagalRoute<E>[]
  handle: (
    request: Request,
    env: E,
    context: ExecutionContext,
  ) => Promise<Response | undefined>
}
