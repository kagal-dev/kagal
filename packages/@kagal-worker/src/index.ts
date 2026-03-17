// @kagal/worker — Durable Object library for Kagal fleet management
export { version as VERSION } from '../package.json';

export {
  getAgent,
  KagalAgent,
  type KagalAgentEnv,
} from './agent';

export {
  HEALTH_PATH,
  KAGAL_ROLES,
  TASK_STATUSES,
} from './consts';

export type { KagalRegistryEnv } from './registry';

export {
  getSupervisor,
  KagalSupervisor,
  type KagalSupervisorEnv,
} from './supervisor';

export type {
  AgentIdentity,
  AgentMeta,
  HealthCheck,
  KagalEnv,
  KagalHooks,
  KagalRole,
  KagalWorkerConfig,
  Task,
  TaskStatus,
} from './types';
