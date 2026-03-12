<!-- cSpell:words cloudflared hono itty kagalctl -->

# Kagal — Design Document

> *Kagal* (𒆍𒃲, Ká.Gal) — Sumerian for "Great Gate".

A library for managing agent fleets over
Cloudflare's edge.

## Overview

Kagal is a **library** for building fleet
management platforms on Cloudflare Workers. It provides
the primitives for connecting thousands of agents behind
NAT to a central control plane: persistent control
channels, on-demand tunnels, task dispatch, mTLS
authentication, and clone detection — all running on
Cloudflare's edge with zero idle cost.

Kagal ships as three npm packages:

- **`@kagal/worker`** — Durable Object library. Exports
  Agent DO (per-agent WebSocket, SQLite task queue,
  nonce chain, tunnel splice) and Supervisor DO (fleet
  queries, agent registry).
- **`@kagal/server`** — Server library for frontends.
  Exports auth middleware, route handlers, and
  integration helpers. The consumer mounts Kagal into
  their own Worker (Hono, itty-router, Nitro, raw fetch
  handler — whatever they prefer).
- **`@kagal/agent`** — TypeScript agent CLI and library
  built with citty. Manages the control WebSocket,
  nonce rotation, task execution, and reconnection.
  Extensible for domain-specific agents.

A Go module (`kagal.dev`) is planned for after the
TypeScript packages stabilise.

### Why?

Cloudflare Tunnels (`cloudflared`) has a hard limit of
1,000 tunnels per account (Free and Pay-as-you-go).
Enterprise pricing is required to raise this. Kagal
replaces `cloudflared` with a lightweight architecture
that scales to unlimited agents at ~$5/month.

### Design Principles

- **Library, not framework**: Kagal doesn't own your
  HTTP router or your application logic. You import
  what you need.
- **Zero idle cost**: Durable Object WebSocket
  Hibernation means 2,000 connected-but-idle agents
  cost nothing.
- **mTLS-first**: No passwords, no API keys. Every
  agent and operator authenticates with X.509
  certificates from a private CA.
- **Clone-aware**: A rolling nonce protocol detects
  cloned agents and quarantines them until a human
  intervenes.
- **Offline-resilient**: Agents can go offline for
  years and reconnect. Expired certs trigger a grace
  flow, not a brick.

---

## Architecture

```text
┌──────────────────────────────────────────────────────┐
│                  Cloudflare Edge                     │
│                                                      │
│  ┌────────────────────┐  ┌─────────────────────────┐ │
│  │ Frontend Worker    │  │ DO Worker               │ │
│  │ (@kagal/server)    │  │ (@kagal/worker)         │ │
│  │                    │  │                         │ │
│  │ + mTLS auth        │  │ ┌─────────────────────┐ │ │
│  │ + fleet routes    ───▶│ │ Supervisor DO       │ │ │
│  │ + WSS forward      │  │ │ - Fleet queries     │ │ │
│  │ + consumer routes  │  │ │ - Agent registry    │ │ │
│  └────────────────────┘  │ └─────────────────────┘ │ │
│                          │ ┌─────────────────────┐ │ │
│                          │ │ Agent DO            │ │ │
│                          │ │ - Hibernating WSS   │ │ │
│                          │ │ - SQLite task queue │ │ │
│                          │ │ - Nonce chain state │ │ │
│                          │ │ - Tunnel splice     │ │ │
│                          │ └─────────────────────┘ │ │
│                          │                         │ │
│                          └─────────────────────────┘ │
└──────────────────────────────────────────────────────┘
       ▲ WSS (control)       ▲ WSS (tunnel)  ▲ HTTPS
       │                     │               │
  ┌────┴──────┐        ┌─────┴────┐    ┌─────┴──────┐
  │ Agent     │        │ Agent    │    │ Operator   │
  │ @kagal/   │        │ (tunnel  │    │ (browser / │
  │  agent    │        │  active) │    │  kagalctl) │
  └───────────┘        └──────────┘    └────────────┘
```

### What Kagal Provides vs. What the Consumer Provides

| Kagal provides | Consumer provides |
|----------------|-------------------|
| Agent DO class (WebSocket, task queue, nonce chain, tunnel splice) | Worker entry point and HTTP router |
| Supervisor DO (fleet queries, agent registry) | Application-specific coordination logic |
| Private CA lifecycle + mTLS auth | Cert issuance callback |
| Agent registry (KV-backed) | KV namespace binding |
| TypeScript agent library (control loop, reconnect, task dispatch) | Task handler implementations |
| Clone detection + quarantine protocol | Quarantine resolution UI/workflow |
| Tunnel splice (port forwarding, SSH) | Tunnel client (ProxyCommand, etc.) |

Application-specific storage (firmware, backups) is
**not** part of core — consumers implement their own
R2/D1/KV routes.

---

## Package: `@kagal/worker` (npm)

The Durable Object library. Exports two DO classes:

- **Agent DO** — One instance per agent. Manages
  WebSocket, task queue, nonce chain, tunnel splice.
- **Supervisor DO** — Singleton. Fleet queries,
  agent registry, cross-agent operations.

Type definitions and interfaces are in
[`packages/@kagal-worker/src/types.ts`][worker-types].

The consumer's DO Worker env extends `KagalEnv` with
their own bindings. The consumer's frontend Worker
extends `KagalServerEnv` (a `Fetcher` service binding
to the DO Worker).

`KagalWorkerConfig` is passed to
`createKagalHandler()`. It configures lifecycle hooks
and protocol parameters for the DO Worker.

---

## Package: `@kagal/server` (npm)

The server library for building fleet management
frontends. Runs in the consumer's frontend Worker.

Type definitions and interfaces are in
[`packages/@kagal-server/src/types.ts`][server-types].

`createKagalRouter(config)` returns a `KagalRouter`
the consumer mounts into their Worker. Provides both
a route list for framework adapters and a direct
`handle()` for raw fetch handlers. Forwards requests
to the DO Worker via the service binding.

Lifecycle hooks and DO-level configuration live in
`KagalWorkerConfig` (see `@kagal/worker` above).

### Core Routes

```text
POST   /register             — agent self-registration
GET    /agents               — list all agents (operator)
GET    /agents/:id           — get agent details (operator)
POST   /agents/:id/tasks     — enqueue a task (operator)
GET    /agents/:id/tasks     — list tasks (operator)
GET    /agents/:id/tasks/:task_id — get task status
POST   /agents/:id/claim     — claim a quarantined agent
WS     /ws/:id               — agent control WebSocket
WS     /agents/:id/tunnel    — tunnel data WebSocket
GET    /pki/ca.crt           — download root CA cert
```

Application-specific routes (firmware, backups, etc.)
are **not** part of the core router.

### Integration Examples

See the demo applications under `apps/`:

- **`demo-worker/`** — DO Worker hosting Agent and
  Supervisor DOs. Re-exports the DO classes and uses
  `createKagalHandler()` as the fetch handler.
- **`demo-hono/`** — Frontend Worker using Hono.
  Mounts `kagal.routes` into the Hono app.
- **`demo-vanilla/`** — Minimal frontend using raw
  fetch. Uses `kagal.handle()` as a catch-all.

The frontend Worker's `Env` includes a `Fetcher`
service binding to the DO Worker. `createKagalRouter`
uses this binding to forward requests.

---

## Package: `@kagal/agent` (npm)

TypeScript agent library and CLI built with citty.
Manages the control WebSocket, nonce rotation, task
execution, and reconnection.

Type definitions and interfaces are in
[`packages/@kagal-agent/src/types.ts`][agent-types].

### CLI

```bash
kagal run --server https://fleet.example.com/kagal \
          --agent-id agent-001 \
          --cert agent.crt --key agent.key
```

The CLI is extensible: consumers import from
`@kagal/agent` and build domain-specific agent
binaries using citty's subcommand pattern.

The agent binary acts as both a local service (daemon)
and a local client of that service. No RPC in the
first releases.

---

## Go Module: `kagal.dev` (Planned)

A Go module is planned for after the TypeScript packages
stabilise. It will provide `pkg/agent` (agent library),
`cmd/kagal` (reference agent), `cmd/kagalctl` (fleet
management CLI), and `cmd/kagal-ssh-proxy` (tunnel
ProxyCommand helper).

---

## Core Protocol

### Control Channel

Each agent maintains a single persistent WebSocket to
its Agent DO.

- **URL**: `wss://<host>/<prefix>/ws/<agent_id>`
- **Keep-alive**: `setWebSocketAutoResponse` handles
  ping/pong without waking the DO (zero cost).
- **Reconnection**: Exponential backoff with jitter:
  1s → 2s → 4s → … → max 300s. Reset on success.
- **Messages**: protobuf-es encoded binary frames.
  Heartbeats (ping/pong) remain as WebSocket protocol
  frames handled by `setWebSocketAutoResponse`.

### Message Schema

Messages are defined as Protocol Buffers and encoded
using protobuf-es. TypeScript types for messages
(`ServerMessage`, `AgentMessage`) are generated from
the proto definitions — not hand-written.

The schema covers:

**Server → Agent:**

- `task` — dispatch a task (task_id, action, params)
- `nonce` — rotate nonce
- `quarantine` — quarantine with claim code

**Agent → Server:**

- `hello` — initial handshake (nonce, boot_count,
  hw_serial)
- `task_result` — task outcome (task_id, status, data)
- `status` — periodic status update

### Connection Flow

```text
Agent                           Agent DO
  │                                   │
  │──── WSS connect (mTLS cert) ─────▶│
  │                                   │
  │──── hello { nonce, boot_count,    │
  │             hw_serial }     ─────▶│  Validate nonce
  │                                   │
  │◀──── nonce { nonce: new } ────────│  Rotate nonce
  │                                   │
  │◀──── task { ... } ────────────────│  Dispatch queued
  │                                   │
  │──── status { version, ... } ─────▶│  Update metadata
  │                                   │
  │      ... idle (DO hibernates) ... │
  │                                   │
```

---

## Nonce Chain Protocol

The nonce chain provides **clone detection** and
**offline resilience**.

### State

Stored in the Agent DO's `nonce_state` table (see
[`schema.sql`][schema-sql]): `nonce_current`,
`nonce_previous`, `rotated_at`, `boot_count`,
`hw_serial`.

### Validation Logic

- **Matches current nonce** → OK
- **Matches previous nonce within grace period** → OK
- **Mismatch + different hw_serial** → quarantine
  (clone)
- **Mismatch + same serial, stale boot count** →
  quarantine (replay)
- **Mismatch + same serial, new boot** → quarantine
  (state loss)
- **No state** → first connect, onboarding quarantine

### Quarantine & Claim Flow

Quarantine covers two cases: **onboarding** (new
agents without a certificate) and **clone detection**
(nonce mismatch on existing agents). In both cases
the agent is related to an identity but its true
ownership is unproven: a bootstrap JWT validates the
token, not the physical device; a clone shares
credentials with the original. Quarantine holds the
agent (connected but untrusted) until a human
confirms its identity. Both use the same claim flow:

1. Agent is quarantined (contained but connected)
2. Agent displays an OAuth2 device code
3. Human enters the code, authenticates, and
   identifies the agent
4. For onboarding: server issues a certificate
5. For clones: server resets the nonce chain
6. Agent is un-quarantined

---

## PKI — Private Certificate Authority

Kagal manages a private CA for agent authentication.
Each agent gets one certificate with dual Extended Key
Usage (`serverAuth` + `clientAuth`). The CA certificate
is uploaded to Cloudflare so it can validate incoming
client certs via `request.cf.tlsClientAuth`.

Cert issuance uses a consumer-provided callback,
allowing custom CA implementations or external
providers. A reference CA package (`@kagal/ca` or
similar) is planned. Future: ACME support with an
external identity token.

### Agent Onboarding

New agents start without a certificate:

1. Agent connects with a bootstrap JWT containing
   signed identity claims and optionally a reference
   to a previously rejected certificate
2. Server pre-registers the agent and quarantines it
3. Agent displays an OAuth2 device code
4. Human identifies the agent: entity, group, role
5. Server issues a client certificate via the
   consumer's cert callback
6. Agent reconnects with mTLS — fully operational

### Steady-State Identity Resolution

1. Agent presents client cert during TLS handshake
2. Cloudflare populates `request.cf.tlsClientAuth`
3. Auth middleware reads `certFingerprintSHA256`
4. Looks up `cert:<fingerprint>` in KV →
   `{ agent_id, role }`

TBD: JWT signing authority, bootstrap endpoint
contract, cert issuance callback interface.

---

## Agent Durable Object

One instance per agent, containing all per-agent state.

### SQLite Schema

See [`packages/@kagal-worker/sql/schema.sql`][schema-sql].

### Key Behaviours

- **Hibernation**: The DO hibernates when no messages
  flow. `setWebSocketAutoResponse` handles keep-alive.
- **Task dispatch**: On connect/reconnect, all `queued`
  tasks are dispatched. Tasks in `dispatched` state for
  over 5 minutes are reset to `queued` on reconnect.
- **Tunnel splice**: Two tagged WebSockets
  (agent-side + client-side). Binary frames forwarded
  bidirectionally. SSH is the primary use case.
- **Supervisor notifications**: On connect, disconnect,
  and status changes, notifies the Supervisor DO to
  update fleet state. Trivial per-agent KV updates
  (e.g. `agent:<id>` online flag) may be written
  directly.
- **Hooks**: Calls lifecycle callbacks
  (`onAgentConnect`, `onAgentDisconnect`,
  `onAgentError`, `onQuarantine`, etc.) for consumer
  integration.

---

## Supervisor Durable Object

Singleton DO for fleet-level operations. Agent DOs
notify the Supervisor of lifecycle events (connect,
disconnect, status changes); the Supervisor
accumulates these into fleet state. The DO Worker's
fetch handler routes agent WebSocket upgrades directly
to Agent DOs (preserving hibernation); fleet and
operator requests go through the Supervisor.

### Responsibilities

- **Fleet state**: Accumulates lifecycle events from
  Agent DOs to maintain fleet-wide state (online
  count, agent list, metadata) in KV.
- **Fleet queries**: List agents, get status, bulk
  operations across the fleet.
- **Task dispatch**: Enqueue tasks to Agent DOs on
  behalf of operators.
- **Cross-agent operations**: Broadcast tasks, bulk
  queries, and coordination that individual Agent DOs
  cannot handle in isolation.

The Supervisor is **not** in the agent WebSocket path.
Agent WebSocket connections are routed by the DO
Worker's fetch handler directly to Agent DOs, keeping
the hibernation cost model intact.

---

## KV Namespace Layout

| Key Pattern | Value |
|-------------|-------|
| `cert:<sha256>` | `{"agent_id":"...","role":"agent","registered_at":"..."}` |
| `revoked:<sha256>` | `{"revoked_at":"...","reason":"..."}` |
| `agent:<agent_id>` | `{"online":true,"last_seen":"...","version":"...","quarantined":false,"pending_tasks":0}` |

---

## Tunnels

On-demand data channels for forwarding TCP ports
through the Agent DO. The DO splices a pair of tagged
WebSockets (agent-side + client-side) bidirectionally.
Tunnels are not persistent — they tear down when
either side closes.

### Port Forwarding Flow

1. Operator calls `POST /agents/:id/tasks` with
   `{"action": "tunnel_open", "params": {"port": N}}`
2. DO dispatches to agent via control WebSocket
3. Agent opens a data WebSocket to
   `/agents/:id/tunnel?role=agent`
4. Agent dials `localhost:N`, splices TCP ↔ WebSocket
5. Client connects via
   `/agents/:id/tunnel?role=client`
6. DO splices the two WebSockets bidirectionally
7. Tunnel closes when either side disconnects

### SSH Tunnels

SSH is port forwarding to `:22` with a
`ProxyCommand` helper for transparent `ssh` usage.

Uses `kagal-ssh-proxy` (planned Go binary) as
ProxyCommand:

```text
Host kagal-*
    ProxyCommand kagal-ssh-proxy %h
    User root
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

> **Security note:** `StrictHostKeyChecking no` and
> `UserKnownHostsFile /dev/null` disable SSH host key
> verification. In practice, the mTLS control channel
> already authenticates agents, and host keys typically
> don't change without also changing the agent ID.
> For stricter environments, alternatives include
> `StrictHostKeyChecking` with a managed `known_hosts`,
> SSH CA-based host key signing, or distributing host
> keys via the task queue.

---

## Cost Model

### Cloudflare Workers Paid Plan: $5/month

The key insight: **WebSocket Hibernation** means idle
agents cost nothing. `setWebSocketAutoResponse` handles
pings without waking the DO. The DO only incurs charges
when actively processing a task or tunnel session.

### Included Monthly Quotas

| Resource | Included | Overage |
|----------|----------|---------|
| Worker requests | 10M | $0.30/M |
| DO requests | 1M | $0.15/M |
| DO duration | 400K GB-s | $12.50/M GB-s |
| KV reads | 10M | $0.50/M |
| KV writes | 1M | $5.00/M |
| KV storage | 1 GB | $0.50/GB |
| DO storage (SQLite) | 5 GB | $0.20/GB |

Incoming WebSocket messages bill at a **20:1 ratio**
(100 messages = 5 billable DO requests). Outgoing
messages and protocol-level pings are free.

### 2,000-Agent Estimate

2,000 connected-but-idle agents with ~10 messages/day
each: ~90K DO requests/month (9% of quota), ~3,800
GB-s duration (1% of quota). KV and storage are
negligible. The fleet fits comfortably within the
$5/month plan.

---

## Demo Structure

The repository includes demo applications for local
development with `pnpm dev`:

```text
apps/
├── demo-worker/         # Deploys Agent + Supervisor DOs
│   ├── src/index.ts
│   └── wrangler.toml
├── demo-vanilla/        # Minimal frontend (raw fetch, OAuth2 device)
│   ├── src/index.ts
│   └── wrangler.toml
├── demo-hono/           # Hono frontend
│   ├── src/index.ts
│   └── wrangler.toml
└── demo-nuxt/           # Nuxt 4 (planned)
```

The frontend Worker connects to the DO Worker via a
service binding. Agent WebSocket upgrades are routed
directly to Agent DOs; fleet operations go through the
Supervisor DO. `demo-nuxt` (Nuxt 4) is planned.

---

## Implementation Phases

### Phase 0: Proto Schema + Codegen

1. Define protobuf message schema
2. Set up protobuf-es codegen
3. Determine buf.build publishing strategy

### Phase 1: Core Library

1. `@kagal/worker`: Agent DO with SQLite schema
2. `@kagal/worker`: Supervisor DO
3. `@kagal/server`: Auth middleware (`kagalAuth`)
4. `@kagal/server`: Route factory (`createKagalRouter`)
5. `@kagal/worker`: Control WebSocket with hibernation
6. `@kagal/worker`: Task queue
7. `@kagal/agent`: Config, WebSocket loop, reconnection
8. `@kagal/agent`: Task dispatcher + status reporter
9. Integration test via demo apps

### Phase 2: Nonce Chain + Clone Detection

1. `@kagal/worker`: Nonce state in DO SQLite
2. `@kagal/worker`: Nonce validation + quarantine
3. `@kagal/server`: Quarantine state + claim endpoint
4. `@kagal/agent`: Nonce persistence, hello message
5. Test: clone detection, grace window, claim flow
6. `@kagal/server`: Agent onboarding (bootstrap JWT,
   cert issuance callback)

### Phase 3: Tunnels

1. `@kagal/worker`: Tunnel WebSocket splice in DO
2. `@kagal/agent`: Tunnel handler (port forwarding)
3. SSH ProxyCommand helper
4. Test: full SSH session through the relay

### Phase 4: Go Agent (Planned)

1. `pkg/agent`: Go agent library
2. `cmd/kagal`: Reference agent binary
3. `cmd/kagalctl`: Fleet management CLI
4. `cmd/kagal-ssh-proxy`: SSH ProxyCommand helper
5. Test: Go agent ↔ TypeScript server

### Phase 5: Polish & Publish

1. Documentation and integration guide
2. Demo applications (vanilla, Hono, Nuxt 4)

---

## TBD — Open Questions

1. **WebSocket Upgrade Mechanics**: Document the
   canonical pattern for upgrading HTTP → WebSocket
   and handing to the DO.

2. **`kagalAuth` Middleware Contract**: Define return
   type, behaviour for `/register`, revoked certs,
   and missing certs.

3. **Agent Onboarding Flow**: Define bootstrap JWT
   format, OAuth2 device flow integration, and
   `POST /register` contract.

4. **First-Connect Nonce Initialisation**: Define
   whether nonce state is created on registration or
   first WebSocket connect.

5. **Certificate Lifecycle**: Define cert issuance
   callback interface, `cert_renew` task, and
   `@kagal/ca` reference implementation.

6. **DO Worker Routing**: Define how `createKagalHandler`
   routes requests: WebSocket upgrades to Agent DOs,
   fleet operations to Supervisor DO.

7. **Deployment Topologies**: Document single-Worker
   (all-in-one) vs. multi-Worker (service binding)
   patterns and their trade-offs for upgrade isolation.

8. **Proto Schema Location**: Determine proto file
   structure and buf.build publishing strategy for
   the protobuf message definitions.

<!-- named references -->
[worker-types]: packages/@kagal-worker/src/types.ts
[server-types]: packages/@kagal-server/src/types.ts
[agent-types]: packages/@kagal-agent/src/types.ts
[schema-sql]: packages/@kagal-worker/sql/schema.sql
