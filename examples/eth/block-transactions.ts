import { ethRpc, formatEther, hexToBigInt, hexToNumber } from './_rpc';

const blockArg = process.argv[2] ?? 'latest';
const limit = Number(process.argv[3] ?? 10);

if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
  throw new Error('Usage: npm exec tsx examples/eth/block-transactions.ts [BLOCK_NUMBER_HEX_OR_TAG] [LIMIT_1_TO_100]');
}

const block = await ethRpc<any | null>('eth_getBlockByNumber', [blockArg, true]);

if (!block) {
  console.log(JSON.stringify({ block: blockArg, found: false }, null, 2));
  process.exit(0);
}

const transactions = (block.transactions ?? []).slice(0, limit).map((tx: any) => {
  const valueWei = hexToBigInt(tx.value);
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    valueWei: valueWei.toString(),
    valueEth: formatEther(valueWei),
    nonce: hexToNumber(tx.nonce),
    gas: hexToNumber(tx.gas),
    transactionIndex: hexToNumber(tx.transactionIndex),
    inputSelector: tx.input && tx.input !== '0x' ? tx.input.slice(0, 10) : null,
  };
});

console.log(
  JSON.stringify(
    {
      blockNumber: hexToNumber(block.number),
      blockHash: block.hash,
      timestamp: hexToNumber(block.timestamp),
      totalTransactions: block.transactions?.length ?? 0,
      showing: transactions.length,
      transactions,
    },
    null,
    2,
  ),
);
