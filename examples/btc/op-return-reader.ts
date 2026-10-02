import { btcRpc, getFlag, requireArg } from './_rpc';

const blockId = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/op-return-reader.ts <BLOCK_HEIGHT_OR_HASH> [--limit=1..100]',
);
const limit = Math.min(Math.max(Number(getFlag('limit') ?? 20), 1), 100);
const blockHash = /^\d+$/.test(blockId) ? await btcRpc<string>('getblockhash', [Number(blockId)]) : blockId;
const block = await btcRpc<any>('getblock', [blockHash, 2]);

const opReturns: any[] = [];

for (const tx of block.tx ?? []) {
  for (const output of tx.vout ?? []) {
    const script = output.scriptPubKey ?? {};
    const isOpReturn = script.type === 'nulldata' || String(script.asm ?? '').startsWith('OP_RETURN');
    if (!isOpReturn) continue;

    const hex = script.hex ? String(script.hex).replace(/^6a/, '') : '';
    let utf8: string | null = null;
    try {
      utf8 = hex ? Buffer.from(hex, 'hex').toString('utf8').replace(/\0+$/, '') : null;
    } catch {
      utf8 = null;
    }

    opReturns.push({
      txid: tx.txid,
      n: output.n,
      value: output.value,
      asm: script.asm ?? null,
      hex: script.hex ?? null,
      utf8,
    });

    if (opReturns.length >= limit) break;
  }
  if (opReturns.length >= limit) break;
}

console.log(
  JSON.stringify(
    {
      blockHash: block.hash,
      height: block.height,
      transactionCount: block.nTx,
      shown: opReturns.length,
      opReturns,
    },
    null,
    2,
  ),
);
