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
  (process.env.BTC_RPC_URL ? expandEnv(process.env.BTC_RPC_URL) : undefined) ??
  'https://btc.nownodes.io/';
const BLOCKBOOK_URL =
  (process.env.BTC_BLOCKBOOK_URL ? expandEnv(process.env.BTC_BLOCKBOOK_URL) : undefined) ??
  'https://btcbook.nownodes.io';

export async function btcRpc<T>(method: string, params: unknown[] = []): Promise<T> {
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
      jsonrpc: '1.0',
      id: 'nownodes-btc-example',
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
    throw new Error(JSON.stringify(payload?.error ?? payload, null, 2));
  }

  return payload.result as T;
}

export async function btcBook<T>(path: string, query: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error('Set NOWNODES_API_KEY before running this example.');
  }

  const url = new URL(path, BLOCKBOOK_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'api-key': API_KEY,
    },
  });
  const text = await response.text();
  let payload: any;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`NOWNodes Blockbook returned a non-JSON response (${response.status}): ${text}`);
  }

  if (!response.ok || payload?.error) {
    throw new Error(JSON.stringify(payload?.error ?? payload, null, 2));
  }

  return payload as T;
}

export async function btcBookPost<T>(path: string, body: string, contentType = 'text/plain'): Promise<T> {
  if (!API_KEY) {
    throw new Error('Set NOWNODES_API_KEY before running this example.');
  }

  const response = await fetch(new URL(path, BLOCKBOOK_URL), {
    method: 'POST',
    headers: {
      'content-type': contentType,
      'api-key': API_KEY,
    },
    body,
  });
  const text = await response.text();
  let payload: any;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`NOWNodes Blockbook returned a non-JSON response (${response.status}): ${text}`);
  }

  if (!response.ok || payload?.error) {
    throw new Error(JSON.stringify(payload?.error ?? payload, null, 2));
  }

  return payload as T;
}

export function requireArg(value: string | undefined, usage: string): string {
  if (!value) throw new Error(usage);
  return value;
}

export function getFlag(name: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function ensureHex(value: string, label = 'hex'): string {
  const clean = value.startsWith('0x') ? value.slice(2) : value;
  if (!clean || clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error(`Invalid ${label}: expected even-length hex.`);
  }
  return clean.toLowerCase();
}

export function satsToBtc(value: string | number | bigint | undefined): string | null {
  if (value === undefined) return null;
  const sats = typeof value === 'bigint' ? value : BigInt(value);
  const whole = sats / 100_000_000n;
  const fraction = sats % 100_000_000n;
  if (fraction === 0n) return whole.toString();
  return `${whole.toString()}.${fraction.toString().padStart(8, '0').replace(/0+$/, '')}`;
}

export function btcToSats(value: number): bigint {
  return BigInt(Math.round(value * 100_000_000));
}

export function formatBtc(value: number | undefined): string | null {
  if (typeof value !== 'number') return null;
  return value.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
}
