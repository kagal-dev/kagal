// @kagal/worker — Durable Object library for Kagal fleet management
export { version as VERSION } from '../package.json';

export {
  getAgent,
  KagalAgent,
  type KagalAgentEnv,
} from './agent';

export {
  KAGAL_PATHS,
  KAGAL_ROLES,
  SUPERVISOR_NAME,
  TASK_STATUSES,
} from './consts';

export {
  KagalGateway,
  type KagalGatewayConfig,
} from './gateway';

export type { KagalRegistryEnv } from './registry';

export {
  getSupervisor,
  KagalSupervisor,
  type KagalSupervisorEnv,
} from './supervisor';

export type {
  AgentIdentity,
  AgentMeta,
  DeepPartial,
  HealthCheck,
  KagalAgentPaths,
  KagalEnv,
  KagalHooks,
  KagalPaths,
  KagalRole,
  KagalSupervisorPaths,
  KagalWorkerConfig,
  Task,
  TaskStatus,
} from './types';

export {
  isMethodAllowed,
  isWebSocketUpgrade,
  joinPath,
} from './utils';
