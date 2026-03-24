// @kagal/server — Server library for Kagal fleet management frontends
export { version as VERSION } from '../package.json';

export { kagalAuth } from './auth';
export { KagalServer } from './server';

export { KAGAL_ROLES } from './types';

export type {
  HealthCheck,
  KagalAuthResult,
  KagalPaths,
  KagalRole,
  KagalServerConfig,
  KagalServerEnv,
} from './types';
