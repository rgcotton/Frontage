import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, resolveTheme } from './index.js';

const REQUIRED_TOKEN_KEYS = [
  'primaryColor', 'accentColor', 'pageBg', 'textColor', 'mutedColor',
  'statBoxBg', 'tableStripe', 'cardBorder', 'totalRowBg',
  'headingFont', 'bodyFont', 'titleSize', 'headingWeight',
];

const REQUIRED_COMPONENT_KEYS = [
  'headerBar', 'sectionHeading', 'statBox', 'tableCss', 'compCardCss',
  'coverPage', 'pageChromeCss',
];

test('every theme exports key, label, tokens, fonts, components', () => {
  for (const [name, theme] of Object.entries(THEMES)) {
    assert.ok(typeof theme.key === 'string' && theme.key.length > 0,
      `${name}: key must be a non-empty string`);
    assert.ok(typeof theme.label === 'string' && theme.label.length > 0,
      `${name}: label must be a non-empty string`);
    assert.ok(theme.tokens && typeof theme.tokens === 'object',
      `${name}: tokens must be an object`);
    assert.ok(theme.fonts && typeof theme.fonts === 'object',
      `${name}: fonts must be an object`);
    assert.ok(theme.components && typeof theme.components === 'object',
      `${name}: components must be an object`);
  }
});

test('every theme has all required token keys', () => {
  for (const [name, theme] of Object.entries(THEMES)) {
    for (const key of REQUIRED_TOKEN_KEYS) {
      assert.ok(key in theme.tokens, `${name}: tokens.${key} is missing`);
    }
  }
});

test('every theme has all required component functions that return non-empty strings', () => {
  const minimalArgs = {
    headerBar: ['Property Name', 'Section Label', {}, false],
    sectionHeading: ['Title', 'Subtitle', {}],
    statBox: ['Label', 'Value', {}],
    tableCss: [{}],
    compCardCss: [{}],
    coverPage: [{}, {}, {}],
    pageChromeCss: [{}],
  };

  for (const [name, theme] of Object.entries(THEMES)) {
    for (const key of REQUIRED_COMPONENT_KEYS) {
      assert.ok(typeof theme.components[key] === 'function',
        `${name}: components.${key} must be a function`);
      const result = theme.components[key](...minimalArgs[key]);
      assert.ok(typeof result === 'string' && result.length > 0,
        `${name}: components.${key}() must return a non-empty string`);
    }
  }
});

test('resolveTheme({}) returns institutional (fallback on missing template)', () => {
  const resolved = resolveTheme({});
  assert.equal(resolved.key, 'institutional');
});

test('resolveTheme({ template: "unknown" }) returns institutional (fallback on unknown key)', () => {
  const resolved = resolveTheme({ template: 'unknown' });
  assert.equal(resolved.key, 'institutional');
});

test('resolveTheme merges brokerage primaryColor override into tokens', () => {
  const resolved = resolveTheme({ template: 'editorial', primaryColor: '#FF0000' });
  assert.equal(resolved.tokens.primaryColor, '#FF0000');
  assert.equal(resolved.key, 'editorial');
});

test('resolveTheme does not mutate the original theme tokens', () => {
  const original = THEMES.institutional.tokens.primaryColor;
  resolveTheme({ template: 'institutional', primaryColor: '#ABCDEF' });
  assert.equal(THEMES.institutional.tokens.primaryColor, original);
});

test('resolveTheme merges accentColor and logo overrides', () => {
  const logoRef = { url: '/uploads/test/logo.png', filename: 'logo.png' };
  const resolved = resolveTheme({ template: 'bold', accentColor: '#00FF00', logo: logoRef });
  assert.equal(resolved.tokens.accentColor, '#00FF00');
  assert.deepEqual(resolved.tokens.logo, logoRef);
});
