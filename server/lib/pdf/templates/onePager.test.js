import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './onePager.js';

test('blank one pager fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Test Property';
  om.team = [{ name: '', title: '', phone: '', email: '', bio: '', headshot: null }];
  // brokerageName, highlights, drive time POIs all left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank field');
  assert.ok(!html.includes('No highlights provided.'), 'should not render fallback highlights text');
  assert.ok(!/no .*(added|provided)/i.test(html), 'should never render fallback/placeholder text for blank optional content');
});

test('renders up to 4 drive-time POIs with name and minutes, capped even if more were added', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Test Property';
  om.driveTimePois = [
    { id: 'p1', name: 'Walmart', address: '1 Main St', category: 'Grocery Store', driveTimeMinutes: 4 },
    { id: 'p2', name: 'St. Lukes Hospital', address: '2 Oak Ave', category: 'Hospital', driveTimeMinutes: 9 },
    { id: 'p3', name: 'I-435 Interchange', address: '3 Hwy Rd', category: 'Highway Access', driveTimeMinutes: 3 },
    { id: 'p4', name: 'Liberty High School', address: '4 School St', category: 'School', driveTimeMinutes: 7 },
    { id: 'p5', name: 'Downtown', address: '5 Center St', category: 'Other', driveTimeMinutes: 14 },
  ];
  const html = buildPages(om, {}).join('\n');
  assert.ok(html.includes('Walmart') && html.includes('4 min'));
  assert.ok(html.includes('Liberty High School') && html.includes('7 min'));
  assert.ok(!html.includes('Downtown'), 'a 5th POI should be capped off the One Pager');
});

test('a POI with no calculated drive time renders blank, not an error or a dash', () => {
  const om = emptyOm('test-id');
  om.driveTimePois = [{ id: 'p1', name: 'Walmart', address: '1 Main St', category: 'Grocery Store', driveTimeMinutes: null }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(html.includes('Walmart'));
  assert.ok(!html.includes('null'));
  assert.ok(!/\d+ min/.test(html));
});

test('drive times card uses auto height so it shrinks to content, not a fixed flex ratio', () => {
  const om = emptyOm('test-id');
  om.driveTimePois = [{ id: 'p1', name: 'Walmart', address: '1 Main St', category: 'Grocery Store', driveTimeMinutes: 5 }];
  const html = buildPages(om, {}).join('\n');
  // Card must not use flex:0.85 (which forces a fixed proportion, leaving white space when few POIs)
  assert.ok(!html.includes('flex:0.85'), 'drive times card must not use a fixed flex ratio');
  // It must use flex-grow:0 so it sizes to its content
  assert.ok(html.includes('flex-grow:0') || html.includes('flex:0 0'), 'drive times card must opt out of growing');
});

test('highlights card always takes flex:1 to fill remaining space regardless of POI count', () => {
  const om = emptyOm('test-id');
  om.executiveSummary.highlights = ['Fully leased.'];
  om.driveTimePois = [{ id: 'p1', name: 'Walmart', address: '1 Main St', category: 'Grocery Store', driveTimeMinutes: 5 }];
  const html = buildPages(om, {}).join('\n');
  // Should not use flex:1.15 (the old "with-POI" ratio) — just flex:1
  assert.ok(!html.includes('flex:1.15'), 'highlights card must not use a proportional flex ratio when POIs exist');
});

test('no headshot renders initials placeholder, not an empty circle', () => {
  const om = emptyOm('test-id');
  om.team = [{ id: 't1', name: 'Jane Doe', title: 'Broker', phone: '', email: '', bio: '', headshot: null }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(html.includes('JD'), 'should render broker initials when no headshot is provided');
  assert.ok(!html.includes('background:rgba(255,255,255,0.12)'), 'should not render the empty grey circle');
});

test('no headshot and no team member name renders no circle at all', () => {
  const om = emptyOm('test-id');
  om.team = [{ id: 't1', name: '', title: 'Agent', phone: '', email: '', bio: '', headshot: null }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('border-radius:50%') || !html.includes('background:rgba(255,255,255,0.12)'), 'should not render empty grey circle when there is no name for initials');
});

test('with no drive-time POIs at all, the layout renders exactly as before (highlights card alone)', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Test Property';
  om.executiveSummary.highlights = ['Fully leased to investment-grade tenants.'];
  const html = buildPages(om, {}).join('\n');
  assert.ok(html.includes('Investment Highlights'));
  assert.ok(!html.includes('Drive Times'), 'the Drive Times card should not render at all when there are no POIs');
});
