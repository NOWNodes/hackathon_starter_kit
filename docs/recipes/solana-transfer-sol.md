# SOL Transfer Flow

1. Build and sign the transfer transaction in a wallet or local client.
2. Submit the signed transaction through `sendTransaction`.
3. Verify the signature with `/api/solana/tx/:signature` or `transaction-lookup.ts`.

The backend must not store private keys.
