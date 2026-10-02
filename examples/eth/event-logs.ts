import { ethRpc, hexToNumber, normalizeAddress } from './_rpc';

const contract = process.argv[2];
const topic0 = process.argv[3];
const fromBlockArg = process.argv[4];
const toBlockArg = process.argv[5];

if (!contract || !topic0) {
  throw new Error(
    'Usage: npm exec tsx examples/eth/event-logs.ts <CONTRACT_ADDRESS> <TOPIC0> [FROM_BLOCK] [TO_BLOCK]',
  );
}

if (!/^0x[a-fA-F0-9]{64}$/.test(topic0)) {
  throw new Error('TOPIC0 must be a 32-byte hex topic.');
}

const latestBlockHex = await ethRpc<string>('eth_blockNumber');
const latestBlock = hexToNumber(latestBlockHex) ?? 0;
const fromBlock = fromBlockArg ?? `0x${Math.max(0, latestBlock - 20).toString(16)}`;
const toBlock = toBlockArg ?? latestBlockHex;

const logs = await ethRpc<any[]>('eth_getLogs', [
  {
    address: normalizeAddress(contract),
    topics: [topic0],
    fromBlock,
    toBlock,
  },
]);

console.log(
  JSON.stringify(
    {
      contract: normalizeAddress(contract),
      topic0,
      fromBlock,
      toBlock,
      logsCount: logs.length,
      sampleLogs: logs.slice(0, 10).map((log) => ({
        blockNumber: hexToNumber(log.blockNumber),
        transactionHash: log.transactionHash,
        logIndex: hexToNumber(log.logIndex),
        topics: log.topics,
        dataBytes: log.data === '0x' ? 0 : (log.data.length - 2) / 2,
      })),
    },
    null,
    2,
  ),
);
