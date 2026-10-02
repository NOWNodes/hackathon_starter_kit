import { getBtcBlock, getBtcTransaction, getLatestBtcState } from '../adapters/btc.mjs';

export async function latestBtcRoute() {
  return getLatestBtcState();
}

export async function btcBlockRoute(hashOrHeight) {
  if (!hashOrHeight) {
    const error = new Error('Block hash or height is required');
    error.status = 400;
    throw error;
  }

  return getBtcBlock(hashOrHeight);
}

export async function btcTransactionRoute(txid, blockHash = null) {
  if (!txid) {
    const error = new Error('Transaction id is required');
    error.status = 400;
    throw error;
  }

  return getBtcTransaction(txid, blockHash);
}
