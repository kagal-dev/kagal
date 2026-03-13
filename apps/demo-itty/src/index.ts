import { createKagalRouter } from '@kagal/server';
import { AutoRouter } from 'itty-router';

import type { KagalRoute, KagalServerEnv } from '@kagal/server';
import type { IttyRouterType, Route } from 'itty-router';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

function registerRoute(
  target: IttyRouterType,
  route: KagalRoute<Env>,
): void {
  if (route.method === 'WS') return;

  const method = route.method.toLowerCase() as keyof IttyRouterType;
  const register = target[method] as Route | undefined;
  if (register) {
    register(route.path, (
      request: Request,
      env: Env,
      context: ExecutionContext,
    ) => route.handler(request, env, context));
  }
}

const kagal = createKagalRouter<Env>();
const router = AutoRouter();

// Mount kagal routes
for (const route of kagal.routes) {
  registerRoute(router, route);
}

// Consumer routes
router.get('/api/health', (_request: Request, env: Env) =>
  Response.json({ status: 'ok', fleet: env.FLEET_NAME }),
);

export default router;
