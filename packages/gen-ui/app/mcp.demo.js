#!/usr/bin/env node
// Demo: auto-connect, capture session from connect_wallet, auto-inject into
// get_account_status. Session value is never printed.
import { connect, call, onState } from './mcp.js';

onState((s) => {
  if (s.connected) console.log(`CONNECTED (${s.tools.length} tools)`);
  else console.log(`DISCONNECTED: ${s.error}`);
});

await connect();

const wallet = await call('connect_wallet', {});
console.log(`connect_wallet status=${wallet.data.status} wallet_address=${wallet.data.wallet_address ?? '(pending approval)'}`);

// No session arg here — injected automatically.
const status = await call('get_account_status', {});
console.log(`get_account_status keys: ${Object.keys(status.data).join(', ')}`);
