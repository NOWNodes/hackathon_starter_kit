import { callBtcRpc } from '../apps/api/src/adapters/btc.mjs';
import { callSolanaRpc } from '../apps/api/src/adapters/solana.mjs';
import { config } from '../apps/api/src/config.mjs';

async function main() {
  const checks = [];

  checks.push({
    label: 'NOWNodes API key',
    ok: Boolean(config.nownodesApiKey),
  });

  if (!config.nownodesApiKey) {
    print(checks);
    process.exit(1);
  }

  try {
    const slot = await callSolanaRpc('getSlot');
    checks.push({
      label: 'Solana getSlot',
      ok: Number.isFinite(slot.result),
      detail: slot.result,
    });
  } catch (error) {
    checks.push({
      label: 'Solana getSlot',
      ok: false,
      detail: error.message,
    });
  }

  try {
    const blockHash = await callBtcRpc('getbestblockhash');
    checks.push({
      label: 'Bitcoin getbestblockhash',
      ok: typeof blockHash.result === 'string' && blockHash.result.length === 64,
      detail: blockHash.result,
    });
  } catch (error) {
    checks.push({
      label: 'Bitcoin getbestblockhash',
      ok: false,
      detail: error.message,
    });
  }

  try {
    const response = await fetch(new URL('/blocks/latest', config.adaBlockfrostUrl), {
      method: 'GET',
      headers: {
        'api-key': config.nownodesApiKey,
        accept: 'application/json',
      },
    });
    const latestBlock = await response.json();
    checks.push({
      label: 'Cardano Blockfrost latest block',
      ok: response.ok && typeof latestBlock?.hash === 'string' && Number.isFinite(latestBlock?.height),
      detail: latestBlock?.hash ?? JSON.stringify(latestBlock),
    });
  } catch (error) {
    checks.push({
      label: 'Cardano Blockfrost latest block',
      ok: false,
      detail: error.message,
    });
  }

  print(checks);
  process.exit(checks.every((check) => check.ok) ? 0 : 1);
}

function print(checks) {
  for (const check of checks) {
    console.log(`${check.label}: ${check.ok ? 'OK' : 'FAIL'}`);
    if (check.detail !== undefined) console.log(`Detail: ${check.detail}`);
  }
  console.log(`Result: ${checks.every((check) => check.ok) ? 'PASS' : 'FAIL'}`);
}

main();
