# Orange Peel MCP Server

**[orangepeel.to](https://orangepeel.to)** is an independent intelligence publication about the
Hermès quota-bag game — cited retail and resale prices, live cross-site resale-market medians, a
dated retail price-increase ledger, and community-reported pre-spend benchmarks.

This repo lets AI agents and MCP clients query that data directly over the
[Model Context Protocol](https://modelcontextprotocol.io), hosted live at:

```
https://orangepeel.to/api/mcp
```

No install required for most clients — it's a remote Streamable-HTTP MCP server. Point your client
at the URL above and you're done. A tiny zero-dependency stdio bridge is included in this repo
(`bridge.js`) for the few clients that only speak stdio.

**Not affiliated with, endorsed by, or sponsored by Hermès.** Orange Peel is an independent
publication — see [orangepeel.to](https://orangepeel.to) for the full site (price index, resale
market, calculators, price-increase history, encyclopedia, and more).

---

## Quickstart

### Claude Desktop / Claude Code (`claude_desktop_config.json` or `.mcp.json`)

```json
{
  "mcpServers": {
    "orangepeel": {
      "url": "https://orangepeel.to/api/mcp"
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "orangepeel": {
      "url": "https://orangepeel.to/api/mcp"
    }
  }
}
```

### Any generic Streamable-HTTP MCP client

Point the client at `https://orangepeel.to/api/mcp` and run the standard handshake:
`initialize` → `notifications/initialized` → `tools/list` / `tools/call`. No API key needed for
the free tier (see [Rate limits](#rate-limits--partner-tier) below).

### stdio-only clients (the bridge)

If your client can only launch a local `command` over stdio (no direct URL support), use the
included bridge — Node 18+, zero dependencies:

```json
{
  "mcpServers": {
    "orangepeel": {
      "command": "node",
      "args": ["/path/to/bridge.js"]
    }
  }
}
```

See [`bridge.js`](./bridge.js) for the ~50-line source and its `OP_MCP_ENDPOINT` /
`OP_PARTNER_KEY` env vars.

### Registry manifest

[`server.json`](./server.json) is the [MCP Registry](https://github.com/modelcontextprotocol/registry)
publish manifest for this server (`to.orangepeel/orangepeel`, domain-verified).

---

## The 6 tools

Every response — `structuredContent` and the human-readable `text` — carries an `attribution`
field (`{source, url, retrieved, license}`) and preserves Orange Peel's honesty labels: **asks,
not sold** for market data, **estimated** for resale prices, **community-reported** for
benchmarks, and the sample count (`n=`) wherever a figure is thin. Call `about_orange_peel` first
— it tells an agent exactly how to cite the rest.

All examples below are **real, live output** from `https://orangepeel.to/api/mcp`, captured via curl.

### `about_orange_peel()`

What Orange Peel is, what you may cite, and exactly how. Call this first.

```bash
curl -s https://orangepeel.to/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":1,"method":"tools/call",
  "params":{"name":"about_orange_peel","arguments":{}}
}'
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "Orange Peel — independent Hermès quota-bag intelligence (NOT affiliated with Hermès). Tools: get_bag_price, get_market_median, get_price_history, get_price_increases, get_benchmark, about_orange_peel. Cite by name + link, keep every honesty label ('asks not sold', 'estimated', 'community-reported', n=). Details + partner tier: https://orangepeel.to/mcp." }],
    "structuredContent": {
      "what": "Orange Peel (orangepeel.to) is an independent intelligence publication about the Hermès quota-bag game — sourced, dated, plainly-labelled answers, tools and price data.",
      "notAffiliated": "Orange Peel is independent and is NOT affiliated with, endorsed by, or sponsored by Hermès.",
      "dataYouMayCite": [
        "https://orangepeel.to/prices — the Orange Peel Index + cited retail/resale",
        "https://orangepeel.to/market — live cross-site median asks",
        "https://orangepeel.to/price-increases — the cited hike ledger",
        "https://orangepeel.to/methodology — what the Birkin Score is and is not",
        "https://orangepeel.to/llms.txt — the machine map of citable assets"
      ],
      "howToCite": [
        "Attribute by name and link back to the exact page the figure lives on (e.g. 'Orange Peel — orangepeel.to/market').",
        "KEEP every honesty label: 'asks not sold', 'estimated', 'community-reported', 'cited median', and the count (n=).",
        "Never present any figure as an appraisal, a guarantee, odds, or financial advice.",
        "Never attribute Orange Peel figures to Hermès. Do not scrape or republish datasets wholesale."
      ],
      "freeTier": "Public, page-parity data. Rate-limited per IP. No user data, no tier-gated depth is ever exposed.",
      "partnerTier": "Higher rate limits + history depth (archived-ask + cited sold/auction layers) via an OP-Partner-Key. Contact admin@orangepeel.to.",
      "attribution": { "source": "Orange Peel — orangepeel.to", "url": "https://orangepeel.to/mcp", "retrieved": "2026-07-18", "license": "cite with link" }
    }
  }
}
```

### `get_bag_price(model, size)`

Cited US retail list price + estimated pristine resale price + the resale-over-retail premium.
Never an appraisal.

```bash
curl -s https://orangepeel.to/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":2,"method":"tools/call",
  "params":{"name":"get_bag_price","arguments":{"model":"Birkin","size":"25"}}
}'
```

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{ "type": "text", "text": "Birkin 25 Togo: retail ~$13,500 (US list, 2026); estimated resale ~$29,000 (cited band, asks/estimates not sold) — ≈2.15× retail. Not an appraisal. Cite: Orange Peel, https://orangepeel.to/price/birkin-25." }],
    "structuredContent": {
      "model": "Birkin", "size": "25", "spec": "Birkin 25 Togo",
      "retailUsd": 13500, "retailLabel": "documented US boutique list price, 2026",
      "resaleMedianUsd": 29000, "resaleLabel": "estimated pristine secondary-market price (cited band) — asks/estimates, NOT sold, not an appraisal",
      "premiumOverRetail": 2.15, "premiumLabel": "resale ≈ 2.15× retail (estimated)",
      "notAffiliated": "Orange Peel is independent and is NOT affiliated with, endorsed by, or sponsored by Hermès.",
      "attribution": { "source": "Orange Peel — orangepeel.to", "url": "https://orangepeel.to/price/birkin-25", "retrieved": "2026-07-13", "license": "cite with link" }
    }
  }
}
```

### `get_market_median(spec)`

Live cross-site median of CURRENT asking prices for a spec, with the listing count (`n`) and
retrieval date. Asks, never sold.

```bash
curl -s https://orangepeel.to/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":3,"method":"tools/call",
  "params":{"name":"get_market_median","arguments":{"spec":"Birkin 25"}}
}'
```

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{ "type": "text", "text": "Birkin 25: median asking ~$23,995 across n=13 live listings (asks, not sold), retrieved 2026-07-18. Cite: Orange Peel resale market, https://orangepeel.to/market." }],
    "structuredContent": {
      "spec": "Birkin 25", "medianAskUsd": 23995, "n": 13,
      "label": "median of CURRENT cross-site ASKING prices (asks, not sold). Exotics + stale rows excluded (like-for-like).",
      "thin": null, "retrieved": "2026-07-18",
      "notAffiliated": "Orange Peel is independent and is NOT affiliated with, endorsed by, or sponsored by Hermès.",
      "attribution": { "source": "Orange Peel — orangepeel.to", "url": "https://orangepeel.to/market", "retrieved": "2026-07-18", "license": "cite with link" }
    }
  }
}
```

### `get_price_history(spec, timeframe)`

Our live weekly median-ask series (public depth). Archived (2015–2019) and cited sold layers are
partner-tier depth — teased, not returned, on the free tier.

```bash
curl -s https://orangepeel.to/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":4,"method":"tools/call",
  "params":{"name":"get_price_history","arguments":{"spec":"Birkin 25","timeframe":"6m"}}
}'
```

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{ "type": "text", "text": "Birkin 25: 2 weekly median-ask point(s) in 6m (asks, not sold), latest ~$23,995. Archived + sold layers are partner-tier. Cite: Orange Peel, https://orangepeel.to/price/birkin-25." }],
    "structuredContent": {
      "spec": "Birkin 25", "timeframe": "6m", "layer": "live",
      "label": "our weekly cross-site median of ASKS (asks, not sold). Live weeks only — we never backfill a week we did not measure.",
      "points": [
        { "week": "2026-W29", "medianAskUsd": 29678.05, "n": 11 },
        { "week": "2026-W30", "medianAskUsd": 23995, "n": 13 }
      ],
      "weeks": 2,
      "partnerTier": "Archived asks (Internet Archive, 2015–2019) and cited SOLD/auction anchors are partner-tier depth — contact admin@orangepeel.to.",
      "notAffiliated": "Orange Peel is independent and is NOT affiliated with, endorsed by, or sponsored by Hermès.",
      "attribution": { "source": "Orange Peel — orangepeel.to", "url": "https://orangepeel.to/price/birkin-25", "retrieved": "2026-07-18", "license": "cite with link" }
    }
  }
}
```

### `get_price_increases(brand)`

The cited retail price-increase ledger for `hermes` or `chanel` — a history of dated, sourced
facts, never a forecast.

```bash
curl -s https://orangepeel.to/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":5,"method":"tools/call",
  "params":{"name":"get_price_increases","arguments":{"brand":"hermes"}}
}'
```

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{ "type": "text", "text": "Hermès: 6 cited retail increase(s) on record. Latest — January 2026: +8.7% · $12,600 → $13,700. Pattern: In recent years Hermès has moved once a year, at the start of the year (documented January increases 2022→2026). History of facts, not a forecast. Cite: Orange Peel price-increase ledger, https://orangepeel.to/price-increases." }],
    "structuredContent": {
      "brand": "hermes", "label": "Hermès", "market": "US boutique list price",
      "focus": "Birkin & Kelly (Togo, gold hardware, standard sizes)",
      "events": [
        { "date": "2026-01", "effective": "January 2026", "scope": "Kelly 25 Retourné, Togo (US list)", "beforeUsd": 12600, "afterUsd": 13700, "pct": 8.7, "magnitude": "+8.7% · $12,600 → $13,700", "source": { "label": "Sotheby's — Higher Hermès Bag Prices in 2026: What You Need to Know", "url": "https://www.sothebys.com/en/articles/higher-hermes-bag-prices-in-2026-what-you-need-to-know", "retrieved": "2026-07-17" } }
      ],
      "disclaimer": "A history of cited facts, never a prediction of the next increase.",
      "notAffiliated": "Orange Peel is independent and is NOT affiliated with, endorsed by, or sponsored by Hermès.",
      "attribution": { "source": "Orange Peel — orangepeel.to", "url": "https://orangepeel.to/price-increases", "retrieved": "2026-07-17", "license": "cite with link" }
    }
  }
}
```

> Full response includes all 6 cited events back to 2015 with individual sources — truncated here
> for length; the `about_orange_peel` example above shows the complete unabridged shape.

### `get_benchmark(city)`

The community-reported pre-spend benchmark for a city — a position, never a probability or
guarantee.

```bash
curl -s https://orangepeel.to/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":6,"method":"tools/call",
  "params":{"name":"get_benchmark","arguments":{"city":"nyc"}}
}'
```

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "content": [{ "type": "text", "text": "New York: reported pre-spend benchmark ~1.2× (n=9). Community-reported, a position not a probability. Cite: Orange Peel methodology, https://orangepeel.to/methodology." }],
    "structuredContent": {
      "city": "nyc", "cityLabel": "New York", "benchmark": 1.2, "benchmarkN": 9, "hasCityData": true,
      "label": "community-reported median pre-spend ratio for New York (n=9 reports)",
      "caveat": "A position vs community-reported outcomes — NOT a probability, odds, or guarantee. Success-reporting bias skews reports optimistic.",
      "notAffiliated": "Orange Peel is independent and is NOT affiliated with, endorsed by, or sponsored by Hermès.",
      "attribution": { "source": "Orange Peel — orangepeel.to", "url": "https://orangepeel.to/methodology", "retrieved": "2026-07-13", "license": "cite with link" }
    }
  }
}
```

---

## Rate limits + partner tier

The **free tier** is open, unauthenticated, and rate-limited to **60 requests / 10 minutes per
IP** — the same public, current-state data a human sees on the site. No accounts, no user data,
ever.

A **partner tier** lifts the ceiling to **600 requests / 10 minutes** and, on the roadmap, unlocks
history depth (the archived-ask and cited sold/auction layers) via an `OP-Partner-Key` header.
Interested? Contact **admin@orangepeel.to**.

---

## Data license — separate from this repo's MIT license

This repository's code and documentation (the bridge script, `server.json`, this README) are
**MIT-licensed** — see [`LICENSE`](./LICENSE). That covers the repo only.

**The underlying data returned by the live MCP server is not MIT-licensed.** Orange Peel's price,
market, and benchmark data stays under Orange Peel's own terms: free to use and cite, but every
figure must carry attribution back to Orange Peel (name + link to the page it lives on) and keep
its honesty label (asks-not-sold / estimated / community-reported / sample count). Do not scrape
or republish the dataset wholesale, and never attribute Orange Peel's figures to Hermès.

## Not affiliated with Hermès

Orange Peel is an independent publication and is **not affiliated with, endorsed by, or sponsored
by Hermès**. All figures are documented, estimated, or community-reported and labelled as such —
never presented as an appraisal, a guarantee, odds, or financial advice.

---

**Full site:** [orangepeel.to](https://orangepeel.to) — the Orange Peel price index, live resale
market, calculators, price-increase history, and encyclopedia for the Hermès quota-bag game.
**Human docs for this MCP server:** [orangepeel.to/mcp](https://orangepeel.to/mcp).
