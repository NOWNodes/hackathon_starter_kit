import { lamportsToSol, solanaRpc } from './_rpc';

const signature = process.argv[2];

if (!signature) {
  throw new Error('Usage: npm exec tsx examples/solana/transaction-parser.ts <SIGNATURE>');
}

type ParsedTransaction = {
  blockTime: number | null;
  meta: null | {
    err: null | unknown;
    fee: number;
    logMessages?: string[] | null;
    postBalances?: number[];
    postTokenBalances?: unknown[];
    preBalances?: number[];
    preTokenBalances?: unknown[];
  };
  slot: number;
  transaction: {
    message: {
      accountKeys: Array<
        | string
        | {
            pubkey: string;
            signer?: boolean;
            writable?: boolean;
          }
      >;
      instructions: Array<{
        program?: string;
        programId?: string;
      }>;
    };
    signatures: string[];
  };
  version?: 'legacy' | number;
};

const transaction = await solanaRpc<ParsedTransaction | null>('getTransaction', [
  signature,
  {
    commitment: 'finalized',
    encoding: 'jsonParsed',
    maxSupportedTransactionVersion: 0,
  },
]);

if (!transaction) {
  console.log(JSON.stringify({ signature, found: false }, null, 2));
  process.exit(0);
}

const accountKeys = transaction.transaction.message.accountKeys;
const signers = accountKeys
  .filter((key) => typeof key !== 'string' && key.signer)
  .map((key) => (typeof key === 'string' ? key : key.pubkey));

const programs = [
  ...new Set(
    transaction.transaction.message.instructions.map((instruction) =>
      instruction.program ? `${instruction.program} (${instruction.programId})` : instruction.programId,
    ),
  ),
].filter(Boolean);

const preBalances = transaction.meta?.preBalances ?? [];
const postBalances = transaction.meta?.postBalances ?? [];
const solBalanceChanges = accountKeys
  .map((key, index) => {
    const pubkey = typeof key === 'string' ? key : key.pubkey;
    const before = preBalances[index];
    const after = postBalances[index];
    if (before === undefined || after === undefined || before === after) return null;
    const deltaLamports = after - before;
    return {
      pubkey,
      deltaLamports,
      deltaSol: lamportsToSol(deltaLamports),
    };
  })
  .filter(Boolean);

console.log(
  JSON.stringify(
    {
      signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      version: transaction.version ?? null,
      status: transaction.meta?.err ? 'error' : 'ok',
      error: transaction.meta?.err ?? null,
      feeLamports: transaction.meta?.fee ?? null,
      feeSol: transaction.meta?.fee ? lamportsToSol(transaction.meta.fee) : null,
      signers,
      programs,
      instructionCount: transaction.transaction.message.instructions.length,
      logCount: transaction.meta?.logMessages?.length ?? 0,
      tokenBalanceChangeRows: {
        pre: transaction.meta?.preTokenBalances?.length ?? 0,
        post: transaction.meta?.postTokenBalances?.length ?? 0,
      },
      solBalanceChanges,
    },
    null,
    2,
  ),
);
