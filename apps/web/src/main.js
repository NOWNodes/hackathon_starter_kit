const statusEl = document.querySelector('#global-status');
const output = {
  dashboard: document.querySelector('#dashboard-output'),
  address: document.querySelector('#address-output'),
  tx: document.querySelector('#tx-output'),
  rpc: document.querySelector('#rpc-output'),
};

function print(target, payload) {
  target.textContent = JSON.stringify(payload, null, 2);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw payload;
  return payload;
}

async function loadHealth() {
  try {
    const health = await api('/api/health');
    statusEl.textContent = health.nownodesApiKey === 'configured' ? 'API ready' : 'API key missing';
    document.querySelector('#nownodes-status').textContent = health.nownodesApiKey;
  } catch (error) {
    statusEl.textContent = 'API error';
  }
}

async function loadDashboard() {
  output.dashboard.textContent = 'Loading...';
  try {
    const latest = await api('/api/solana/latest');
    document.querySelector('#slot').textContent = latest.slot ?? '-';
    document.querySelector('#block-height').textContent = latest.blockHeight ?? '-';
    document.querySelector('#latency').textContent = `${latest.latencyMs} ms`;
    print(output.dashboard, latest);
  } catch (error) {
    print(output.dashboard, error);
  }
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.view').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`#${tab.dataset.view}`).classList.add('active');
  });
});

document.querySelector('#refresh-dashboard').addEventListener('click', loadDashboard);

document.querySelector('#address-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const address = new FormData(event.currentTarget).get('address')?.toString().trim();
  if (!address) return;

  output.address.textContent = 'Loading...';
  try {
    print(output.address, await api(`/api/solana/address/${encodeURIComponent(address)}`));
  } catch (error) {
    print(output.address, error);
  }
});

document.querySelector('#tx-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const signature = new FormData(event.currentTarget).get('signature')?.toString().trim();
  if (!signature) return;

  output.tx.textContent = 'Loading...';
  try {
    print(output.tx, await api(`/api/solana/tx/${encodeURIComponent(signature)}`));
  } catch (error) {
    print(output.tx, error);
  }
});

document.querySelector('#rpc-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const method = data.get('method')?.toString().trim();
  let params = [];

  try {
    params = JSON.parse(data.get('params')?.toString() || '[]');
  } catch {
    print(output.rpc, { error: 'Params must be valid JSON' });
    return;
  }

  output.rpc.textContent = 'Loading...';
  try {
    print(
      output.rpc,
      await api('/api/rpc/solana', {
        method: 'POST',
        body: JSON.stringify({ method, params }),
      }),
    );
  } catch (error) {
    print(output.rpc, error);
  }
});

await loadHealth();
await loadDashboard();
