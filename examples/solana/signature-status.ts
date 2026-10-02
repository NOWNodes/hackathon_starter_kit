import { solanaRpc } from './_rpc';

const signatures = process.argv.slice(2);

if (!signatures.length || signatures.length > 256) {
  throw new Error(
    'Usage: npm exec tsx examples/solana/signature-status.ts <SIGNATURE> [MORE_SIGNATURES...]',
  );
}

type SignatureStatusResponse = {
  context: {
    slot: number;
  };
  value: Array<null | {
    slot: number;
    confirmations: null | number;
    err: null | unknown;
    status: unknown;
    confirmationStatus: null | string;
  }>;
};

const response = await solanaRpc<SignatureStatusResponse>('getSignatureStatuses', [
  signatures,
  {
    searchTransactionHistory: true,
  },
]);

const statuses = signatures.map((signature, index) => ({
  signature,
  status: response.value[index],
}));

console.log(`Context slot: ${response.context.slot}`);
console.log(JSON.stringify(statuses, null, 2));
