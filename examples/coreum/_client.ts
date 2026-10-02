import fs from 'node:fs';
import path from 'node:path';
import { Client, TxRaw } from 'coreum-js';

type ParsedArgs = {
  values: string[];
  flags: Record<string, string | boolean>;
};

export function loadDotEnv() {
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

loadDotEnv();

export function parseArgs(argv = process.argv.slice(2)): ParsedArgs {
  const values: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      values.push(arg);
      continue;
    }

    const [key, ...rest] = arg.slice(2).split('=');
    flags[key] = rest.length ? rest.join('=') : true;
  }

  return { values, flags };
}

export function getFlag(args: ParsedArgs, name: string, fallback?: string): string | undefined {
  const value = args.flags[name];
  if (value === undefined) return fallback;
  if (value === true) return 'true';
  return value;
}

export function hasFlag(args: ParsedArgs, name: string): boolean {
  return args.flags[name] === true || args.flags[name] === 'true';
}

export function getNetwork(args: ParsedArgs): string {
  return getFlag(args, 'network', process.env.COREUM_NETWORK || 'testnet') || 'testnet';
}

export function createCoreumClient(args: ParsedArgs) {
  const network = getNetwork(args);
  const custom_node_endpoint = getFlag(args, 'rpc', process.env.COREUM_RPC_URL);
  const custom_ws_endpoint = getFlag(args, 'ws', process.env.COREUM_WS_URL);

  return new Client({
    network,
    custom_node_endpoint,
    custom_ws_endpoint,
    tx_memo: getFlag(args, 'memo', process.env.COREUM_TX_MEMO),
  });
}

export async function connectForQuery(args: ParsedArgs) {
  const client = createCoreumClient(args);
  await client.connect();
  return client;
}

export async function connectWithMnemonic(args: ParsedArgs) {
  const mnemonic = process.env.COREUM_MNEMONIC;
  if (!mnemonic) {
    throw new Error('Set COREUM_MNEMONIC in .env to sign or broadcast Coreum transactions.');
  }

  const client = createCoreumClient(args);
  await client.connectWithMnemonic(mnemonic);
  return client;
}

export function getFromAddress(args: ParsedArgs): string | undefined {
  return getFlag(args, 'from', process.env.COREUM_FROM_ADDRESS);
}

export function getDenom(args: ParsedArgs, fallback = 'utestcore'): string {
  const networkDefault = getNetwork(args) === 'mainnet' ? 'ucore' : fallback;
  return getFlag(args, 'denom', process.env.COREUM_DENOM || networkDefault) || networkDefault;
}

export function getAmount(args: ParsedArgs, fallback = '1'): string {
  return getFlag(args, 'amount', fallback) || fallback;
}

export function ensureTestnetOrConfirmed(args: ParsedArgs) {
  const network = getNetwork(args);
  const mainnetConfirmed = network === 'mainnet' && hasFlag(args, 'mainnet') && hasFlag(args, 'yes');
  if (network === 'mainnet' && !mainnetConfirmed) {
    throw new Error('Mainnet write flow is blocked. Re-run with --network=mainnet --mainnet --yes.');
  }
}

export async function simulateMessages(args: ParsedArgs, messages: readonly any[], fromAddress?: string) {
  const client = await connectForQuery(args);
  try {
    try {
      const gas = await client.calculateGas(messages, {
        fromAddress,
        gasAdjustment: Number(getFlag(args, 'gas-adjustment', '1.2')),
      });
      const gasPrice = await client.getGasPrice();

      return {
        ok: true,
        gas,
        gasPrice: gasPrice.toString(),
        network: getNetwork(args),
        rpc: client.config.chain_rpc_endpoint,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error?.message ?? String(error),
        network: getNetwork(args),
        rpc: client.config.chain_rpc_endpoint,
      };
    }
  } finally {
    client.disconnect();
  }
}

export async function signOrBroadcast(args: ParsedArgs, messages: readonly any[], memo = '') {
  if (!hasFlag(args, 'broadcast') && !hasFlag(args, 'sign')) {
    return {
      mode: 'dry-run',
      note: 'Message built only. Add --simulate, --sign, or --broadcast for the next step.',
    };
  }

  ensureTestnetOrConfirmed(args);

  const client = await connectWithMnemonic(args);
  try {
    if (hasFlag(args, 'broadcast')) {
      if (!hasFlag(args, 'yes')) {
        throw new Error('Broadcast requires explicit --yes confirmation.');
      }
      const response = await client.sendTx(messages, memo);
      return {
        mode: 'broadcast',
        address: client.address,
        response,
      };
    }

    const txRaw = await client.signTx(messages, memo);
    return {
      mode: 'sign',
      address: client.address,
      txRawBase64: Buffer.from(TxRaw.encode(txRaw).finish()).toString('base64'),
    };
  } finally {
    client.disconnect();
  }
}

export async function runWriteFlow(args: ParsedArgs, messages: readonly any[], options: {
  memo?: string;
  fromAddress?: string;
}) {
  const simulation = hasFlag(args, 'simulate')
    ? await simulateMessages(args, messages, options.fromAddress)
    : null;
  const result = await signOrBroadcast(args, messages, options.memo ?? '');

  return {
    network: getNetwork(args),
    messageCount: messages.length,
    messages: messages.map((message) => ({
      typeUrl: message.typeUrl,
      value: message.value,
    })),
    simulation,
    result,
  };
}

export function printJson(value: unknown) {
  console.log(JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item), 2));
}
