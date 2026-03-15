import type { KagalRegistryEnv } from '@kagal/worker';
import { type KagalRole } from '@kagal/proto';

export type { AuthResult as KagalAuthResult } from '@kagal/proto';

export type { KagalRole } from '@kagal/proto';
export type { HealthCheck, KagalPaths } from '@kagal/worker';

export interface KagalServerEnv extends KagalRegistryEnv {
  KAGAL_WORKER: Fetcher
}

export interface KagalServerConfig {
  // Accept expired but otherwise valid certs.
  // Default: true (offline-resilient)
  allowExpiredCerts?: boolean

  // Extract agentID from cert subject DN.
  extractAgentID?: (subjectDN: string) => string | undefined

  // Determine role from cert subject DN.
  extractRole?: (subjectDN: string) => KagalRole | undefined
}
