# Design System Overhaul: Four Distinct PDF Templates

Plan for: `.superpowers/sdd/design-system-brief.md`
Branch: main
Date: 2026-07-08

## Global Constraints

1. **No CDN/network fetches during PDF render.** All fonts must be embedded as base64 in `@font-face` CSS. Never load from Google Fonts or any URL in the PDF pipeline.
2. **All server tests must stay green.** After every change: `cd server && node --test`. All pre-existing tests pass; new theme contract tests also pass.
3. **Backward compatibility.** `branding.template` defaults to `'institutional'`. Old docs with no `template` field render unchanged (institutional).
4. **`resolveTheme(branding)` falls back to `'institutional'` on unknown template keys.**
5. **The four themes must differ in COMPOSITION** — cover layout, header style, typography scale — not just color swaps.
6. **All docTypes** (`om`, `onePager`, `bov`) respect the template field.
7. **`render:samples` produces 12 PDFs** — 4 templates × 3 docTypes (om, onePager, bov).
8. **Section content logic doesn't change** — only presentation moves into the theme layer.
9. **Each theme module exports exactly this contract:**
   ```js
   export default {
     key: String,          // e.g. 'editorial'
     label: String,        // e.g. 'Editorial'
     tokens: Object,       // colors, type scale, spacing, radii
     fonts: { heading: String, body: String },
     components: {
       headerBar(propertyName, sectionLabel, t, continued): String,
       sectionHeading(title, subtitle, t): String,
       statBox(label, value, t): String,
       tableCss(t): String,
       compCardCss(t): String,
       coverPage(om, ctx, t): String,
       pageChromeCss(t): String,
     },
   }
   ```
10. **Section templates fall back to `resolveTheme(om.branding)`** when `ctx.theme` is not provided — this keeps all existing tests green when they pass `{}` as ctx.

---

## Task 1: Theme registry scaffold + data model

**Goal:** Create the skeleton that all subsequent tasks build on. No real theme implementations yet — just the structure, wiring, and contract tests.

**Files to create:**
- `server/lib/pdf/themes/index.js`
- `server/lib/pdf/themes/institutional.js` (stub — returns minimal valid strings from each component)
- `server/lib/pdf/themes/editorial.js` (stub)
- `server/lib/pdf/themes/bold.js` (stub)
- `server/lib/pdf/themes/minimal.js` (stub)
- `server/lib/pdf/themes/themes.test.js`

**Files to modify:**
- `server/lib/store.js`

### `server/lib/pdf/themes/index.js`

```js
import institutional from './institutional.js';
import editorial from './editorial.js';
import bold from './bold.js';
import minimal from './minimal.js';

export const THEMES = {
  institutional,
  editorial,
  bold,
  minimal,
};

/**
 * Returns the active theme with brokerage color/logo overrides merged.
 * Falls back to 'institutional' on unknown template key.
 */
export function resolveTheme(branding = {}) {
  const base = THEMES[branding.template] || THEMES.institutional;
  // Merge brokerage overrides into tokens
  const tokens = { ...base.tokens };
  if (branding.primaryColor) tokens.primaryColor = branding.primaryColor;
  if (branding.accentColor) tokens.accentColor = branding.accentColor;
  if (branding.logo) tokens.logo = branding.logo;
  return { ...base, tokens };
}
```

### Stub theme shape (implement all 4 with minimal stubs)

Each stub exports the full contract shape; every component returns a non-empty placeholder string. Real implementations come in Tasks 3-6.

```js
export default {
  key: 'institutional',
  label: 'Institutional',
  tokens: {
    primaryColor: '#1A2B4C',
    accentColor: '#C9A227',
    pageBg: '#FFFFFF',
    textColor: '#33363D',
    mutedColor: '#8A8D93',
    statBoxBg: '#F2F3F5',
    tableStripe: '#F7F8F9',
    cardBorder: '#E7E9EC',
    totalRowBg: '#FFFFFF',
    headingFont: 'Libre Franklin',
    bodyFont: 'Inter',
    titleSize: '21px',
    headingWeight: 700,
  },
  fonts: { heading: 'Libre Franklin', body: 'Inter' },
  components: {
    headerBar(propertyName, sectionLabel, t, continued) { return '<div>stub</div>'; },
    sectionHeading(title, subtitle, t) { return '<div>stub</div>'; },
    statBox(label, value, t) { return '<div>stub</div>'; },
    tableCss(t) { return '/* stub */'; },
    compCardCss(t) { return '/* stub */'; },
    coverPage(om, ctx, t) { return '<div>stub</div>'; },
    pageChromeCss(t) { return '/* stub */'; },
  },
};
```

### store.js changes

In `emptyOm()`, add `template: 'institutional'` inside the `branding` object:
```js
branding: {
  primaryColor: '#1B2A4A',
  accentColor: '#C9A84C',
  background: 'white',
  font: 'modern',
  template: 'institutional',  // ← add this
},
```

In `mergeWithDefaults()`, the `branding` key is already spread via `{ ...defaults[key], ...(om[key] || {}) }` so `template` gets backfilled automatically on old docs with no `template` field. No extra code needed.

### `server/lib/pdf/themes/themes.test.js`

Contract test verifying:
1. Every theme key in THEMES exports `key`, `label`, `tokens`, `fonts`, `components`
2. Every component function exists and returns a non-empty string when called with minimal args
3. `resolveTheme({})` returns institutional (fallback on missing template)
4. `resolveTheme({ template: 'unknown' })` returns institutional (fallback on unknown key)
5. `resolveTheme({ template: 'editorial', primaryColor: '#FF0000' })` — tokens.primaryColor is `'#FF0000'`

**Run tests:** `cd server && node --test lib/pdf/themes/themes.test.js`

**Commit:** "Add theme registry scaffold and branding.template data model field"

---

## Task 2: Font infrastructure

**Goal:** Download the 4 font families as WOFF2 files, commit them to the repo, and build a manifest module that loads them as base64.

**Files to create:**
- `server/lib/pdf/fonts/` directory
- `server/lib/pdf/fonts/manifest.js`
- `server/lib/pdf/fonts/*.woff2` — all font weight files (committed to repo)

**Font families and weights to download from Google Fonts:**

| Family | Weights | Filename convention |
|---|---|---|
| Inter | 400, 600, 700 | `inter-400.woff2`, `inter-600.woff2`, `inter-700.woff2` |
| Libre Franklin | 600, 800 | `libre-franklin-600.woff2`, `libre-franklin-800.woff2` |
| Source Serif 4 | 400, 700 | `source-serif-4-400.woff2`, `source-serif-4-700.woff2` |
| Space Grotesk | 500, 700 | `space-grotesk-500.woff2`, `space-grotesk-700.woff2` |

**Download URLs (Google Fonts API v2, subset=latin):**
Use this pattern to get direct WOFF2 download URLs:
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap
```
Fetch the CSS, parse the `src: url(...)` lines for `format('woff2')`, then download the files. Or use the direct static hosting:

For Inter: https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2 (regular)

Actually - the implementer should use a script to download using the Google Fonts CSS2 API, parse the WOFF2 urls, and save them with the naming convention above. The exact URLs must be found dynamically since Google changes them. Use curl or node fetch to get the CSS stylesheet first, parse out the woff2 src URLs, then download each.

**`server/lib/pdf/fonts/manifest.js`:**

```js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function load(filename) {
  return readFileSync(join(__dirname, filename)).toString('base64');
}

// Each entry: { family, style, weight, data (base64) }
export const FONT_FACES = [
  { family: 'Inter', style: 'normal', weight: 400, data: load('inter-400.woff2') },
  { family: 'Inter', style: 'normal', weight: 600, data: load('inter-600.woff2') },
  { family: 'Inter', style: 'normal', weight: 700, data: load('inter-700.woff2') },
  { family: 'Libre Franklin', style: 'normal', weight: 600, data: load('libre-franklin-600.woff2') },
  { family: 'Libre Franklin', style: 'normal', weight: 800, data: load('libre-franklin-800.woff2') },
  { family: 'Source Serif 4', style: 'normal', weight: 400, data: load('source-serif-4-400.woff2') },
  { family: 'Source Serif 4', style: 'normal', weight: 700, data: load('source-serif-4-700.woff2') },
  { family: 'Space Grotesk', style: 'normal', weight: 500, data: load('space-grotesk-500.woff2') },
  { family: 'Space Grotesk', style: 'normal', weight: 700, data: load('space-grotesk-700.woff2') },
];

export function buildFontFaceCss() {
  return FONT_FACES.map(({ family, style, weight, data }) =>
    `@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${weight}; src: url('data:font/woff2;base64,${data}') format('woff2'); font-display: block; }`
  ).join('\n');
}
```

**Update `layout.js`:**
- Import `buildFontFaceCss` from `../fonts/manifest.js`
- In `buildSharedCss()`, prepend `buildFontFaceCss()` to the returned CSS string
- Update `FONT_PRESETS` references to use the new font family names where appropriate (or keep them for the legacy `buildTheme` path — institutional theme will override)

**No new tests** needed for fonts (the contract test in Task 1 implicitly covers theme rendering; render:samples in Task 8 covers PDF output). Run: `cd server && node --test` to confirm no regressions.

**Commit:** "Add embedded WOFF2 fonts for PDF pipeline (Inter, Libre Franklin, Source Serif 4, Space Grotesk)"

---

## Task 3: Institutional theme (full implementation)

**Goal:** Replace the stub `institutional.js` with the full implementation — a refined version of the current navy/gold design language.

**File:** `server/lib/pdf/themes/institutional.js`

**Design spec:**
- Primary: `#1A2B4C` (navy), Accent: `#C9A227` (gold) — these are defaults; brokerage can override
- Font heading: `'Libre Franklin'` (weight 600/800), body: `'Inter'`
- **Header bar:** pill/badge style — property name in navy pill (white text, 3px border-radius), section label right-aligned in accent color, uppercase, letter-spaced
- **Section heading:** title in primaryColor at 21px weight 700, gold rule bar (54px × 3px accent color) below
- **Stat box:** light gray background (`#F2F3F5`), 6px border-radius, label in muted uppercase 8.5px, value in primaryColor 17px weight 700
- **Table CSS:** header row in primaryColor with white text; even rows in `#F7F8F9`; total-row with 2px primaryColor top border
- **Comp card CSS:** 1px `#E7E9EC` border, 8px border-radius, photo 0.8in height
- **Cover page:** full-bleed photo with dark gradient overlay; property type in accent uppercase 11px at top; property name 38px weight 700 white bottom-left; address below; stat strip at bottom (translucent dark bar, 4 stat cells with dividers); disclaimer text 7.5px at very bottom
- **Page chrome CSS:** footer bar with 1px cardBorder top, muted text; page background uses pageBg

**Implementation notes:**
- `coverPage(om, ctx, t)` receives the full `om`, `ctx` (which has `coverPhotoUri`, `brokerLogoUri`), and `t` (tokens). It returns the full inner HTML of the cover page (not wrapped in pageShell — the template or render.js wraps it).
- Use `esc()` from `'../../helpers/format.js'` for escaping
- Use `filterStats`, `formatCurrency`, `formatPercent`, `formatNumber` from `'../../helpers/format.js'`
- For `googleMapsSearchUrl` and `buildAddressString`, import from `'../../../maps.js'`

**Tokens shape (full):**
```js
tokens: {
  primaryColor: '#1A2B4C',
  accentColor: '#C9A227',
  pageBg: '#FFFFFF',
  textColor: '#33363D',
  mutedColor: '#8A8D93',
  statBoxBg: '#F2F3F5',
  tableStripe: '#F7F8F9',
  cardBorder: '#E7E9EC',
  totalRowBg: '#FFFFFF',
  headingFont: "'Libre Franklin', sans-serif",
  bodyFont: "'Inter', sans-serif",
  titleSize: '21px',
  headingWeight: 700,
}
```

**Run tests:** `cd server && node --test lib/pdf/themes/themes.test.js`

**Commit:** "Implement institutional theme (refined navy/gold)"

---

## Task 4: Editorial theme (full implementation)

**Goal:** Implement the magazine-style editorial design language.

**File:** `server/lib/pdf/themes/editorial.js`

**Design spec:**
- Primary: `#1C1C1C` (near-black), Accent: `#8B4513` (warm sienna/brown, earthy editorial) — defaults; brokerage can override
- Font heading: `'Source Serif 4'` (400/700), body: `'Inter'`
- **Header bar:** NO pill. Instead: a thin 0.5px horizontal rule in accent color across the full width, property name in small Inter 9px muted caps left, section label in Source Serif 4 italic 11px right
- **Section heading:** large oversized section number (01, 02...) in 52px Source Serif 4 light muted opacity 0.15 positioned behind the title; title in 22px Source Serif 4 weight 700 primaryColor; thin 1px hairline rule in accent below; no gold-rule block
  - The heading function receives `(title, subtitle, t)` — the section number must come from... actually the heading function doesn't know its own number. Omit the oversized number OR use a static counter approach in CSS (not practical). Instead: just use a thin accent hairline rule below the title, and generous top whitespace. The oversized number is a nice-to-have that requires counter state.
- **Stat box:** minimal — no background fill, only a thin 1px left accent-color border, label in muted 8px caps, value in 20px Source Serif 4 weight 700 primaryColor
- **Table CSS:** no header fill — instead 1.5px bottom border on th in primaryColor; no zebra stripe; row separator 0.5px #E0E0E0; total-row: bold primaryColor, 1.5px top border accent
- **Comp card CSS:** no rounded corners (0 radius); 1px left border in accent; no border-radius
- **Cover page:** full-bleed photo (or gradient fallback); title set low-left in large Source Serif 4; bottom gradient overlay (70% transparent → 90% dark at bottom); NO stat strip on cover — instead a short divider line and subtitle tagline; property type in small caps; brokerage name bottom-right; a thin accent line across the very bottom edge
- **Page chrome CSS:** footer: NO top rule; just muted text left (property name) and right (page number); page background white

**Run tests:** `cd server && node --test lib/pdf/themes/themes.test.js`

**Commit:** "Implement editorial theme (magazine style, Source Serif 4)"

---

## Task 5: Bold theme (full implementation)

**Goal:** Implement the modern marketing bold design language.

**File:** `server/lib/pdf/themes/bold.js`

**Design spec:**
- Primary: `#0F1A2E` (deep navy), Accent: `#E8402A` (vivid red-orange) — defaults; brokerage can override
- Font heading: `'Space Grotesk'` (500/700), body: `'Space Grotesk'`
- **Header bar:** solid accent-colored thick left stripe (6px) + property name in Space Grotesk 700 11px on a light gray bg; section label in accent 11px 700 uppercase right
- **Section heading:** title in Space Grotesk 700 24px primaryColor; below: a 6px-tall × 40px-wide solid accent block (chunky rule)
- **Stat box:** large value in 28px+ Space Grotesk 700 primaryColor; NO box background; accent color underline only; label in Space Grotesk 500 8px uppercase muted
- **Table CSS:** header row: solid primaryColor bg, white text, Space Grotesk 700 — NO zebra striping (all rows white); row dividers 1px light gray; total-row: solid accent bg white text
- **Comp card CSS:** straight sharp corners (0 radius); top 4px solid accent border; subtle shadow `box-shadow: 2px 2px 6px rgba(0,0,0,0.08)`
- **Cover page:** SPLIT layout — left 40% solid `primaryColor` panel (title, address, 2-3 key stats stacked vertically in white text); right 60% full-bleed photo (no overlay); property type in small accent-colored pill top-left of left panel; "OFFERING MEMORANDUM" in 8px white caps top of left panel
- **Page chrome CSS:** footer: 1px accent-color left strip + muted text; page background white

**Run tests:** `cd server && node --test lib/pdf/themes/themes.test.js`

**Commit:** "Implement bold theme (modern marketing, Space Grotesk)"

---

## Task 6: Minimal theme (full implementation)

**Goal:** Implement the hairline-grid minimal design language.

**File:** `server/lib/pdf/themes/minimal.js`

**Design spec:**
- Primary: `#111111` (near-black), Accent: `#2563EB` (a single clear blue) — defaults; brokerage can override
- Font heading: `'Inter'` (700), body: `'Inter'` (400)
- **Header bar:** NO bar background. Just property name in Inter 8px 600 muted uppercase left, section label in Inter 8px 400 muted right; a 0.5px `#DDDDDD` hairline line across the full width above
- **Section heading:** title in Inter 700 20px near-black, NO rule below, just 8px bottom margin; subtitle in Inter 400 11px muted; NO decorative elements
- **Stat box:** NO background, NO border. Label in Inter 600 8px uppercase letter-spaced muted. Value in accent color 22px Inter 700. A 0.5px bottom line in `#DDDDDD`
- **Table CSS:** NO header bg (header cells: Inter 600 9px uppercase muted, 0.5px bottom border in primaryColor); row dividers 0.5px `#EBEBEB`; NO zebra stripe; total-row: Inter 700 primaryColor, 0.5px top border accent
- **Comp card CSS:** border 0.5px `#DDDDDD`; no radius; no shadow; no photo placeholder fill
- **Cover page:** white page; a thin 0.5px horizontal accent rule at top (full width); property name in Inter 700 42px light-weight near-black at top-left (0.6in down); address in Inter 400 14px muted below; center of page: a small photo band (3.5in wide, 1.5in tall, centered horizontally); bottom-left: brokerage name; bottom: 0.5px horizontal rule; NO stat strip on cover
- **Page chrome CSS:** footer: thin 0.5px top rule in `#DDDDDD`, Inter 400 8px muted text; page background pure white

**Run tests:** `cd server && node --test lib/pdf/themes/themes.test.js`

**Commit:** "Implement minimal theme (hairline grid, Inter only)"

---

## Task 7: Refactor layout.js, render.js, and all section templates

**Goal:** Wire the theme system into the live render pipeline. All section templates delegate to `ctx.theme.components.*`. All existing tests updated to pass a theme via ctx; all must stay green.

**This is the largest task. Be methodical.**

### `server/lib/pdf/templates/layout.js` changes

1. Import `resolveTheme` from `'../themes/index.js'` (add import)
2. Keep all existing exports: `pageShell`, `flowSection`, `buildDocument`, `footerHtml`
3. Keep `buildTheme(branding)` for backward compatibility — it should call `resolveTheme(branding)` and return the `tokens` (to avoid breaking any lingering direct callers during the refactor window). Actually: keep `buildTheme` as an alias that returns `resolveTheme(branding).tokens` merged with the theme object.
4. In `buildSharedCss(theme)`: delegate component CSS to the active theme:
   - The `theme` param passed here is the full resolved theme object (not just tokens)
   - `const t = theme.tokens || theme` (handle both old tokens-only objects and new full theme objects)
   - Keep base structural CSS (page, pdf-page, pdf-page-content, pdf-flow-body, pdf-flow-section, two-col, bullet-list, narrative, pdf-link, subhead)
   - Replace component CSS blocks (stat-box, pdf-table, comp-card, pdf-header-bar, gold-rule, section-title, section-subtitle) with:
     ```js
     ${theme.components ? theme.components.tableCss(t) : legacyTableCss(t)}
     ${theme.components ? theme.components.compCardCss(t) : legacyCompCardCss(t)}
     ${theme.components ? theme.components.pageChromeCss(t) : legacyPageChromeCss(t)}
     ```
   - Keep legacy CSS functions as private fallbacks for backward compat during tests
5. Export `resolveTheme` from layout.js for section templates to import easily:
   ```js
   export { resolveTheme } from '../themes/index.js';
   ```

### `server/lib/pdf/render.js` changes

1. Import `resolveTheme` from `'../themes/index.js'`
2. In `generatePdf()`, change:
   ```js
   const theme = buildTheme(om.branding);
   ```
   to:
   ```js
   const theme = resolveTheme(om.branding);
   ```
3. `renderCtx.theme` now carries the full theme object (with `.components`)
4. Keep `buildDocument(bodyHtml, theme)` call — `buildSharedCss` handles the full theme object

### Section template changes (apply to ALL of these files)

For each file in `server/lib/pdf/templates/`:
`cover.js`, `executiveSummary.js`, `overview.js`, `market.js`, `financials.js`,
`salesComps.js`, `rentComps.js`, `locationMap.js`, `driveTimePois.js`,
`offeringProcedures.js`, `team.js`, `toc.js`, `backCover.js`, `onePager.js`

**Pattern for each file:**
1. Change the theme resolution line from:
   ```js
   const theme = ctx.theme || buildTheme(om.branding);
   ```
   to:
   ```js
   const theme = ctx.theme || resolveTheme(om.branding);
   ```
   Import `resolveTheme` from `'./layout.js'` (which re-exports it).

2. Replace `headerBar(propertyName, sectionLabel)` calls with:
   ```js
   theme.components.headerBar(propertyName, sectionLabel, theme.tokens, false)
   ```

3. Replace `<div class="gold-rule"></div>` with nothing — sectionHeading handles rules:
   Actually the theme's `sectionHeading(title, subtitle, t)` can wrap the title + rule together. But this changes the HTML structure significantly. A simpler approach:
   - Keep `<div class="section-title">...</div>` and `<div class="gold-rule"></div>` as-is in the templates
   - The theme's `pageChromeCss` and component CSS already handle how `.gold-rule` renders per theme
   - Only replace `headerBar(...)` calls with `theme.components.headerBar(...)`
   - Replace inline `bigStat()` in executiveSummary with `theme.components.statBox(label, value, theme.tokens)`

4. For `cover.js`: dispatch to `theme.components.coverPage(om, ctx, theme.tokens)` and wrap result in `pageShell(...)`.

5. Import `resolveTheme` from `'./layout.js'` and remove import of `buildTheme` (or keep it if needed for legacy)

### Test file changes

For every `*.test.js` file in `server/lib/pdf/templates/`:

Add at top:
```js
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };
```

Change all `buildPages(om, {})` calls to `buildPages(om, defaultCtx)`.

The institutional theme (fallback for empty branding) produces the same visual design as the current hardcoded CSS, so all assertions about rendered HTML still hold.

### Run all tests after this task

```
cd server && node --test
```

All pre-existing tests must pass. New theme contract tests must pass.

**Commit:** "Refactor section templates to delegate presentation to active theme"

---

## Task 8: QA harness (render-samples script + npm script)

**Goal:** Create the render:samples script that produces 12 PDFs and validates all templates are visually distinct.

**Files to create:**
- `server/scripts/render-samples.js`

**Files to modify:**
- `server/package.json` (add `render:samples` script)
- Root `package.json` (add `render:samples` wrapper)

### `server/scripts/render-samples.js`

```js
#!/usr/bin/env node
/**
 * Renders one sample OM through all 4 themes × 3 docTypes = 12 PDFs.
 * Output: server/generated/samples/<template>-<docType>.pdf
 *
 * Usage: node server/scripts/render-samples.js
 * Or via: npm run render:samples
 */
```

The script:
1. Creates a realistic multifamily OM in memory (no file I/O for the OM itself):
   - `id`: `'sample-render-001'`
   - `docType`: varies per loop
   - Fills in realistic data: property name "Maple Grove Apartments", address "1234 Oak Street, Austin, TX 78701", propertyType "Multifamily", 48 units, year built 1987, 96% occupancy, offering price $8,500,000, cap rate 5.2%, NOI $442,000, 38,400 SF
   - 3 executive summary highlights
   - 2 sales comps (with realistic data)
   - 2 rent comps
   - One team member
   - Simple market narrative
   - No photos (graceful empty)
   - `branding.template` = varies per loop
2. Loops over `['om', 'onePager', 'bov']` × `['institutional', 'editorial', 'bold', 'minimal']`
3. For each combination:
   - Set `om.docType` and `om.branding.template`
   - Call `generatePdf(om, outputPath)`
   - Output to `server/generated/samples/<template>-<docType>.pdf`
4. Creates `server/generated/samples/` directory if it doesn't exist
5. Logs each file as it's written: `✓ institutional-om.pdf`
6. Closes the Puppeteer browser at the end
7. Reports total: `12 PDFs written to server/generated/samples/`

**Note on `bov` docType:** The current codebase uses 'om' and 'onePager' as valid doc types in store.js (`VALID_DOC_TYPES`). The brief mentions 'bov' as a third docType. The render-samples script should create bov docs with `docType: 'bov'` — the render pipeline should handle it gracefully (bov falls through to the OM multi-page layout). Don't add bov validation to store.js unless it's already there.

**`server/package.json`:** Add:
```json
"render:samples": "node scripts/render-samples.js"
```

**Root `package.json`:** Add:
```json
"render:samples": "npm run render:samples --prefix server"
```

**Run:** `npm run render:samples` from repo root. Verify 12 PDFs appear in `server/generated/samples/`.

**No new unit tests** — the script IS the QA harness. Its exit code is the test.

**Commit:** "Add render:samples QA harness for all 4 themes × 3 docTypes"

---

## Task 9: Client template picker

**Goal:** Add a template picker to the branding section of the editor, wired to `branding.template`.

**Files to modify:**
- `client/src/pages/Editor.jsx` (or the component that renders the branding section)
- Possibly a new `client/src/components/TemplatePicker.jsx`

**Discovery required:** First read `client/src/pages/Editor.jsx` and the branding section to understand the exact component structure before implementing.

### Behavior spec

- Location: Inside the branding panel/section that shows color pickers and font controls
- 4 options: Institutional, Editorial, Bold, Minimal
- Each option shows:
  - A small visual swatch / mini-thumbnail (static SVG or CSS mock — no Puppeteer)
  - The template label
  - A short descriptor (e.g. "Classic navy/gold", "Magazine serif", "Modern marketing", "Clean minimal")
- Selection updates `om.branding.template` (triggers autosave via the existing `handleChange` / `scheduleSave` pattern)
- When a template pins its own fonts (editorial uses Source Serif 4, bold uses Space Grotesk), hide the `font` preset dropdown. Templates that don't pin fonts (institutional pins Libre Franklin/Inter, minimal pins Inter): hide the font preset since all four templates now have fixed fonts. Actually the brief says "hide `font` preset when a template pins its own fonts" — all 4 themes pin fonts, so always hide the font preset selector when a template is selected. But keep the `background` (pageBg) control visible and functional.
- Default value: `'institutional'` (already in `emptyOm()` after Task 1)

### Mini-swatch design

Each swatch should be a ~80×60px CSS/SVG mockup of the cover layout. Examples:
- **Institutional:** navy rectangle fill, small gold bar at top, white title lines
- **Editorial:** white rectangle, large serif "T" shape, thin horizontal line at bottom
- **Bold:** left 40% navy, right 60% gray, white text lines on navy side
- **Minimal:** white rectangle, thin blue top line, black title text top-left

Use inline SVG or pure CSS for these — no images, no external assets.

### Wiring

The template picker renders below the color pickers in the branding section. It calls the existing change handler with path `branding.template` and the selected value.

**Run:** `cd client && npm run lint` — must pass. No new tests required for this UI component (existing test suite covers layout).

**Commit:** "Add template picker to editor branding section"
