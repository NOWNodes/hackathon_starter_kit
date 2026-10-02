import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { healthRoute } from './routes/health.mjs';
import { chainsRoute } from './routes/chains.mjs';
import { latestSolanaRoute, addressRoute, transactionRoute } from './routes/solana.mjs';
import { btcBlockRoute, btcTransactionRoute, latestBtcRoute } from './routes/btc.mjs';
import { rpcProxyRoute } from './routes/rpc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '../../../apps/web/src');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  return JSON.parse(body);
}

async function sendStatic(req, res, pathname) {
  const filePath = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.resolve(webRoot, `.${filePath}`);

  if (!resolved.startsWith(webRoot)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  try {
    const contents = await fs.readFile(resolved);
    const extension = path.extname(resolved);
    res.writeHead(200, { 'content-type': contentTypes[extension] || 'application/octet-stream' });
    res.end(contents);
  } catch {
    const index = await fs.readFile(path.join(webRoot, 'index.html'));
    res.writeHead(200, { 'content-type': contentTypes['.html'] });
    res.end(index);
  }
}

async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, healthRoute());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/chains') {
      sendJson(res, 200, chainsRoute());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/solana/latest') {
      sendJson(res, 200, await latestSolanaRoute());
      return;
    }

    const addressMatch = url.pathname.match(/^\/api\/solana\/address\/([^/]+)$/);
    if (req.method === 'GET' && addressMatch) {
      sendJson(res, 200, await addressRoute(decodeURIComponent(addressMatch[1])));
      return;
    }

    const txMatch = url.pathname.match(/^\/api\/solana\/tx\/([^/]+)$/);
    if (req.method === 'GET' && txMatch) {
      sendJson(res, 200, await transactionRoute(decodeURIComponent(txMatch[1])));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/rpc/solana') {
      sendJson(res, 200, await rpcProxyRoute(await readJson(req)));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/btc/latest') {
      sendJson(res, 200, await latestBtcRoute());
      return;
    }

    const btcBlockMatch = url.pathname.match(/^\/api\/btc\/block\/([^/]+)$/);
    if (req.method === 'GET' && btcBlockMatch) {
      sendJson(res, 200, await btcBlockRoute(decodeURIComponent(btcBlockMatch[1])));
      return;
    }

    const btcTxMatch = url.pathname.match(/^\/api\/btc\/tx\/([^/]+)$/);
    if (req.method === 'GET' && btcTxMatch) {
      sendJson(
        res,
        200,
        await btcTransactionRoute(
          decodeURIComponent(btcTxMatch[1]),
          url.searchParams.get('blockHash'),
        ),
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/rpc/btc') {
      sendJson(res, 200, await rpcProxyRoute(await readJson(req), 'btc'));
      return;
    }

    sendJson(res, 404, { error: 'API route not found' });
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || 'Unexpected server error',
      details: error.details ?? undefined,
    });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    await handleApi(req, res, url);
    return;
  }

  await sendStatic(req, res, url.pathname);
});

server.listen(config.port, '127.0.0.1', () => {
  console.log(`NOWNodes multi-chain starter running at http://127.0.0.1:${config.port}`);
});
