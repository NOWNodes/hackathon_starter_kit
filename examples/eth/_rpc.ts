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
  (process.env.ETH_RPC_URL ? expandEnv(process.env.ETH_RPC_URL) : undefined) ??
  'https://eth.nownodes.io/';

export async function ethRpc<T>(method: string, params: unknown[] = []): Promise<T> {
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
      id: 'nownodes-eth-example',
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

export function hexToBigInt(hex: string | null | undefined): bigint {
  if (!hex || hex === '0x') return 0n;
  return BigInt(hex);
}

export function hexToNumber(hex: string | null | undefined): number | null {
  if (!hex) return null;
  return Number(hexToBigInt(hex));
}

export function formatUnits(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = absolute / base;
  const fraction = absolute % base;

  if (fraction === 0n) return `${negative ? '-' : ''}${whole.toString()}`;

  const fractionText = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole.toString()}.${fractionText}`;
}

export function formatEther(wei: bigint): string {
  return formatUnits(wei, 18);
}

export function normalizeAddress(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return address.toLowerCase();
}

export function padAddress(address: string): string {
  return normalizeAddress(address).slice(2).padStart(64, '0');
}

export function padUint(value: string | number | bigint): string {
  const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
  if (bigintValue < 0n) {
    throw new Error('ABI uint values cannot be negative.');
  }
  return bigintValue.toString(16).padStart(64, '0');
}

export function decodeUint(hex: string): bigint {
  return hexToBigInt(hex);
}

export function decodeAddress(hex: string): string {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length < 64) {
    throw new Error(`Invalid ABI address word: ${hex}`);
  }
  return `0x${clean.slice(-40)}`.toLowerCase();
}

export function decodeAbiString(hex: string): string {
  if (!hex || hex === '0x') return '';

  const data = hex.slice(2);
  if (data.length === 64) {
    return Buffer.from(data, 'hex').toString('utf8').replace(/\0+$/, '');
  }

  const offset = Number(BigInt(`0x${data.slice(0, 64)}`));
  const lengthStart = offset * 2;
  const length = Number(BigInt(`0x${data.slice(lengthStart, lengthStart + 64)}`));
  const stringStart = lengthStart + 64;
  return Buffer.from(data.slice(stringStart, stringStart + length * 2), 'hex').toString('utf8');
}

export async function ethCall(to: string, data: string, block = 'latest'): Promise<string> {
  return ethRpc<string>('eth_call', [
    {
      to: normalizeAddress(to),
      data,
    },
    block,
  ]);
}
