import { btcRpc } from './_rpc';

type BlockchainInfo = {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  verificationprogress: number;
  initialblockdownload: boolean;
};

type BlockHeader = {
  hash: string;
  height: number;
  time: number;
  mediantime: number;
  nTx: number;
  previousblockhash?: string;
};

const info = await btcRpc<BlockchainInfo>('getblockchaininfo');
const bestBlockHash = await btcRpc<string>('getbestblockhash');
const header = await btcRpc<BlockHeader>('getblockheader', [bestBlockHash, true]);

console.log(
  JSON.stringify(
    {
      chain: info.chain,
      blocks: info.blocks,
      headers: info.headers,
      bestBlockHash,
      headerHeight: header.height,
      transactionCount: header.nTx,
      difficulty: info.difficulty,
      verificationProgress: info.verificationprogress,
      initialBlockDownload: info.initialblockdownload,
      blockTime: new Date(header.time * 1000).toISOString(),
      medianTime: new Date(header.mediantime * 1000).toISOString(),
      previousBlockHash: header.previousblockhash ?? null,
    },
    null,
    2,
  ),
);
