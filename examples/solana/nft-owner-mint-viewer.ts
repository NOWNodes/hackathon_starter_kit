import { solanaRpc } from './_rpc';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

const mode = process.argv[2];
const value = process.argv[3];
const limit = Number(process.argv[4] ?? 25);

if (!['owner', 'mint'].includes(mode) || !value || !Number.isInteger(limit) || limit < 1 || limit > 100) {
  throw new Error(
    'Usage: npm exec tsx examples/solana/nft-owner-mint-viewer.ts owner <OWNER_PUBLIC_KEY> [LIMIT_1_TO_100]\n' +
      '   or: npm exec tsx examples/solana/nft-owner-mint-viewer.ts mint <NFT_MINT>',
  );
}

type TokenAccount = {
  pubkey: string;
  account: {
    data: {
      program: string;
      parsed?: {
        info?: {
          mint?: string;
          tokenAmount?: {
            amount: string;
            decimals: number;
            uiAmountString: string;
          };
        };
      };
    };
  };
};

type TokenAccountsResponse = {
  context: {
    slot: number;
  };
  value: TokenAccount[];
};

const programs = [
  { label: 'SPL Token', id: TOKEN_PROGRAM_ID },
  { label: 'Token-2022', id: TOKEN_2022_PROGRAM_ID },
];

if (mode === 'mint') {
  type LargestAccountsResponse = {
    context: {
      slot: number;
    };
    value: Array<{
      address: string;
      amount: string;
      decimals: number;
      uiAmount: number | null;
      uiAmountString: string;
    }>;
  };

  type ParsedAccountInfo = {
    context: {
      slot: number;
    };
    value: null | {
      data:
        | [string, 'base64']
        | {
            parsed?: {
              info?: {
                mint?: string;
                owner?: string;
                tokenAmount?: {
                  amount: string;
                  decimals: number;
                  uiAmountString: string;
                };
              };
            };
            program?: string;
          };
      owner: string;
    };
  };

  const largestAccounts = await solanaRpc<LargestAccountsResponse>('getTokenLargestAccounts', [
    value,
    { commitment: 'finalized' },
  ]);
  const largest = largestAccounts.value[0];

  if (!largest) {
    console.log(JSON.stringify({ mint: value, owner: null, note: 'No token accounts found.' }, null, 2));
    process.exit(0);
  }

  const accountInfo = await solanaRpc<ParsedAccountInfo>('getAccountInfo', [
    largest.address,
    { commitment: 'finalized', encoding: 'jsonParsed' },
  ]);
  const parsedData = Array.isArray(accountInfo.value?.data) ? null : accountInfo.value?.data;
  const tokenInfo = parsedData?.parsed?.info;

  console.log(
    JSON.stringify(
      {
        mint: value,
        tokenAccount: largest.address,
        owner: tokenInfo?.owner ?? null,
        amount: largest.amount,
        decimals: largest.decimals,
        uiAmount: largest.uiAmountString,
        isNftLike: largest.amount === '1' && largest.decimals === 0,
        note: 'Owner lookup follows the Solana Cookbook pattern: getTokenLargestAccounts, then getAccountInfo for the largest token account.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const candidates = [];

for (const program of programs) {
  const response = await solanaRpc<TokenAccountsResponse>('getTokenAccountsByOwner', [
    value,
    { programId: program.id },
    { commitment: 'finalized', encoding: 'jsonParsed' },
  ]);

  for (const tokenAccount of response.value) {
    const info = tokenAccount.account.data.parsed?.info;
    const amount = info?.tokenAmount?.amount;
    const decimals = info?.tokenAmount?.decimals;

    if (amount === '1' && decimals === 0) {
      candidates.push({
        program: program.label,
        tokenAccount: tokenAccount.pubkey,
        mint: info?.mint ?? 'unknown',
        amount,
        decimals,
        slot: response.context.slot,
      });
    }
  }
}

console.log(
  JSON.stringify(
    {
      owner: value,
      note: 'This is a raw RPC NFT candidate view: amount=1 and decimals=0. Metadata verification is intentionally out of scope for this no-SDK example.',
      nftCandidates: candidates.length,
      showing: Math.min(limit, candidates.length),
      items: candidates.slice(0, limit),
    },
    null,
    2,
  ),
);
