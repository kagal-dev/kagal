// @kagal/worker — Durable Object library for Kagal fleet management
export { version as VERSION } from '../package.json';

export { KagalAgent } from './agent';
export { KagalSupervisor } from './supervisor';

export {
  KAGAL_ROLES,
  TASK_STATUSES,
} from './types';

export type {
  AgentIdentity,
  AgentMeta,
  KagalEnv,
  KagalHooks,
  KagalRole,
  KagalWorkerConfig,
  Task,
  TaskStatus,
} from './types';
