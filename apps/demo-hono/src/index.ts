import { KagalServer } from '@kagal/server';
import { Hono } from 'hono';

import type { KagalServerEnv } from '@kagal/server';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

const kagal = new KagalServer<Env>();
const app = new Hono<{ Bindings: Env }>();

app.get('/health', async (c) => {
  const result = await kagal.health(c.env);
  return c.json(result, result.ok ? 200 : 503);
});

app.get('/api/health', (c) =>
  c.json({ status: 'ok', fleet: c.env.FLEET_NAME }),
);

// Forward to gateway for DO routes
app.all('/*', (c) => c.env.KAGAL_WORKER.fetch(c.req.raw));

export default app;
