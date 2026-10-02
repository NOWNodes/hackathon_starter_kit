import { callBtcRpc } from '../adapters/btc.mjs';
import { callSolanaRpc } from '../adapters/solana.mjs';

export async function rpcProxyRoute(body, chain = 'solana') {
  const method = body?.method;
  const params = Array.isArray(body?.params) ? body.params : [];

  if (!method || typeof method !== 'string') {
    const error = new Error('Request body must include a string "method"');
    error.status = 400;
    throw error;
  }

  const response = chain === 'btc' ? await callBtcRpc(method, params) : await callSolanaRpc(method, params);

  return {
    chain,
    method,
    params,
    latencyMs: response.latencyMs,
    result: response.result,
    raw: response.raw,
  };
}
