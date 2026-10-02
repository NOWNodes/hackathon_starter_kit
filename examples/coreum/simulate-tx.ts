import { Bank } from 'coreum-js';
import { getAmount, getDenom, getFlag, getFromAddress, parseArgs, printJson, simulateMessages } from './_client';

const args = parseArgs();
const dummyAddress = 'testcore1qyqszqgpqyqszqgpqyqszqgpqyqszqgphfzc93';
const toAddress =
  args.values[0] ||
  getFlag(args, 'to', process.env.COREUM_TO_ADDRESS) ||
  getFromAddress(args) ||
  dummyAddress;
const fromAddress = getFromAddress(args);

const msg = Bank.Send({
  fromAddress: fromAddress || dummyAddress,
  toAddress,
  amount: [
    {
      denom: getDenom(args),
      amount: getAmount(args),
    },
  ],
});

const simulation = await simulateMessages(args, [msg], fromAddress);

printJson({
  network: getFlag(args, 'network', process.env.COREUM_NETWORK || 'testnet'),
  description: 'Simulates a Coreum MsgSend without signing or broadcasting.',
  message: msg,
  simulation,
});
