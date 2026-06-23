import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './team.js';

test('blank team member bio renders no fallback text', () => {
  const om = emptyOm('test-id');
  om.team = [{ name: 'Jane Doe', title: 'Broker', phone: '', email: '', bio: '', headshot: null }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('No bio provided.'), 'should not render fallback bio text');
  assert.ok(html.includes('Jane Doe'), 'should still render the value that was provided');
});

test('blank team member name and title render no dash placeholder', () => {
  const om = emptyOm('test-id');
  om.team = [{ name: '', title: '', phone: '', email: '', bio: 'Loves real estate.', headshot: null }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for a blank name/title');
  assert.ok(html.includes('Loves real estate.'), 'should still render the value that was provided');
});
