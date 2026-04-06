import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const BASE = 'http://localhost:8084';
const READY_URL = `${BASE}/api/hello/direct/ping`;
const READY_TIMEOUT_MS = 15_000;

let server;

async function waitForReady() {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(READY_URL);
            if (res.ok) return;
        } catch {
            // not up yet
        }
        await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`server not ready after ${READY_TIMEOUT_MS}ms`);
}

before(async () => {
    server = spawn('node', ['dist/main.js'], { stdio: ['ignore', 'pipe', 'pipe'] });
    server.on('error', (e) => console.error('server spawn error:', e));
    await waitForReady();
});

after(() => {
    if (server && !server.killed) {
        server.kill('SIGTERM');
    }
});

function assertQuoteShape(body, expectedId) {
    assert.equal(typeof body.id, 'number', 'id should be a number');
    assert.equal(body.id, expectedId, `id should equal ${expectedId}`);
    assert.equal(typeof body.quote, 'string', 'quote should be a string');
    assert.ok(body.quote.length > 0, 'quote should be non-empty');
    assert.equal(typeof body.author, 'string', 'author should be a string');
    assert.ok(body.author.length > 0, 'author should be non-empty');
}

test('direct endpoint returns dummyjson schema', async () => {
    for (const id of [1, 3, 7]) {
        const res = await fetch(`${BASE}/api/quote/direct/${id}`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assertQuoteShape(body, id);
    }
});

test('flow endpoint returns dummyjson schema', async () => {
    for (const id of [1, 3, 7]) {
        const res = await fetch(`${BASE}/api/quote/flow/${id}`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assertQuoteShape(body, id);
    }
});

test('direct and flow return identical JSON for same id', async () => {
    for (const id of [1, 3, 7]) {
        const [direct, flow] = await Promise.all([
            fetch(`${BASE}/api/quote/direct/${id}`).then((r) => r.json()),
            fetch(`${BASE}/api/quote/flow/${id}`).then((r) => r.json()),
        ]);
        assert.deepEqual(direct, flow, `direct and flow should match for id=${id}`);
    }
});
