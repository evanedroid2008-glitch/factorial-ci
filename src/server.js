import http from 'node:http';
import { factorialString, factorialDigitCount, MAX_N } from './factorial.js';

const PAGE = `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Генератор факторіалу</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
           background: #eef1f8; color: #1f2a44; display: flex; justify-content: center; padding: 40px 16px; }
    main { background: #fff; width: 100%; max-width: 640px; border-radius: 20px; padding: 28px;
           box-shadow: 0 10px 30px rgba(31, 42, 68, 0.12); }
    h1 { margin: 0 0 6px; font-size: 26px; }
    p.hint { margin: 0 0 20px; color: #626579; font-size: 14px; }
    form { display: flex; gap: 10px; flex-wrap: wrap; }
    input { flex: 1 1 160px; padding: 12px 14px; font-size: 16px; border: 1px solid #d7dbe7;
            border-radius: 12px; }
    button { padding: 12px 22px; font-size: 16px; border: 0; border-radius: 12px; color: #fff;
             background: #5b4ae8; cursor: pointer; }
    button:hover { background: #4a3ad4; }
    .result { margin-top: 20px; padding: 16px; border-radius: 14px; background: #f4f5fa; }
    .error { background: #fdecea; color: #b3261e; }
    .meta { font-size: 13px; color: #626579; margin-bottom: 8px; }
    output { display: block; font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
             font-size: 15px; line-height: 1.5; word-break: break-all; white-space: pre-wrap; }
  </style>
</head>
<body>
  <main>
    <h1>Генератор факторіалу</h1>
    <p class="hint">Введіть ціле число від 0 до ${MAX_N}. Обчислення виконується на сервері з точністю BigInt.</p>
    <form id="form">
      <input id="n" name="n" type="number" min="0" max="${MAX_N}" step="1" value="20" required />
      <button type="submit">Обчислити n!</button>
    </form>
    <div class="result" id="result" hidden>
      <div class="meta" id="meta"></div>
      <output id="value"></output>
    </div>
  </main>
  <script>
    const form = document.getElementById('form');
    const result = document.getElementById('result');
    const meta = document.getElementById('meta');
    const value = document.getElementById('value');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const n = document.getElementById('n').value;
      const response = await fetch('/api/factorial?n=' + encodeURIComponent(n));
      const body = await response.json();
      result.hidden = false;
      result.classList.toggle('error', !response.ok);
      if (!response.ok) {
        meta.textContent = 'Помилка';
        value.textContent = body.error;
        return;
      }
      meta.textContent = body.n + '! — ' + body.digits + ' цифр';
      value.textContent = body.value;
    });
  </script>
</body>
</html>`;

/**
 * Формує відповідь API для запиту факторіалу. Виділено окремо, щоб тестувати без HTTP.
 * @param {string|number|null} rawValue
 * @returns {{status: number, body: object}}
 */
export function buildFactorialResponse(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return { status: 400, body: { error: 'Параметр n є обовʼязковим.' } };
  }

  const n = Number(rawValue);
  if (!Number.isFinite(n)) {
    return { status: 400, body: { error: 'Параметр n має бути числом.' } };
  }

  try {
    return {
      status: 200,
      body: { n, value: factorialString(n), digits: factorialDigitCount(n) }
    };
  } catch (error) {
    return { status: 400, body: { error: error.message } };
  }
}

/**
 * Створює HTTP-сервер застосунку. Порт 0 дозволяє тестам слухати випадковий порт.
 * @param {{port?: number, host?: string}} options
 */
export function createServer(options = {}) {
  const { port = Number(process.env.PORT ?? 3000), host = '0.0.0.0' } = options;

  const server = http.createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(PAGE);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/factorial') {
      const { status, body } = buildFactorialResponse(url.searchParams.get('n'));
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(body));
      return;
    }

    if (request.method === 'GET' && url.pathname === '/healthz') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Not found' }));
  });

  return {
    server,
    listen: () =>
      new Promise((resolve) => {
        server.listen(port, host, () => resolve(server.address()));
      })
  };
}

// Запускаємо сервер лише коли файл викликано напряму, а не імпортовано тестами.
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replaceAll('\\', '/')}`) {
  const { listen } = createServer();
  const address = await listen();
  const shownPort = typeof address === 'object' && address ? address.port : 3000;
  console.log(`Генератор факторіалу працює: http://localhost:${shownPort}`);
}
