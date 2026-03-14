// @kagal/server — Server library for Kagal fleet management frontends
export { version as VERSION } from '../package.json';

export { kagalAuth } from './auth';
export { createKagalRouter } from './router';

export {
  KAGAL_ROLES,
  ROUTE_METHODS,
} from './types';

export type {
  KagalAuthResult,
  KagalRole,
  KagalRoute,
  KagalRouter,
  KagalServerConfig,
  KagalServerEnv,
  RouteMethod,
} from './types';
