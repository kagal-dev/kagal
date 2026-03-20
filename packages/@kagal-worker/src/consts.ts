import type {
  KagalAgentPaths,
  KagalPaths,
  KagalSupervisorPaths,
} from './types';

// Agent internal paths
export const KAGAL_AGENT_PATHS: KagalAgentPaths = {
  health: 'health',
  ws: 'ws',
  tasks: 'tasks',
  claim: 'claim',
  tunnel: 'tunnel',
};

// Supervisor internal paths
export const KAGAL_SUPERVISOR_PATHS: KagalSupervisorPaths = {
  health: 'health',
  agents: 'agents',
  register: 'register',
};

// External path prefixes (configurable via KagalGatewayConfig)
export const KAGAL_PATHS: KagalPaths = {
  agentsPrefix: 'agent/:id',
  agents: KAGAL_AGENT_PATHS,
  supervisorPrefix: 'supervisor',
  supervisor: KAGAL_SUPERVISOR_PATHS,
};

export const SUPERVISOR_NAME = 'supervisor';

export const KAGAL_ROLES = ['agent', 'operator'] as const;
export const TASK_STATUSES = ['queued', 'dispatched', 'ok', 'error'] as const;
