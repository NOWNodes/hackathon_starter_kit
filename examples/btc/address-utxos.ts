import { btcBook, getFlag, requireArg, satsToBtc } from './_rpc';

const address = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/address-utxos.ts <BTC_ADDRESS> [--confirmed=true|false] [--limit=1..100]',
);
const confirmed = getFlag('confirmed');
const limit = Math.min(Math.max(Number(getFlag('limit') ?? 20), 1), 100);

const utxos = await btcBook<any[]>(`/api/v2/utxo/${encodeURIComponent(address)}`, {
  confirmed,
});

console.log(
  JSON.stringify(
    {
      address,
      totalUtxos: utxos.length,
      shown: Math.min(limit, utxos.length),
      totalValueBtc: satsToBtc(utxos.reduce((sum, utxo) => sum + BigInt(utxo.value ?? 0), 0n)),
      utxos: utxos.slice(0, limit).map((utxo) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        valueSats: utxo.value,
        valueBtc: satsToBtc(utxo.value),
        confirmations: utxo.confirmations ?? 0,
        height: utxo.height ?? null,
        coinbase: Boolean(utxo.coinbase),
      })),
    },
    null,
    2,
  ),
);
