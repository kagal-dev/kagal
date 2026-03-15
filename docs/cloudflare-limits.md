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

## Workers Paid Plan: $5/month

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

| Resource | Usage | Quota | % |
|----------|-------|-------|---|
| Worker requests | ~200K/mo | 10M | 2% |
| DO requests | ~90K/mo | 1M | 9% |
| DO duration | ~3,800 GB-s | 400K GB-s | 1% |
| DO storage | ~20MB | 5 GB | <1% |
| KV reads | ~50K/mo | 10M | <1% |
| KV writes | ~100K/mo | 1M | 10% |

2,000 connected-but-idle agents with ~10 messages/day
each (status interval ≥ 3600s for idle agents). Status
reports wake the DO from hibernation, so the interval
directly affects DO request usage. The fleet fits
comfortably within the $5/month plan at hourly status
intervals; a 5-minute interval would consume ~86% of
the DO quota.

[cf-docs]: https://developers.cloudflare.com/workers/platform/limits/
