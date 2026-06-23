import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBrowser, closeBrowser } from './render.js';

test('getBrowser recovers when the cached browser has disconnected', async (t) => {
  t.after(() => closeBrowser());

  const first = await getBrowser();
  assert.ok(first.connected, 'freshly launched browser should be connected');

  // Simulate the real-world failure: the cached Chromium process dies (crash,
  // OOM, restart race) out from under the long-lived `sharedBrowser` reference.
  await first.close();
  assert.ok(!first.connected, 'closed browser should report disconnected');

  const second = await getBrowser();
  assert.ok(second.connected, 'getBrowser should discard a disconnected browser and launch a fresh one instead of returning the dead one');
});
