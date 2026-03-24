import type { KagalAgentEnv } from './agent';
import type { KAGAL_ROLES, TASK_STATUSES } from './consts';
import type { KagalGatewayConfig } from './gateway';
import type { KagalSupervisorEnv } from './supervisor';

export type { KagalAgentEnv } from './agent';
export {
  KAGAL_PATHS,
  KAGAL_ROLES,
  TASK_STATUSES,
} from './consts';
export type { KagalGatewayConfig } from './gateway';
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
  agentId: string
  role: KagalRole
  registeredAt: string
}

export interface AgentMeta {
  [key: string]: unknown
}

export interface Task {
  taskId: string
  action: string
  params: Record<string, unknown>
  status: TaskStatus
  result?: Record<string, unknown>
  error?: string
  queuedAt: string
  dispatchedAt?: string
  completedAt?: string
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

export interface KagalAgentPaths {
  health: string
  ws: string
  tasks: string
  claim: string
  tunnel: string
}

export interface KagalSupervisorPaths {
  health: string
  agents: string
  register: string
}

/** Discovery document served at `/` by the gateway. */
export interface KagalPaths {
  agentsPrefix: string
  agents: KagalAgentPaths
  supervisorPrefix: string
  supervisor: KagalSupervisorPaths
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends unknown[] ?
    T[P] :
    T[P] extends object ? DeepPartial<T[P]> : T[P]
};

export interface KagalWorkerConfig extends KagalGatewayConfig {
  hooks?: KagalHooks
  nonceGracePeriod?: number // Default: 60
}
