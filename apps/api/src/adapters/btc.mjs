import { config } from '../config.mjs';

export class BtcRpcError extends Error {
  constructor(message, details, status = 502) {
    super(message);
    this.name = 'BtcRpcError';
    this.details = details;
    this.status = status;
  }
}

export async function callBtcRpc(method, params = []) {
  if (!config.nownodesApiKey) {
    throw new BtcRpcError('NOWNODES_API_KEY is not configured', null, 500);
  }

  const startedAt = performance.now();
  const response = await fetch(config.btcRpcUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': config.nownodesApiKey,
    },
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: 'nownodes-btc-rpc',
      method,
      params,
    }),
  });
  const latencyMs = Math.round(performance.now() - startedAt);
  const text = await response.text();

  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new BtcRpcError('NOWNodes returned a non-JSON response', text, response.status);
  }

  if (!response.ok || payload?.error) {
    throw new BtcRpcError('NOWNodes Bitcoin RPC request failed', payload, response.status);
  }

  return {
    result: payload.result,
    raw: payload,
    latencyMs,
  };
}

export async function getLatestBtcState() {
  const [blockchainInfo, bestBlockHash] = await Promise.all([
    callBtcRpc('getblockchaininfo'),
    callBtcRpc('getbestblockhash'),
  ]);
  const header = await callBtcRpc('getblockheader', [bestBlockHash.result, true]);

  return {
    network: config.btcNetwork,
    chain: blockchainInfo.result?.chain ?? null,
    blocks: blockchainInfo.result?.blocks ?? null,
    headers: blockchainInfo.result?.headers ?? null,
    bestBlockHash: bestBlockHash.result,
    medianTime: header.result?.mediantime ?? null,
    difficulty: header.result?.difficulty ?? null,
    latencyMs: bestBlockHash.latencyMs,
  };
}

export async function getBtcBlock(hashOrHeight) {
  const blockHash = /^\d+$/.test(hashOrHeight)
    ? (await callBtcRpc('getblockhash', [Number(hashOrHeight)])).result
    : hashOrHeight;
  const block = await callBtcRpc('getblock', [blockHash, 1]);

  return {
    hash: blockHash,
    block: block.result,
    latencyMs: block.latencyMs,
  };
}

export async function getBtcTransaction(txid, blockHash = null) {
  const params = blockHash ? [txid, true, blockHash] : [txid, true];
  const tx = await callBtcRpc('getrawtransaction', params);

  return {
    txid,
    blockHash,
    transaction: tx.result,
    latencyMs: tx.latencyMs,
  };
}
