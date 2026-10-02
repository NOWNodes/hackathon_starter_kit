import { btcRpc, requireArg } from './_rpc';

const address = requireArg(
  process.argv[2],
  'Usage: npm exec -- tsx examples/btc/validate-address.ts <BTC_ADDRESS>',
);

const result = await btcRpc<any>('validateaddress', [address]);

console.log(
  JSON.stringify(
    {
      address,
      isValid: Boolean(result.isvalid),
      scriptPubKey: result.scriptPubKey ?? null,
      isScript: result.isscript ?? null,
      isWitness: result.iswitness ?? null,
      witnessVersion: result.witness_version ?? null,
      witnessProgram: result.witness_program ?? null,
    },
    null,
    2,
  ),
);
