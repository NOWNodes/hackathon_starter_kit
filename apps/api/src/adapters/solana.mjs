import { config } from '../config.mjs';

export class SolanaRpcError extends Error {
  constructor(message, details, status = 502) {
    super(message);
    this.name = 'SolanaRpcError';
    this.details = details;
    this.status = status;
  }
}

export async function callSolanaRpc(method, params = []) {
  if (!config.nownodesApiKey) {
    throw new SolanaRpcError('NOWNODES_API_KEY is not configured', null, 500);
  }

  const startedAt = performance.now();
  const response = await fetch(config.solanaRpcUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': config.nownodesApiKey,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'nownodes-solana-rpc',
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
    throw new SolanaRpcError('NOWNodes returned a non-JSON response', text, response.status);
  }

  if (!response.ok || payload?.error) {
    throw new SolanaRpcError('NOWNodes Solana RPC request failed', payload, response.status);
  }

  return {
    result: payload.result,
    raw: payload,
    latencyMs,
  };
}

export async function getLatestSolanaState() {
  const slot = await callSolanaRpc('getSlot');
  let blockHeight = null;

  try {
    blockHeight = (await callSolanaRpc('getBlockHeight')).result;
  } catch {
    blockHeight = null;
  }

  return {
    network: config.solNetwork,
    slot: slot.result,
    blockHeight,
    latencyMs: slot.latencyMs,
  };
}

export async function getSolBalance(address) {
  const balance = await callSolanaRpc('getBalance', [address]);
  const lamports = balance.result?.value ?? 0;

  return {
    address,
    lamports,
    sol: lamports / 1_000_000_000,
    context: balance.result?.context ?? null,
    latencyMs: balance.latencyMs,
  };
}

export async function getTransaction(signature) {
  const tx = await callSolanaRpc('getTransaction', [
    signature,
    {
      encoding: 'jsonParsed',
      maxSupportedTransactionVersion: 0,
    },
  ]);

  return {
    signature,
    transaction: tx.result,
    latencyMs: tx.latencyMs,
  };
}
