import { decodeAbiString, decodeUint, ethCall, formatUnits, normalizeAddress, padAddress } from './_rpc';

const token = process.argv[2];
const owner = process.argv[3];

if (!token || !owner) {
  throw new Error('Usage: npm exec tsx examples/eth/erc20-balance.ts <TOKEN_ADDRESS> <OWNER_ADDRESS>');
}

const tokenAddress = normalizeAddress(token);
const ownerAddress = normalizeAddress(owner);

const [symbolRaw, decimalsRaw, balanceRaw] = await Promise.all([
  ethCall(tokenAddress, '0x95d89b41'),
  ethCall(tokenAddress, '0x313ce567'),
  ethCall(tokenAddress, `0x70a08231${padAddress(ownerAddress)}`),
]);

const symbol = decodeAbiString(symbolRaw);
const decimals = Number(decodeUint(decimalsRaw));
const balance = decodeUint(balanceRaw);

console.log(
  JSON.stringify(
    {
      token: tokenAddress,
      owner: ownerAddress,
      symbol,
      decimals,
      rawBalance: balance.toString(),
      formattedBalance: formatUnits(balance, decimals),
    },
    null,
    2,
  ),
);
