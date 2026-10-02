import { getLatestSolanaState, getSolBalance, getTransaction } from '../adapters/solana.mjs';

export async function latestSolanaRoute() {
  return getLatestSolanaState();
}

export async function addressRoute(address) {
  if (!address) {
    const error = new Error('Address is required');
    error.status = 400;
    throw error;
  }

  return getSolBalance(address);
}

export async function transactionRoute(signature) {
  if (!signature) {
    const error = new Error('Transaction signature is required');
    error.status = 400;
    throw error;
  }

  return getTransaction(signature);
}
