import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFactorialResponse, createServer } from '../src/server.js';

test('buildFactorialResponse повертає значення для коректного n', () => {
  const { status, body } = buildFactorialResponse('10');
  assert.equal(status, 200);
  assert.equal(body.n, 10);
  assert.equal(body.value, '3628800');
  assert.equal(body.digits, 7);
});

test('buildFactorialResponse повертає 400 без параметра n', () => {
  assert.equal(buildFactorialResponse(null).status, 400);
  assert.equal(buildFactorialResponse('').status, 400);
});

test('buildFactorialResponse повертає 400 для від\'ємного n', () => {
  const { status, body } = buildFactorialResponse('-3');
  assert.equal(status, 400);
  assert.match(body.error, /невід'ємних/);
});

test('HTTP: сторінка, API, healthz і 404', async () => {
  const { server, listen } = createServer({ port: 0, host: '127.0.0.1' });
  const address = await listen();
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const page = await fetch(base + '/');
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);

    const api = await fetch(base + '/api/factorial?n=20');
    assert.equal(api.status, 200);
    assert.deepEqual(await api.json(), {
      n: 20,
      value: '2432902008176640000',
      digits: 19
    });

    const invalid = await fetch(base + '/api/factorial?n=abc');
    assert.equal(invalid.status, 400);

    const health = await fetch(base + '/healthz');
    assert.deepEqual(await health.json(), { status: 'ok' });

    const missing = await fetch(base + '/nope');
    assert.equal(missing.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
