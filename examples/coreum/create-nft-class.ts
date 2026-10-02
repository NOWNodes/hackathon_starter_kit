import { NFT } from 'coreum-js';
import { getFlag, getFromAddress, parseArgs, printJson, runWriteFlow } from './_client';

const args = parseArgs();
const issuer = getFromAddress(args);
const symbol = getFlag(args, 'symbol', `HNFT${Date.now().toString().slice(-6)}`);
const name = getFlag(args, 'name', 'Hackathon NFT Class');

if (!issuer || !symbol || !name) {
  throw new Error(
    'Usage: npm exec -- tsx examples/coreum/create-nft-class.ts --from=COREUM_ADDRESS [--symbol=HNFT] [--name="Hackathon NFT"] [--description=...] [--uri=...] [--simulate|--sign|--broadcast --yes]',
  );
}

const msg = NFT.IssueClass({
  issuer,
  symbol,
  name,
  description: getFlag(args, 'description', 'NOWNodes Coreum starter NFT class'),
  uri: getFlag(args, 'uri', ''),
  uriHash: getFlag(args, 'uri-hash', ''),
  features: [],
  royaltyRate: getFlag(args, 'royalty-rate', '0'),
});

const result = await runWriteFlow(args, [msg], {
  fromAddress: issuer,
  memo: getFlag(args, 'memo', 'NOWNodes Coreum starter: create NFT class'),
});

printJson(result);
