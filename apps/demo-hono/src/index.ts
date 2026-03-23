import { createKagalRouter } from '@kagal/server';
import { Hono } from 'hono';

import type { KagalRoute, KagalServerEnv } from '@kagal/server';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

function registerRoute(
  target: Hono<{ Bindings: Env }>,
  route: KagalRoute<Env>,
): void {
  if (route.method === 'WS') return;

  target.on(route.method, route.path, (c) =>
    route.handler(c.req.raw, c.env, c.executionCtx),
  );
}

const kagal = createKagalRouter<Env>();
const app = new Hono<{ Bindings: Env }>();

// Mount kagal routes
for (const route of kagal.routes) {
  registerRoute(app, route);
}

// Consumer routes
app.get('/api/health', (c) =>
  c.json({ status: 'ok', fleet: c.env.FLEET_NAME }),
);

export default app;
