// @kagal/server — Server library for Kagal fleet management frontends
export { version as VERSION } from '../package.json';

export { kagalAuth } from './auth';
export { KagalServer } from './server';

export type {
  HealthCheck,
  KagalAuthResult,
  KagalPaths,
  KagalServerConfig,
  KagalServerEnv,
} from './types';
