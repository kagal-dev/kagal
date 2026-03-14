# Cloudflare Platform Limits

Reference limits relevant to Kagal's architecture.
See the [Cloudflare Workers documentation][cf-docs]
for authoritative and up-to-date values.

| Limit | Value |
|-------|-------|
| Tunnels per account (why Kagal exists) | 1,000 (Free/Pay-as-you-go) |
| DO instances | Unlimited |
| DO SQLite per instance | 10 GB |
| DO classes per account | 500 (Paid) / 100 (Free) |
| WebSocket message | 32 MiB |
| Worker memory | 128 MB |
| Worker wall time (HTTP) | Unlimited |
| DO wall time | Unlimited (while caller connected) |
| R2 max object | 5 TiB (multipart) |
| R2 egress | Free (always) |
| Request body | Free/Pro 100 MB, Business 200 MB, Enterprise 500 MB |

[cf-docs]: https://developers.cloudflare.com/workers/platform/limits/
