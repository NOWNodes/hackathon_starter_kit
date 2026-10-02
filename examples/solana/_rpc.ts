import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function expandEnv(value: string): string {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => process.env[key] ?? '');
}

loadDotEnv();

const API_KEY = process.env.NOWNODES_API_KEY;
const RPC_URL =
  (process.env.SOLANA_RPC_URL ? expandEnv(process.env.SOLANA_RPC_URL) : undefined) ??
  `https://sol.nownodes.io/${API_KEY}`;

export async function solanaRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  if (!API_KEY) {
    throw new Error('Set NOWNODES_API_KEY before running this example.');
  }

  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'nownodes-example',
      method,
      params,
    }),
  });
  const text = await response.text();
  let payload: any;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`NOWNodes returned a non-JSON response (${response.status}): ${text}`);
  }

  if (!response.ok || payload.error) {
    throw new Error(JSON.stringify(payload.error ?? payload, null, 2));
  }

  return payload.result as T;
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}
