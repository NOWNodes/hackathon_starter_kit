import { btcBook, getFlag, requireArg, satsToBtc } from './_rpc';

const address = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/address-transactions.ts <BTC_ADDRESS> [--page=1] [--limit=1..50] [--full]',
);
const page = Math.max(Number(getFlag('page') ?? 1), 1);
const pageSize = Math.min(Math.max(Number(getFlag('limit') ?? 10), 1), 50);
const details = process.argv.includes('--full') ? 'txs' : 'txids';

const account = await btcBook<any>(`/api/v2/address/${encodeURIComponent(address)}`, {
  details,
  page,
  pageSize,
});

const transactions = account.transactions ?? [];

console.log(
  JSON.stringify(
    {
      address: account.address ?? address,
      page: account.page ?? page,
      totalPages: account.totalPages ?? null,
      txCount: account.txs ?? null,
      balanceBtc: satsToBtc(account.balance),
      mode: details,
      txids: details === 'txids' ? account.txids ?? [] : undefined,
      transactions:
        details === 'txs'
          ? transactions.map((tx: any) => ({
              txid: tx.txid,
              blockHeight: tx.blockHeight ?? null,
              confirmations: tx.confirmations ?? 0,
              valueBtc: satsToBtc(tx.value),
              feesBtc: satsToBtc(tx.fees),
              vin: tx.vin?.length ?? 0,
              vout: tx.vout?.length ?? 0,
            }))
          : undefined,
    },
    null,
    2,
  ),
);
