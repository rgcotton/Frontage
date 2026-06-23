import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './onePager.js';

test('blank one pager fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Test Property';
  om.team = [{ name: '', title: '', phone: '', email: '', bio: '', headshot: null }];
  // brokerageName, highlights, description all left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank field');
  assert.ok(!html.includes('No highlights provided.'), 'should not render fallback highlights text');
  assert.ok(!html.includes('No property description provided.'), 'should not render fallback description text');
});
