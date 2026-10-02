import { ethRpc, hexToBigInt, hexToNumber } from './_rpc';

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const hash = process.argv[2];

if (!hash) {
  throw new Error('Usage: npm exec tsx examples/eth/decode-erc20-transfer.ts <TX_HASH>');
}

const receipt = await ethRpc<any | null>('eth_getTransactionReceipt', [hash]);

if (!receipt) {
  console.log(JSON.stringify({ hash, found: false, note: 'Receipt may still be pending.' }, null, 2));
  process.exit(0);
}

const transfers = (receipt.logs ?? [])
  .filter((log: any) => log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC)
  .map((log: any) => ({
    token: log.address,
    from: `0x${log.topics[1].slice(-40)}`.toLowerCase(),
    to: `0x${log.topics[2].slice(-40)}`.toLowerCase(),
    valueRaw: hexToBigInt(log.data).toString(),
    blockNumber: hexToNumber(log.blockNumber),
    transactionHash: log.transactionHash,
    logIndex: hexToNumber(log.logIndex),
  }));

console.log(
  JSON.stringify(
    {
      transactionHash: receipt.transactionHash,
      status: receipt.status === '0x1' ? 'success' : 'failed',
      transferLogs: transfers.length,
      transfers,
    },
    null,
    2,
  ),
);
