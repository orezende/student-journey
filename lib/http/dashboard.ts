export interface Service {
  name: string;
  url?: string;
  description: string;
  status?: boolean;
  containerName?: string;
}

export function renderDashboard(services: Service[]): string {
  const cards = services.map((s) => serviceCard(s)).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Student Journey</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 48px 24px;
    }
    header {
      max-width: 860px;
      margin: 0 auto 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    header h1 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; }
    header p { margin-top: 6px; font-size: 0.875rem; color: #64748b; }
    .docs-link {
      font-size: 0.8rem;
      color: #4f5b93;
      text-decoration: none;
      border: 1px solid #2d3148;
      border-radius: 6px;
      padding: 6px 12px;
      transition: border-color 0.15s, color 0.15s;
    }
    .docs-link:hover { border-color: #4f5b93; color: #818cf8; }
    .grid {
      max-width: 860px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    .card {
      background: #1a1d27;
      border: 1px solid #2d3148;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.15s;
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .card-name { font-weight: 600; font-size: 0.95rem; }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: background 0.3s, box-shadow 0.3s;
    }
    .dot.ok      { background: #22c55e; box-shadow: 0 0 6px #22c55e88; }
    .dot.error   { background: #ef4444; box-shadow: 0 0 6px #ef444488; }
    .dot.unknown { background: #475569; }
    .card-desc { font-size: 0.8rem; color: #64748b; }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }
    .card-url {
      font-size: 0.75rem;
      color: #4f5b93;
      text-decoration: none;
    }
    .card-url:hover { color: #818cf8; }
    .btn {
      font-size: 0.72rem;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 5px;
      border: 1px solid #2d3148;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, opacity 0.15s;
      white-space: nowrap;
    }
    .btn:hover:not(:disabled) { border-color: #4f5b93; color: #e2e8f0; }
    .btn:disabled { opacity: 0.4; cursor: default; }
    .btn.stopping { color: #f87171; border-color: #7f1d1d; }
    .btn.starting { color: #86efac; border-color: #14532d; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Student Journey</h1>
      <p>Service dashboard</p>
    </div>
    <div style="display:flex;gap:8px;">
      <a class="docs-link" href="/overview">Overview →</a>
      <a class="docs-link" href="/docs">API Reference →</a>
    </div>
  </header>
  <div class="grid">
${cards}
  </div>
  <script>
    async function toggle(btn, containerName, action) {
      const card = btn.closest('.card');
      const dot = card.querySelector('.dot');
      btn.disabled = true;
      btn.textContent = '...';
      btn.className = 'btn ' + (action === 'stop' ? 'stopping' : 'starting');
      try {
        const res = await fetch('/services/' + action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: containerName }),
        });
        if (!res.ok) throw new Error();
        const running = action === 'start';
        if (dot) dot.className = 'dot ' + (running ? 'ok' : 'error');
        btn.textContent = running ? 'Stop' : 'Start';
        btn.className = 'btn';
        btn.onclick = () => toggle(btn, containerName, running ? 'stop' : 'start');
      } catch {
        btn.textContent = 'Error';
        btn.className = 'btn';
        setTimeout(() => {
          btn.textContent = action === 'stop' ? 'Stop' : 'Start';
          btn.disabled = false;
        }, 2000);
      }
      btn.disabled = false;
    }
  </script>
</body>
</html>`;
}

function serviceCard(s: Service): string {
  const dot =
    s.status === true
      ? '<span class="dot ok"></span>'
      : s.status === false
        ? '<span class="dot error"></span>'
        : s.containerName
          ? '<span class="dot unknown"></span>'
          : '';

  const urlEl = s.url
    ? `<a class="card-url" href="${s.url}">${s.url}</a>`
    : '<span></span>';

  const action = s.status ? 'stop' : 'start';
  const btnEl = s.containerName
    ? `<button class="btn" onclick="toggle(this, '${s.containerName}', '${action}')">${s.status ? 'Stop' : 'Start'}</button>`
    : '';

  return `    <div class="card">
      <div class="card-top"><span class="card-name">${s.name}</span>${dot}</div>
      <span class="card-desc">${s.description}</span>
      <div class="card-footer">${urlEl}${btnEl}</div>
    </div>`;
}
