import { solanaRpc } from './_rpc';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

const owner = process.argv[2];
const programFlag = process.argv.find((arg) => arg.startsWith('--program='));
const programMode = programFlag?.split('=')[1] ?? 'both';

if (!owner || !['token', 'token-2022', 'both'].includes(programMode)) {
  throw new Error(
    'Usage: npm exec tsx examples/solana/token-balances.ts <OWNER_PUBLIC_KEY> [--program=token|token-2022|both]',
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
          owner?: string;
          tokenAmount?: {
            amount: string;
            decimals: number;
            uiAmount: number | null;
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

const programs =
  programMode === 'token'
    ? [{ label: 'SPL Token', id: TOKEN_PROGRAM_ID }]
    : programMode === 'token-2022'
      ? [{ label: 'Token-2022', id: TOKEN_2022_PROGRAM_ID }]
      : [
          { label: 'SPL Token', id: TOKEN_PROGRAM_ID },
          { label: 'Token-2022', id: TOKEN_2022_PROGRAM_ID },
        ];

const allAccounts = [];

for (const program of programs) {
  const response = await solanaRpc<TokenAccountsResponse>('getTokenAccountsByOwner', [
    owner,
    { programId: program.id },
    { encoding: 'jsonParsed', commitment: 'finalized' },
  ]);

  for (const tokenAccount of response.value) {
    const info = tokenAccount.account.data.parsed?.info;
    allAccounts.push({
      program: program.label,
      tokenAccount: tokenAccount.pubkey,
      mint: info?.mint ?? 'unknown',
      owner: info?.owner ?? owner,
      amount: info?.tokenAmount?.amount ?? '0',
      decimals: info?.tokenAmount?.decimals ?? null,
      uiAmount: info?.tokenAmount?.uiAmountString ?? '0',
      slot: response.context.slot,
    });
  }
}

console.log(`Owner: ${owner}`);
console.log(`Programs checked: ${programs.map((program) => program.label).join(', ')}`);
console.log(`Token accounts: ${allAccounts.length}`);
console.log(JSON.stringify(allAccounts, null, 2));
