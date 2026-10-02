import { btcBook, requireArg, satsToBtc } from './_rpc';

const address = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/address-balance.ts <BTC_ADDRESS>',
);

const account = await btcBook<any>(`/api/v2/address/${encodeURIComponent(address)}`, {
  details: 'basic',
});

console.log(
  JSON.stringify(
    {
      address: account.address ?? address,
      balanceSats: account.balance,
      balanceBtc: satsToBtc(account.balance),
      totalReceivedSats: account.totalReceived,
      totalReceivedBtc: satsToBtc(account.totalReceived),
      totalSentSats: account.totalSent,
      totalSentBtc: satsToBtc(account.totalSent),
      unconfirmedBalanceSats: account.unconfirmedBalance ?? null,
      unconfirmedBalanceBtc: satsToBtc(account.unconfirmedBalance),
      txs: account.txs ?? null,
      unconfirmedTxs: account.unconfirmedTxs ?? null,
    },
    null,
    2,
  ),
);
