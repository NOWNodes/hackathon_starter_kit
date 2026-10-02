# Chainlink Anchor Client

For Anchor-based clients, keep the provider wallet and signing flow on the client side or in local developer tooling.

Replace public RPC URLs with:

```bash
SOLANA_RPC_URL=https://sol.nownodes.io/${NOWNODES_API_KEY}
```

Use NOWNodes for read-only account checks and transaction verification after signed transactions are submitted.
