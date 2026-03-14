<!-- cSpell:words kagalctl -->

# Integration Guide

How to mount Kagal into different frontend frameworks
and configure the backing DO Worker.

## Consumer `wrangler.toml` Templates

### DO Worker

```toml
name = "my-fleet-do"
main = "src/index.ts"
compatibility_date = "2026-03-13"
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
binding = "AGENT_INDEX"
id = "<wrangler kv namespace create AGENT_INDEX>"
```

### Frontend Worker

```toml
name = "my-fleet-app"
main = "src/index.ts"
compatibility_date = "2026-03-13"
compatibility_flags = ["nodejs_compat"]

# Service binding to the DO worker
[[services]]
binding = "KAGAL_WORKER"
service = "my-fleet-do"
```

## Frontend: Nuxt 4 / Nitro

```typescript
// server/plugins/kagal.ts
import { createKagalRouter } from '@kagal/server';

const kagal = createKagalRouter();

export default defineNitroPlugin((nitroApp) => {
  for (const route of kagal.routes) {
    if (route.method === 'WS') continue;
    nitroApp.router.add(
      `/kagal${route.path}`,
      defineEventHandler(async (event) => {
        return route.handler(
          toWebRequest(event),
          event.context.cloudflare.env,
        );
      }),
      route.method,
    );
  }
});
```

> **Note:** Use `toWebRequest(event)` — not
> `event.node.req` — to get a standard `Request`
> object on Cloudflare Workers.

## Frontend: Hono

```typescript
import { Hono } from 'hono';
import { createKagalRouter } from '@kagal/server';

const kagal = createKagalRouter();
const app = new Hono();

for (const route of kagal.routes) {
  if (route.method === 'WS') continue;
  app.on(route.method, `/kagal${route.path}`, (c) =>
    route.handler(c.req.raw, c.env, c.executionCtx),
  );
}

export default app;
```

## Frontend: itty-router

```typescript
import { createKagalRouter } from '@kagal/server';
import { AutoRouter } from 'itty-router';

const kagal = createKagalRouter();
const router = AutoRouter();

for (const route of kagal.routes) {
  if (route.method === 'WS') continue;
  const method = route.method.toLowerCase();
  if (method in router) {
    router[method](`/kagal${route.path}`, (request, env, context) =>
      route.handler(request, env, context),
    );
  }
}

export default router;
```

## Frontend: Raw Fetch

See [`apps/demo-vanilla/src/index.ts`][demo-vanilla]
for a minimal example using `kagal.handle()` as a
catch-all.

## mTLS Setup (Consumer's Responsibility)

1. Upload the root CA cert to Cloudflare:
   SSL/TLS > Client Certificates > upload CA cert
2. Enable mTLS for the Worker's hostname:
   SSL/TLS > Client Certificates > Hosts > add hostname
3. Do **not** create a WAF rule to block unverified
   certs — Kagal handles auth in the Worker

[demo-vanilla]: ../apps/demo-vanilla/src/index.ts
