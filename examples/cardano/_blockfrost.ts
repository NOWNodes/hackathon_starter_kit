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
const BLOCKFROST_URL =
  (process.env.ADA_BLOCKFROST_URL ? expandEnv(process.env.ADA_BLOCKFROST_URL) : undefined) ??
  'https://ada-blockfrost.nownodes.io';

export async function adaGet<T>(
  route: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  if (!API_KEY) {
    throw new Error('Set NOWNODES_API_KEY before running this example.');
  }

  const url = new URL(route, BLOCKFROST_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'api-key': API_KEY,
      accept: 'application/json',
    },
  });
  const text = await response.text();
  let payload: any;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`NOWNodes Cardano returned a non-JSON response (${response.status}): ${text}`);
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

export function getValue(index = 0): string | undefined {
  return process.argv.slice(2).filter((arg) => !arg.startsWith('--'))[index];
}

export function getFlag(name: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
}

export function getNumberFlag(name: string, fallback: number): number {
  const value = getFlag(name);
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return parsed;
}

export function lovelaceToAda(value: string | number | bigint | undefined): string | null {
  if (value === undefined) return null;
  const lovelace = typeof value === 'bigint' ? value : BigInt(value);
  const whole = lovelace / 1_000_000n;
  const fraction = lovelace % 1_000_000n;
  if (fraction === 0n) return whole.toString();
  return `${whole.toString()}.${fraction.toString().padStart(6, '0').replace(/0+$/, '')}`;
}

type BlockSummary = {
  hash: string;
  height: number;
  slot?: number;
  tx_count?: number;
};

type BlockTxs = (string | {
  tx_hash?: string;
  hash?: string;
})[];

type TxUtxos = {
  inputs?: { address?: string; amount?: { unit: string; quantity: string }[] }[];
  outputs?: { address?: string; amount?: { unit: string; quantity: string }[] }[];
};

export async function getLatestBlock(): Promise<BlockSummary> {
  return adaGet<BlockSummary>('/blocks/latest');
}

export async function pickRecentTxHash(): Promise<string> {
  const latest = await getLatestBlock();
  const txs = await adaGet<BlockTxs>(`/blocks/${latest.hash}/txs`, { count: 1, page: 1 });
  const first = txs[0];
  const txHash = typeof first === 'string' ? first : first?.tx_hash ?? first?.hash;
  if (!txHash) {
    throw new Error('Latest block did not expose a transaction hash. Pass a tx hash explicitly.');
  }
  return txHash;
}

export async function pickRecentAddress(): Promise<string> {
  const txHash = await pickRecentTxHash();
  const utxos = await adaGet<TxUtxos>(`/txs/${txHash}/utxos`);
  const address = utxos.outputs?.find((output) => output.address)?.address ?? utxos.inputs?.find((input) => input.address)?.address;
  if (!address) {
    throw new Error('Could not derive an address from the latest transaction. Pass an address explicitly.');
  }
  return address;
}

export async function pickRecentAssetUnit(): Promise<string> {
  const txHash = await pickRecentTxHash();
  const utxos = await adaGet<TxUtxos>(`/txs/${txHash}/utxos`);
  const values = [...(utxos.outputs ?? []), ...(utxos.inputs ?? [])].flatMap((entry) => entry.amount ?? []);
  const asset = values.find((value) => value.unit && value.unit !== 'lovelace')?.unit;
  if (!asset) {
    throw new Error('Could not find a native asset in the latest transaction. Pass an asset unit explicitly.');
  }
  return asset;
}

export async function pickPoolId(): Promise<string> {
  const pools = await adaGet<string[]>('/pools', { count: 1, page: 1, order: 'desc' });
  const poolId = pools[0];
  if (!poolId) {
    throw new Error('Could not fetch a stake pool id. Pass a pool id explicitly.');
  }
  return poolId;
}
