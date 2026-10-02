import { decodeAbiString, decodeUint, ethCall, formatUnits, normalizeAddress, padAddress } from './_rpc';

const token = process.argv[2];
const owner = process.argv[3];
const spender = process.argv[4];

if (!token || !owner || !spender) {
  throw new Error(
    'Usage: npm exec tsx examples/eth/allowance-checker.ts <TOKEN_ADDRESS> <OWNER_ADDRESS> <SPENDER_ADDRESS>',
  );
}

const tokenAddress = normalizeAddress(token);
const ownerAddress = normalizeAddress(owner);
const spenderAddress = normalizeAddress(spender);

const [symbolRaw, decimalsRaw, allowanceRaw] = await Promise.all([
  ethCall(tokenAddress, '0x95d89b41'),
  ethCall(tokenAddress, '0x313ce567'),
  ethCall(tokenAddress, `0xdd62ed3e${padAddress(ownerAddress)}${padAddress(spenderAddress)}`),
]);

const symbol = decodeAbiString(symbolRaw);
const decimals = Number(decodeUint(decimalsRaw));
const allowance = decodeUint(allowanceRaw);

console.log(
  JSON.stringify(
    {
      token: tokenAddress,
      owner: ownerAddress,
      spender: spenderAddress,
      symbol,
      decimals,
      rawAllowance: allowance.toString(),
      formattedAllowance: formatUnits(allowance, decimals),
    },
    null,
    2,
  ),
);
