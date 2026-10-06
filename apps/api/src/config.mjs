import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(path.join(rootDir, '.env'));

function expandEnv(value) {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => process.env[key] ?? '');
}

export const config = {
  rootDir,
  port: Number(process.env.PORT || 3000),
  nownodesApiKey: process.env.NOWNODES_API_KEY || '',
  solNetwork: process.env.SOL_NETWORK || 'mainnet',
  solanaRpcUrl: expandEnv(
    process.env.SOLANA_RPC_URL || 'https://sol.nownodes.io/${NOWNODES_API_KEY}',
  ),
  btcNetwork: process.env.BTC_NETWORK || 'mainnet',
  btcRpcUrl: expandEnv(process.env.BTC_RPC_URL || 'https://btc.nownodes.io/'),
  adaNetwork: process.env.ADA_NETWORK || 'mainnet',
  adaBlockfrostUrl: expandEnv(process.env.ADA_BLOCKFROST_URL || 'https://ada-blockfrost.nownodes.io'),
};

export function hasNownodesConfig() {
  return Boolean(config.nownodesApiKey && config.solanaRpcUrl && config.btcRpcUrl && config.adaBlockfrostUrl);
}
