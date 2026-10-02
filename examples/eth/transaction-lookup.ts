import { ethRpc, formatEther, hexToBigInt, hexToNumber } from './_rpc';

const hash = process.argv[2];

if (!hash) {
  throw new Error('Usage: npm exec tsx examples/eth/transaction-lookup.ts <TX_HASH>');
}

const tx = await ethRpc<any | null>('eth_getTransactionByHash', [hash]);

if (!tx) {
  console.log(JSON.stringify({ hash, found: false }, null, 2));
  process.exit(0);
}

const valueWei = hexToBigInt(tx.value);

console.log(
  JSON.stringify(
    {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      valueWei: valueWei.toString(),
      valueEth: formatEther(valueWei),
      blockNumber: hexToNumber(tx.blockNumber),
      transactionIndex: hexToNumber(tx.transactionIndex),
      nonce: hexToNumber(tx.nonce),
      gas: hexToNumber(tx.gas),
      gasPrice: tx.gasPrice ? hexToBigInt(tx.gasPrice).toString() : null,
      maxFeePerGas: tx.maxFeePerGas ? hexToBigInt(tx.maxFeePerGas).toString() : null,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas
        ? hexToBigInt(tx.maxPriorityFeePerGas).toString()
        : null,
      inputBytes: tx.input === '0x' ? 0 : (tx.input.length - 2) / 2,
    },
    null,
    2,
  ),
);
