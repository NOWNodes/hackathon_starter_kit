import { FT } from 'coreum-js';
import { getAmount, getDenom, getFlag, getFromAddress, parseArgs, printJson, runWriteFlow } from './_client';

const args = parseArgs();
const sender = getFromAddress(args);
const denom = getDenom(args, '');
const amount = getAmount(args, '1');

if (!sender || !denom) {
  throw new Error(
    'Usage: npm exec -- tsx examples/coreum/mint-smart-token.ts --from=COREUM_ADDRESS --denom=TOKEN_DENOM [--amount=1] [--simulate|--sign|--broadcast --yes]',
  );
}

const msg = FT.Mint({
  sender,
  coin: {
    denom,
    amount,
  },
});

const result = await runWriteFlow(args, [msg], {
  fromAddress: sender,
  memo: getFlag(args, 'memo', 'NOWNodes Coreum starter: mint smart token'),
});

printJson(result);
