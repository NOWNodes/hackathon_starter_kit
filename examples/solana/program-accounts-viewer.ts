import { solanaRpc } from './_rpc';

const programId = process.argv[2];
const args = process.argv.slice(3);

function getArg(name: string): string | undefined {
  return args.find((arg) => arg.startsWith(`${name}=`))?.split('=').slice(1).join('=');
}

const dataSize = getArg('--data-size');
const memcmp = getArg('--memcmp');
const limit = Number(getArg('--limit') ?? 10);
const encoding = getArg('--encoding') ?? 'base64';
const unsafeUnfiltered = args.includes('--unsafe-unfiltered');

if (
  !programId ||
  !Number.isInteger(limit) ||
  limit < 1 ||
  limit > 100 ||
  !['base64', 'jsonParsed'].includes(encoding)
) {
  throw new Error(
    'Usage: npm exec tsx examples/solana/program-accounts-viewer.ts <PROGRAM_ID> [--data-size=N] [--memcmp=OFFSET:BYTES] [--limit=1..100] [--encoding=base64|jsonParsed] [--unsafe-unfiltered]',
  );
}

const filters = [];

if (dataSize) {
  const parsedDataSize = Number(dataSize);
  if (!Number.isInteger(parsedDataSize) || parsedDataSize < 0) {
    throw new Error('--data-size must be a non-negative integer.');
  }
  filters.push({ dataSize: parsedDataSize });
}

if (memcmp) {
  const [offsetText, bytes] = memcmp.split(':');
  const offset = Number(offsetText);
  if (!Number.isInteger(offset) || offset < 0 || !bytes) {
    throw new Error('--memcmp must be formatted as OFFSET:BASE58_BYTES.');
  }
  filters.push({ memcmp: { offset, bytes } });
}

if (!filters.length && !unsafeUnfiltered) {
  throw new Error(
    'Refusing unfiltered getProgramAccounts. Add --data-size/--memcmp or pass --unsafe-unfiltered for small programs.',
  );
}

type ProgramAccount = {
  pubkey: string;
  account: {
    executable: boolean;
    lamports: number;
    owner: string;
    space?: number;
    data?: unknown;
  };
};

type ProgramAccountsResponse =
  | ProgramAccount[]
  | {
      context: {
        slot: number;
      };
      value: ProgramAccount[];
    };

const config: Record<string, unknown> = {
  commitment: 'finalized',
  encoding,
  withContext: true,
  filters,
  sortResults: true,
};

if (encoding === 'base64') {
  config.dataSlice = { offset: 0, length: 0 };
}

const response = await solanaRpc<ProgramAccountsResponse>('getProgramAccounts', [programId, config]);
const accounts = Array.isArray(response) ? response : response.value;

console.log(
  JSON.stringify(
    {
      programId,
      contextSlot: Array.isArray(response) ? null : response.context.slot,
      returnedAccounts: accounts.length,
      showing: Math.min(limit, accounts.length),
      accounts: accounts.slice(0, limit).map((item) => ({
        pubkey: item.pubkey,
        executable: item.account.executable,
        lamports: item.account.lamports,
        owner: item.account.owner,
        space: item.account.space ?? null,
      })),
    },
    null,
    2,
  ),
);
