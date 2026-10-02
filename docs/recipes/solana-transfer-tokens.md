# SPL Token Transfer Flow

Use `getTokenAccountsByOwner` to discover token accounts, sign the SPL token transfer in a wallet/client, then verify the resulting signature through NOWNodes.

```bash
npm exec tsx examples/solana/transfer-tokens.ts <OWNER_PUBLIC_KEY> <TOKEN_MINT>
```
