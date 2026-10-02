import { ethRpc, hexToNumber } from './_rpc';

const fullTransactions = process.argv.includes('--full');
const blockNumberHex = await ethRpc<string>('eth_blockNumber');
const block = await ethRpc<any>('eth_getBlockByNumber', [blockNumberHex, fullTransactions]);

console.log(
  JSON.stringify(
    {
      blockNumber: hexToNumber(blockNumberHex),
      blockNumberHex,
      hash: block?.hash ?? null,
      parentHash: block?.parentHash ?? null,
      timestamp: hexToNumber(block?.timestamp),
      gasUsed: hexToNumber(block?.gasUsed),
      gasLimit: hexToNumber(block?.gasLimit),
      baseFeePerGas: block?.baseFeePerGas ? block.baseFeePerGas : null,
      transactionCount: block?.transactions?.length ?? 0,
      sampleTransactions: (block?.transactions ?? []).slice(0, 10),
    },
    null,
    2,
  ),
);
