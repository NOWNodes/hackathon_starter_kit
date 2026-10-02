import { solanaRpc } from './_rpc';

const slotArg = process.argv[2];
const requestedSlot = slotArg ? Number(slotArg) : null;

if (slotArg && (!Number.isInteger(requestedSlot) || requestedSlot < 0)) {
  throw new Error('Usage: npm exec tsx examples/solana/block-slot-explorer.ts [SLOT]');
}

type BlockResponse = {
  blockHeight: number | null;
  blockTime: number | null;
  blockhash: string;
  parentSlot: number;
  previousBlockhash: string;
  signatures?: string[];
  transactions?: Array<{
    transaction?: {
      signatures?: string[];
    };
  }>;
};

const latestSlot = await solanaRpc<number>('getSlot', [{ commitment: 'finalized' }]);
const blockHeight = await solanaRpc<number>('getBlockHeight', [{ commitment: 'finalized' }]);
const slot = requestedSlot ?? latestSlot;

const block = await solanaRpc<BlockResponse | null>('getBlock', [
  slot,
  {
    commitment: 'finalized',
    encoding: 'json',
    transactionDetails: 'signatures',
    maxSupportedTransactionVersion: 0,
    rewards: false,
  },
]);

if (!block) {
  console.log(
    JSON.stringify(
      {
        latestSlot,
        blockHeight,
        requestedSlot: slot,
        block: null,
        note: 'Block is not available at this slot.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const signatures =
  block.signatures ??
  block.transactions?.flatMap((transaction) => transaction.transaction?.signatures ?? []) ??
  [];

console.log(
  JSON.stringify(
    {
      latestSlot,
      nodeBlockHeight: blockHeight,
      slot,
      blockHeight: block.blockHeight,
      blockTime: block.blockTime,
      blockhash: block.blockhash,
      previousBlockhash: block.previousBlockhash,
      parentSlot: block.parentSlot,
      transactionCount: signatures.length,
      sampleSignatures: signatures.slice(0, 10),
    },
    null,
    2,
  ),
);
