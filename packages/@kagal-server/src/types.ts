import type {
  KagalRegistryEnv,
  KagalRole,
} from '@kagal/worker';

export const KAGAL_ROLES = ['agent', 'operator'] as const;

export type { HealthCheck, KagalPaths, KagalRole } from '@kagal/worker';

export interface KagalServerEnv extends KagalRegistryEnv {
  KAGAL_WORKER: Fetcher
}

export interface KagalAuthResult {
  agentID: string
  role: KagalRole
  fingerprint: string
  certExpired: boolean
}

export interface KagalServerConfig {
  // Accept expired but otherwise valid certs.
  // Default: true (offline-resilient)
  allowExpiredCerts?: boolean

  // Extract agent_id from cert subject DN.
  extractAgentID?: (subjectDN: string) => string | undefined

  // Determine role from cert subject DN.
  extractRole?: (subjectDN: string) => KagalRole | undefined
}
