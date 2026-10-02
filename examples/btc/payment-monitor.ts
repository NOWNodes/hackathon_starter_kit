import { btcBook, getFlag, requireArg } from './_rpc';

const txid = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/payment-monitor.ts <TXID> [--confirmations=1] [--interval-ms=5000] [--max-attempts=1]',
);
const requiredConfirmations = Math.max(Number(getFlag('confirmations') ?? 1), 0);
const intervalMs = Math.max(Number(getFlag('interval-ms') ?? 5000), 1000);
const maxAttempts = Math.max(Number(getFlag('max-attempts') ?? 1), 1);

let last: any = null;

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    last = await btcBook<any>(`/api/v2/tx/${encodeURIComponent(txid)}`);
  } catch (error: any) {
    last = { txid, error: error.message, confirmations: 0 };
  }

  const confirmations = Number(last.confirmations ?? 0);
  const confirmed = confirmations >= requiredConfirmations;
  console.log(
    JSON.stringify(
      {
        attempt,
        txid,
        requiredConfirmations,
        confirmations,
        status: confirmed ? 'confirmed' : 'waiting',
        blockHeight: last.blockHeight ?? null,
        blockHash: last.blockHash ?? null,
        error: last.error ?? undefined,
      },
      null,
      2,
    ),
  );

  if (confirmed || attempt === maxAttempts) break;
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}
