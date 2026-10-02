import { btcRpc } from './_rpc';

const info = await btcRpc<any>('getmempoolinfo');

console.log(
  JSON.stringify(
    {
      loaded: info.loaded,
      size: info.size,
      bytes: info.bytes,
      usage: info.usage,
      totalFeeBtc: info.total_fee ?? null,
      mempoolMinFeeBtcPerKvB: info.mempoolminfee,
      minRelayTxFeeBtcPerKvB: info.minrelaytxfee,
      incrementalRelayFeeBtcPerKvB: info.incrementalrelayfee,
      unbroadcastCount: info.unbroadcastcount ?? null,
    },
    null,
    2,
  ),
);
