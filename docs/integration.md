<!-- cSpell:words kagalctl -->

# Integration Guide

How to mount Kagal into different frontend frameworks
and configure the backing DO Worker.

## Consumer `wrangler.toml` Templates

### DO Worker

```toml
name = "my-fleet-do"
main = "src/index.ts"
compatibility_date = "2026-03-12"
compatibility_flags = ["nodejs_compat"]

[[durable_objects.bindings]]
name = "KAGAL_AGENT"
class_name = "KagalAgent"

[[durable_objects.bindings]]
name = "KAGAL_SUPERVISOR"
class_name = "KagalSupervisor"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["KagalAgent", "KagalSupervisor"]

[[kv_namespaces]]
binding = "KAGAL_REGISTRY"
id = "<wrangler kv namespace create KAGAL_REGISTRY>"
```

### Frontend Worker

```toml
name = "my-fleet-app"
main = "src/index.ts"
compatibility_date = "2026-03-12"
compatibility_flags = ["nodejs_compat"]

# Service binding to the DO worker
[[services]]
binding = "KAGAL_WORKER"
service = "my-fleet-do"

# Direct KV read access for kagalAuth (mTLS identity)
[[kv_namespaces]]
binding = "KAGAL_REGISTRY"
id = "<same KV namespace as the DO worker>"
```

## Frontend: Hono

```typescript
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
```

## Frontend: itty-router

```typescript
import { KagalServer } from '@kagal/server';
import { AutoRouter } from 'itty-router';

import type { KagalServerEnv } from '@kagal/server';

interface Env extends KagalServerEnv {
  FLEET_NAME: string
}

const kagal = new KagalServer<Env>();
const router = AutoRouter();

router.get('/health', async (_request: Request, env: Env) => {
  const result = await kagal.health(env);
  return Response.json(result, { status: result.ok ? 200 : 503 });
});

router.get('/api/health', (_request: Request, env: Env) =>
  Response.json({ status: 'ok', fleet: env.FLEET_NAME }),
);

// Forward to gateway for DO routes
router.all('/*', (request: Request, env: Env) =>
  env.KAGAL_WORKER.fetch(request),
);

export default router;
```

## Frontend: Raw Fetch

See [`apps/demo-vanilla/src/index.ts`][demo-vanilla]
for a minimal example forwarding to the gateway.

## mTLS Setup (Consumer's Responsibility)

1. Upload the root CA cert to Cloudflare:
   SSL/TLS > Client Certificates > upload CA cert
2. Enable mTLS for the Worker's hostname:
   SSL/TLS > Client Certificates > Hosts > add hostname
3. Do **not** create a WAF rule to block unverified
   certs — Kagal handles auth in the Worker

## SSH via `kagal-ssh-proxy`

`kagal-ssh-proxy` acts as an SSH `ProxyCommand`,
opening a tunnel WebSocket and splicing it to
stdin/stdout.

```text
Host kagal-*
    ProxyCommand kagal-ssh-proxy %h
    User root
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

> **Security note:** `StrictHostKeyChecking no` and
> `UserKnownHostsFile /dev/null` disable SSH host key
> verification. The mTLS control channel already
> authenticates agents. For stricter environments:
> managed `known_hosts`, SSH CA host key signing, or
> distributing host keys via the task queue.

[demo-vanilla]: ../apps/demo-vanilla/src/index.ts
