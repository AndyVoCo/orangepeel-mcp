#!/usr/bin/env node
// Orange Peel MCP bridge — a tiny stdio↔HTTP proxy for MCP clients that only speak stdio
// (some desktop clients still expect a local `command` + stdio transport rather than a
// Streamable-HTTP URL). This script has ZERO dependencies beyond Node 18+'s built-in
// `fetch` and reads/writes newline-delimited JSON-RPC messages on stdin/stdout, forwarding
// each one as a single POST to the hosted Orange Peel MCP endpoint.
//
// If your client supports Streamable HTTP directly (Claude Desktop, Cursor, most current
// clients do), you do NOT need this script — point the client straight at
// https://orangepeel.to/api/mcp. Use this bridge only for stdio-only clients.
//
// Usage (no install/build step — just run the file with Node):
//   node bridge.js
// Optional env vars:
//   OP_MCP_ENDPOINT   — override the endpoint (default https://orangepeel.to/api/mcp)
//   OP_PARTNER_KEY     — an Orange Peel partner key, sent as the OP-Partner-Key header
//
// Example MCP client config (stdio):
//   { "mcpServers": { "orangepeel": { "command": "node", "args": ["/path/to/bridge.js"] } } }

"use strict";

const ENDPOINT = process.env.OP_MCP_ENDPOINT || "https://orangepeel.to/api/mcp";
const PARTNER_KEY = process.env.OP_PARTNER_KEY || "";

let buffer = "";
let inFlight = 0;
let stdinEnded = false;

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let idx;
  // Each complete JSON-RPC message arrives as one line (LSP/MCP stdio framing: newline-delimited JSON).
  while ((idx = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (line) { inFlight++; forward(line).finally(() => { inFlight--; maybeExit(); }); }
  }
});

// Exit only once stdin has closed AND every in-flight request has been answered — a plain
// `process.exit()` on "end" would race and drop responses still awaiting their fetch.
process.stdin.on("end", () => { stdinEnded = true; maybeExit(); });
function maybeExit() { if (stdinEnded && inFlight === 0) process.exit(0); }

async function forward(line) {
  let headers = { "content-type": "application/json" };
  if (PARTNER_KEY) headers["op-partner-key"] = PARTNER_KEY;

  try {
    const res = await fetch(ENDPOINT, { method: "POST", headers, body: line });
    // Notifications (no "id" in the request) get a 202 with no body — nothing to relay.
    if (res.status === 202) return;
    const text = await res.text();
    if (text) process.stdout.write(text + "\n");
  } catch (err) {
    // Best-effort JSON-RPC error reply so the client doesn't hang waiting for this request's id.
    let id = null;
    try { id = JSON.parse(line).id ?? null; } catch { /* ignore parse failure */ }
    const errBody = JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: `bridge: failed to reach ${ENDPOINT}: ${err.message}` },
    });
    process.stdout.write(errBody + "\n");
  }
}
