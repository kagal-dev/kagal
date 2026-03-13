# Kagal

A library for managing agent fleets over Cloudflare's
edge. See [DESIGN.md] for architecture and protocol
details.

## About the name

*Kagal* (𒆍𒃲, Ká.Gal) is named after the Sumerian
"Great Gate" — the monumental complex that served as the
heartbeat of ancient city-state administration. In the
context of this library, Kagal represents the critical
infrastructure that bridges the chaotic edge with the
structured cloud.

The library serves the same role for agent fleets:
a control plane on Cloudflare's edge where agents
authenticate via mTLS, receive commands over persistent
WebSockets, and are supervised through Durable Objects.
Every connection passes through one well-defined gate.

## Packages

| Package | Description |
|---------|-------------|
| [`@kagal/proto`](packages/@kagal-proto) | Generated protobuf-es wire types |
| [`@kagal/worker`](packages/@kagal-worker) | Durable Object library (WebSocket, task queue, nonce chain, tunnel splice) |
| [`@kagal/server`](packages/@kagal-server) | Server library for fleet management frontends |
| [`@kagal/agent`](packages/@kagal-agent) | Agent CLI and library (citty) |

## Go

| Path | Description |
|------|-------------|
| `pkg/proto/kagal/v1` | Generated protobuf types (`kagal.dev/pkg/proto/kagal/v1`) |
| `pkg/agent` | Agent-side library |
| `cmd/kagal` | Reference agent binary |
| `cmd/kagalctl` | Fleet management CLI |
| `cmd/kagal-ssh-proxy` | SSH ProxyCommand helper |

## Provenance

All `@kagal/*` packages are published with
[npm provenance](https://docs.npmjs.com/generating-provenance-statements)
via GitHub Actions OIDC — no long-lived tokens involved.
Each published version is cryptographically linked to
its source commit and build workflow in this repository.

## Licence

[MIT](LICENCE.txt)

[DESIGN.md]: DESIGN.md
