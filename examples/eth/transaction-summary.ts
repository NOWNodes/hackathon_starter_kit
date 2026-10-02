import { ethRpc, formatEther, hexToBigInt, hexToNumber } from './_rpc';

const hash = process.argv[2];

if (!hash) {
  throw new Error('Usage: npm exec tsx examples/eth/transaction-summary.ts <TX_HASH>');
}

const [tx, receipt] = await Promise.all([
  ethRpc<any | null>('eth_getTransactionByHash', [hash]),
  ethRpc<any | null>('eth_getTransactionReceipt', [hash]),
]);

if (!tx) {
  console.log(JSON.stringify({ hash, found: false }, null, 2));
  process.exit(0);
}

const valueWei = hexToBigInt(tx.value);
const gasUsed = receipt?.gasUsed ? hexToBigInt(receipt.gasUsed) : null;
const effectiveGasPrice = receipt?.effectiveGasPrice ? hexToBigInt(receipt.effectiveGasPrice) : null;
const paidFeeWei = gasUsed !== null && effectiveGasPrice !== null ? gasUsed * effectiveGasPrice : null;

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
      status: receipt ? (receipt.status === '0x1' ? 'success' : 'failed') : 'pending-or-no-receipt',
      gasLimit: hexToNumber(tx.gas),
      gasUsed: receipt?.gasUsed ? hexToNumber(receipt.gasUsed) : null,
      effectiveGasPriceWei: effectiveGasPrice?.toString() ?? null,
      paidFeeWei: paidFeeWei?.toString() ?? null,
      paidFeeEth: paidFeeWei !== null ? formatEther(paidFeeWei) : null,
      inputSelector: tx.input && tx.input !== '0x' ? tx.input.slice(0, 10) : null,
      inputBytes: tx.input === '0x' ? 0 : (tx.input.length - 2) / 2,
      logsCount: receipt?.logs?.length ?? null,
    },
    null,
    2,
  ),
);
