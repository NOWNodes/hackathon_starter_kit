# Chainlink Read Data

Use the read-only client pattern when your app needs to inspect an on-chain account without creating a transaction.

```bash
npm exec tsx examples/solana/chainlink-read-data.ts <CHAINLINK_FEED_ACCOUNT>
```

Set `SOLANA_RPC_URL` to the NOWNodes Solana endpoint. Devnet or custom deployment flows require a compatible NOWNodes endpoint for that network.
