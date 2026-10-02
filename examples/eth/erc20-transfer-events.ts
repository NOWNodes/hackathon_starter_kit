import { ethRpc, hexToBigInt, hexToNumber, normalizeAddress, padAddress } from './_rpc';

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const token = process.argv[2];
const args = process.argv.slice(3);

function getArg(name: string): string | undefined {
  return args.find((arg) => arg.startsWith(`${name}=`))?.split('=').slice(1).join('=');
}

if (!token) {
  throw new Error(
    'Usage: npm exec -- tsx examples/eth/erc20-transfer-events.ts <TOKEN_ADDRESS> [--from-block=HEX_OR_TAG] [--to-block=HEX_OR_TAG] [--from=ADDRESS] [--to=ADDRESS] [--limit=N]',
  );
}

const tokenAddress = normalizeAddress(token);
const latestBlockHex = await ethRpc<string>('eth_blockNumber');
const latestBlock = hexToNumber(latestBlockHex) ?? 0;
const fromBlock = getArg('--from-block') ?? `0x${Math.max(0, latestBlock - 20).toString(16)}`;
const toBlock = getArg('--to-block') ?? latestBlockHex;
const from = getArg('--from');
const to = getArg('--to');
const limit = Number(getArg('--limit') ?? 10);

if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
  throw new Error('--limit must be an integer from 1 to 100.');
}

const topics = [
  TRANSFER_TOPIC,
  from ? `0x${padAddress(from)}` : null,
  to ? `0x${padAddress(to)}` : null,
];

const logs = await ethRpc<any[]>('eth_getLogs', [
  {
    address: tokenAddress,
    fromBlock,
    toBlock,
    topics,
  },
]);

const transfers = logs.slice(0, limit).map((log) => ({
  blockNumber: hexToNumber(log.blockNumber),
  transactionHash: log.transactionHash,
  logIndex: hexToNumber(log.logIndex),
  from: `0x${log.topics[1].slice(-40)}`.toLowerCase(),
  to: `0x${log.topics[2].slice(-40)}`.toLowerCase(),
  valueRaw: hexToBigInt(log.data).toString(),
}));

console.log(
  JSON.stringify(
    {
      token: tokenAddress,
      fromBlock,
      toBlock,
      from: from ? normalizeAddress(from) : null,
      to: to ? normalizeAddress(to) : null,
      logsCount: logs.length,
      showing: transfers.length,
      transfers,
    },
    null,
    2,
  ),
);
