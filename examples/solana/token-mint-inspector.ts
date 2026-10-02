import { solanaRpc } from './_rpc';

const mint = process.argv[2];

if (!mint) {
  throw new Error('Usage: npm exec tsx examples/solana/token-mint-inspector.ts <TOKEN_MINT>');
}

type ParsedAccountInfo = {
  context: {
    slot: number;
  };
  value: null | {
    data:
      | [string, 'base64']
      | {
          program: string;
          parsed?: {
            type?: string;
            info?: Record<string, unknown>;
          };
          space: number;
        };
    executable: boolean;
    lamports: number;
    owner: string;
    space?: number;
  };
};

type TokenSupplyResponse = {
  context: {
    slot: number;
  };
  value: {
    amount: string;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: string;
  };
};

const account = await solanaRpc<ParsedAccountInfo>('getAccountInfo', [
  mint,
  {
    commitment: 'finalized',
    encoding: 'jsonParsed',
  },
]);

if (!account.value) {
  console.log(JSON.stringify({ mint, found: false }, null, 2));
  process.exit(0);
}

let supply: TokenSupplyResponse | null = null;
try {
  supply = await solanaRpc<TokenSupplyResponse>('getTokenSupply', [
    mint,
    {
      commitment: 'finalized',
    },
  ]);
} catch {
  supply = null;
}

const parsedData = Array.isArray(account.value.data) ? null : account.value.data;

console.log(
  JSON.stringify(
    {
      mint,
      contextSlot: account.context.slot,
      ownerProgram: account.value.owner,
      executable: account.value.executable,
      lamports: account.value.lamports,
      space: account.value.space ?? parsedData?.space ?? null,
      parsedType: parsedData?.parsed?.type ?? null,
      parsedProgram: parsedData?.program ?? null,
      mintInfo: parsedData?.parsed?.info ?? null,
      tokenSupply: supply?.value ?? null,
    },
    null,
    2,
  ),
);
