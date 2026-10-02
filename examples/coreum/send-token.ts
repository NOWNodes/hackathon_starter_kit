import { Bank } from 'coreum-js';
import {
  getAmount,
  getDenom,
  getFlag,
  getFromAddress,
  parseArgs,
  printJson,
  runWriteFlow,
} from './_client';

const args = parseArgs();
const toAddress = args.values[0] || getFlag(args, 'to', process.env.COREUM_TO_ADDRESS);
const fromAddress = getFromAddress(args);

if (!toAddress || !fromAddress) {
  throw new Error(
    'Usage: npm exec -- tsx examples/coreum/send-token.ts <TO_ADDRESS> --from=COREUM_ADDRESS [--amount=1] [--denom=utestcore] [--simulate|--sign|--broadcast --yes]',
  );
}

const msg = Bank.Send({
  fromAddress,
  toAddress,
  amount: [
    {
      denom: getDenom(args),
      amount: getAmount(args),
    },
  ],
});

const result = await runWriteFlow(args, [msg], {
  fromAddress,
  memo: getFlag(args, 'memo', 'NOWNodes Coreum starter: send token'),
});

printJson(result);
