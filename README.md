# Kagal

> *Kagal* (𒆍𒃲, Ká.Gal) — Sumerian for "Great Gate".

A library for managing agent fleets over Cloudflare's
edge. See [DESIGN.md] for architecture and protocol
details.

## Packages

| Package | Description |
|---------|-------------|
| [`@kagal/proto`](packages/@kagal-proto) | Generated protobuf-es wire types |
| [`@kagal/worker`](packages/@kagal-worker) | Durable Object library (WebSocket, task queue, nonce chain, tunnel splice) |
| [`@kagal/server`](packages/@kagal-server) | Server library for fleet management frontends |
| [`@kagal/agent`](packages/@kagal-agent) | Agent CLI and library (citty) |

## Provenance

All `@kagal/*` packages are published with
[npm provenance](https://docs.npmjs.com/generating-provenance-statements)
via GitHub Actions OIDC — no long-lived tokens involved.
Each published version is cryptographically linked to
its source commit and build workflow in this repository.

## Licence

[MIT](LICENCE.txt)

[DESIGN.md]: DESIGN.md
