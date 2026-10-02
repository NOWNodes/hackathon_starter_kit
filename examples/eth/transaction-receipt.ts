import { ethRpc, hexToBigInt, hexToNumber } from './_rpc';

const hash = process.argv[2];

if (!hash) {
  throw new Error('Usage: npm exec tsx examples/eth/transaction-receipt.ts <TX_HASH>');
}

const receipt = await ethRpc<any | null>('eth_getTransactionReceipt', [hash]);

if (!receipt) {
  console.log(JSON.stringify({ hash, found: false, note: 'Receipt may still be pending.' }, null, 2));
  process.exit(0);
}

console.log(
  JSON.stringify(
    {
      transactionHash: receipt.transactionHash,
      blockNumber: hexToNumber(receipt.blockNumber),
      status: receipt.status === '0x1' ? 'success' : 'failed',
      from: receipt.from,
      to: receipt.to,
      contractAddress: receipt.contractAddress,
      cumulativeGasUsed: hexToNumber(receipt.cumulativeGasUsed),
      gasUsed: hexToNumber(receipt.gasUsed),
      effectiveGasPriceWei: receipt.effectiveGasPrice
        ? hexToBigInt(receipt.effectiveGasPrice).toString()
        : null,
      logsCount: receipt.logs?.length ?? 0,
      sampleLogs: (receipt.logs ?? []).slice(0, 5).map((log: any) => ({
        address: log.address,
        topics: log.topics,
        dataBytes: log.data === '0x' ? 0 : (log.data.length - 2) / 2,
        logIndex: hexToNumber(log.logIndex),
      })),
    },
    null,
    2,
  ),
);
