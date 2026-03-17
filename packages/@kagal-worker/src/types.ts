import type { KagalAgentEnv } from './agent';
import type { KAGAL_ROLES, TASK_STATUSES } from './consts';
import type { KagalSupervisorEnv } from './supervisor';

export type { KagalAgentEnv } from './agent';
export {
  HEALTH_PATH,
  KAGAL_ROLES,
  TASK_STATUSES,
} from './consts';
export type { KagalRegistryEnv } from './registry';

export type { KagalSupervisorEnv } from './supervisor';

/** Full DO Worker environment. */
export type KagalEnv = KagalAgentEnv & KagalSupervisorEnv;

/** Recursive health check result. */
export interface HealthCheck {
  ok: boolean
  name: string
  dependencies?: Record<string, HealthCheck>
}

export type KagalRole = typeof KAGAL_ROLES[number];
export type TaskStatus = typeof TASK_STATUSES[number];

export interface AgentIdentity {
  agent_id: string
  role: KagalRole
  registered_at: string
}

export interface AgentMeta {
  [key: string]: unknown
}

export interface Task {
  task_id: string
  action: string
  params: Record<string, unknown>
  status: TaskStatus
  result?: Record<string, unknown>
  error?: string
  queued_at: string
  dispatched_at?: string
  completed_at?: string
}

export interface KagalHooks {
  onAgentConnect?: (agentID: string, meta: AgentMeta) => Promise<void>
  onAgentDisconnect?: (agentID: string) => Promise<void>
  onAgentError?: (agentID: string, error: Error) => Promise<void>
  onQuarantine?: (agentID: string, reason: string) => Promise<void>
  onClaim?: (agentID: string, claimedBy: string) => Promise<void>
  onTaskResult?: (agentID: string, task: Task) => Promise<void>
  onStatus?: (agentID: string, status: Record<string, unknown>) => Promise<void>
}

export interface KagalWorkerConfig {
  hooks?: KagalHooks
  nonceGracePeriod?: number // Default: 60
}
