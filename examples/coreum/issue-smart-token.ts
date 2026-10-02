import { FT, Feature } from 'coreum-js';
import { getFlag, getFromAddress, hasFlag, parseArgs, printJson, runWriteFlow } from './_client';

const args = parseArgs();
const issuer = getFromAddress(args);
const symbol = getFlag(args, 'symbol', `HACK${Date.now().toString().slice(-6)}`);
const subunit = getFlag(args, 'subunit', symbol?.toLowerCase());
const precision = Number(getFlag(args, 'precision', '6'));
const initialAmount = getFlag(args, 'initial-amount', '1000000') || '1000000';

if (!issuer || !symbol || !subunit || !Number.isInteger(precision) || precision < 0) {
  throw new Error(
    'Usage: npm exec -- tsx examples/coreum/issue-smart-token.ts --from=COREUM_ADDRESS [--symbol=HACK] [--subunit=uhack] [--precision=6] [--initial-amount=1000000] [--minting] [--simulate|--sign|--broadcast --yes]',
  );
}

const features = [];
if (hasFlag(args, 'minting')) features.push(Feature.minting);
if (hasFlag(args, 'burning')) features.push(Feature.burning);
if (hasFlag(args, 'freezing')) features.push(Feature.freezing);
if (hasFlag(args, 'whitelisting')) features.push(Feature.whitelisting);

const msg = FT.Issue({
  issuer,
  symbol,
  subunit,
  precision,
  initialAmount,
  description: getFlag(args, 'description', 'NOWNodes Coreum starter smart token'),
  features,
  uri: getFlag(args, 'uri', ''),
  uriHash: getFlag(args, 'uri-hash', ''),
});

const result = await runWriteFlow(args, [msg], {
  fromAddress: issuer,
  memo: getFlag(args, 'memo', 'NOWNodes Coreum starter: issue smart token'),
});

printJson(result);
