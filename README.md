# PropDocs

A guided document builder for commercial real estate brokers. Sign in with just your name and email, pick a document type, fill in a section-by-section form — with AI-assisted drafting for the hardest-to-write parts — and export a pixel-perfect document as a **PDF**, a **PowerPoint deck**, or a mobile-friendly **shareable flipbook link**.

## Accounts

There's no password and no real authentication: the first time you open the app you're asked for your name and email, which are stored in the browser's `localStorage` and used to personalize the dashboard (your name appears top-right). This is a convenience identity layer only — see [Notes / limitations](#notes--limitations).

## Dashboard

The home page is a full-width, dark navy + gold workspace: a left sidebar for organizing documents into folders, a hero section with a "+ New Document" call to action, and a grid of document cards (each tagged with its document type) below. Click a card's menu to rename, duplicate, move to a folder, or delete it.

## Document types

When you create a new document, a two- or three-step modal walks you through:

1. **Pick a document type** — this can't be changed after creation, since each type has a different set of editor sections and its own PDF template (PowerPoint and the shareable web link currently always use the full Offering Memorandum structure regardless of document type).
2. **Start from scratch or copy from an existing document?** — copying lets you pick any saved document and pre-fills every field the two document types have in common (property name/address/type, broker name/title/phone/email/headshot, brokerage logo, year built, square footage, zoning, occupancy, offering price, cap rate, NOI, and more). Fields that don't exist on the new document type are simply skipped.

The three document types:

- **Offering Memorandum** — the full 11-section package: Cover, Branding, Property Overview, Executive Summary, Market Overview, Financials (T12, Rent Roll, Pro Forma), Sales Comps, Rent Comps, Location & Amenities, Offering Procedures, About the Team.
- **One Pager** — a single designed page edited in 3 sections: **Property Info** (address, type, hero photo, tagline, year built, SF, zoning, occupancy), **Deal Highlights** (price, cap rate, NOI, AI-assisted investment highlights), and **Broker Info** (name, title, phone, email, headshot, brokerage logo/name/website). The PDF shows the hero photo with the tagline prominently below the property name, a stat bar that only shows metrics you've actually entered, and each highlight as a bold headline with one supporting sentence rather than a bullet list.
- **Broker Opinion of Value (BOV)** — Cover, Branding, Property Overview, Valuation Methodology & Conclusion, Comparable Sales Analysis, Broker Recommendation, Team.

Each section supports dynamic repeating rows (comps, line items, rent roll, cash flow years, team members) and file uploads (photos, videos, documents). Work autosaves as you type, a sidebar progress bar and per-section checkmarks show how complete the document is, and "Generate with AI" buttons (Executive Summary narrative, Investment Highlights, Market narrative, Sales Comp pricing analysis, Property description, Valuation Methodology, Broker Recommendation) draft tight, punchy copy from the data you've already entered — you can edit anything the AI writes, and every section has a **Custom AI Instructions** box to tell the AI what to emphasize, exclude, or adjust before generating. Custom instructions reach the AI prompt even if you type them and click Generate within the same second, before autosave has finished writing them to disk.

Currency, percentage, phone, square footage, and year fields format themselves as you type: prices and dollar amounts get `$` and thousands separators, cap rate/occupancy fields get a trailing `%`, phone numbers become `(XXX) XXX-XXXX`, square footage gets a trailing `SF`, and Year Built accepts only 4 digits.

Asking Price, NOI, and Cap Rate are entered once (Executive Summary, or Deal Highlights on the One Pager) and automatically flow into every export. The brokerage logo is uploaded once on the Cover Page (or Broker Info, on the One Pager) and automatically appears throughout the document.

## Branding

The **Branding** section lets each document customize its own PDF look: a primary color, an accent color, a background style (White / Light Gray / Dark Navy), and a font style (Modern / Classic / Bold). These apply live to the generated PDF every time you click Generate — the background presets automatically flip text to light/dark as needed so contrast always holds, regardless of which primary/accent colors you pick.

If you've uploaded a brokerage logo, an **Extract Colors from Logo** button appears above the color pickers. Clicking it (and only clicking it — this never runs automatically) sends the logo to Claude's vision model and shows a suggested primary/accent pair with a preview swatch; click Apply to use it, or Dismiss and pick colors manually. Your logo is used in the document either way — the suggestion only affects the surrounding color scheme.

## Tech stack

- **Frontend:** React 19 + Vite, React Router, `react-pageflip` (shareable flipbook), plain CSS (no UI framework)
- **Backend:** Node.js + Express, file-based JSON storage (no database to set up)
- **File uploads:** Multer, stored on local disk under `server/uploads/`
- **PDF generation:** Puppeteer (headless Chromium) rendering designed HTML/CSS templates — pixel-perfect output, replacing the old PDFKit pipeline
- **PowerPoint generation:** PptxGenJS
- **AI drafting:** Anthropic Claude API (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Address validation & maps:** Google Maps Geocoding API + Static Maps API

## Environment variables

AI drafting and Google Maps features need API keys. Copy the example file and fill in your own keys:

```bash
cp server/.env.example server/.env
```

```
ANTHROPIC_API_KEY=      # required for the "Generate with AI" buttons
GOOGLE_MAPS_API_KEY=    # required for address validation and the Location & Amenities map
PORT=4000               # optional, defaults to 4000
```

Both features degrade gracefully without a key:
- AI buttons return a clear "ANTHROPIC_API_KEY is not set" error instead of failing silently.
- The Location & Amenities page shows a placeholder instead of a map, and the address Validate button returns a clear setup error.

`server/.env` is git-ignored — never commit real keys.

## Project structure

```
automated-om-builder/
├── client/                        # React + Vite frontend
│   └── src/
│       ├── pages/                 # Home, Editor, SharePage (flipbook)
│       ├── components/
│       │   ├── sections/          # one form component per OM section
│       │   ├── flipbook/          # shareable web link page-turn viewer
│       │   ├── AiGenerateButton.jsx
│       │   ├── Sidebar.jsx        # section nav + progress bar + checkmarks
│       │   └── OutputPanel.jsx    # format picker + Generate button
│       ├── lib/                   # format.js, completeness.js (shared client logic)
│       └── styles/                # global.css design system
├── server/                        # Express backend
│   ├── routes/oms.js              # CRUD + upload + generate + AI + geocode endpoints
│   ├── lib/store.js                # file-based JSON storage + schema defaults
│   ├── lib/upload.js               # multer config / file type allowlist
│   ├── lib/ai.js                   # Anthropic Claude prompt builders + client
│   ├── lib/maps.js                 # Google Geocoding + Static Maps helpers
│   ├── lib/pdf/                    # Puppeteer PDF pipeline
│   │   ├── render.js               # assembles + paginates the full document
│   │   ├── templates/              # one HTML template module per OM section/page
│   │   └── helpers/                # currency/percent/date formatting, image embedding
│   ├── lib/pptxGenerator.js        # builds the PowerPoint OM
│   ├── data/oms/                   # one JSON file per OM (created at runtime)
│   ├── uploads/                    # uploaded photos/videos/documents (created at runtime)
│   └── generated/                  # generated PDF/PPTX output files (created at runtime)
└── package.json                    # root scripts to run both apps together
```

## Running it locally

Requires Node.js 18+ (tested on Node 24).

```bash
# from the repo root
npm run install:all   # installs root, server, and client dependencies
cp server/.env.example server/.env   # then fill in your API keys
npm run dev            # starts the backend (port 4000) and frontend (port 5173) together
```

Then open **http://localhost:5173** in your browser.

To run them separately instead:

```bash
npm run dev:server   # Express API on http://localhost:4000
npm run dev:client   # Vite dev server on http://localhost:5173 (proxies /api, /uploads, /generated to :4000)
```

### Puppeteer / Chromium

`npm install` downloads a bundled Chromium automatically (no separate browser install needed). On macOS, if Gatekeeper blocks the downloaded binary on first run, clear the quarantine flag:

```bash
xattr -d com.apple.quarantine server/node_modules/puppeteer/.local-chromium/**/chrome-mac*/Chromium.app
```

### Using the app

1. The first time you open the app, enter your name and email — no password, this just personalizes the dashboard.
2. Click **+ New Document**, choose a document type (this can't be changed later), then choose to start from scratch or copy matching fields from an existing saved document.
3. Work through the sections in the sidebar — each one autosaves a moment after you stop typing. The progress bar and green checkmarks show what's left, scoped to the sections that document type actually uses.
4. Use the **Validate & Format Address** button on the Cover Page to geocode and format the property address (requires `GOOGLE_MAPS_API_KEY`). If you've uploaded a brokerage logo, use the **Extract Colors from Logo** button on the Branding section to get an AI color suggestion — it only runs when you click it.
5. Use the **✨ Generate with AI** buttons throughout the form to draft narrative copy from the data you've entered — add a note in a section's **Custom AI Instructions** box first if you want to steer the result, then edit the output as needed.
6. In the right-hand panel, choose an **Output Format** and click **Generate**:
   - **PDF** — a full designed document rendered via headless Chromium, themed by the Branding section, with clickable Google Maps links on every address and the Data Room link.
   - **PowerPoint** — the same section structure as editable slides (always the full Offering Memorandum structure, see Document types above).
   - **Web Link** — a shareable URL (`/share/<id>`) that renders a mobile-responsive, page-turning flipbook (always the full Offering Memorandum structure) — useful for sending to clients without exporting a file.

### Supported upload types

Images (JPG, PNG, WEBP, GIF), video (MP4, MOV, WEBM), and documents (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX), up to 250MB per file. The PDF and flipbook outputs render JPEG, PNG, WEBP, and GIF; PowerPoint embedding is limited to JPEG/PNG (a PowerPoint file-format constraint). Videos are stored and listed but not embedded into any export.

## Data storage

There's no database to install. Each OM is stored as a single JSON file in `server/data/oms/<id>.json`, and uploaded files live under `server/uploads/<id>/`. Generated exports are written to `server/generated/`. All three directories are git-ignored except for `.gitkeep` placeholders, so a fresh clone starts empty. Older OM records missing newer fields are backfilled with defaults automatically when read — no migration step needed.

## Notes / limitations

- This is a local, single-user tool. The signup screen collects a name and email for personalization only — it is not authentication. There's no password, no session, and no access control: anyone with the share link (or API/browser access to this instance) can view or edit any document. Don't expose the server directly to the internet without adding real auth.
- The PDF's table of contents shows real page numbers, computed from the actual chunked page layout before rendering. The PowerPoint table of contents lists section names only — PowerPoint slides have no page-number concept, so this is an intentional difference between the two formats.
- The Location & Amenities page shows two maps: a street-level view (zoom 17) and a wider regional overview (zoom 13), in the PDF, PowerPoint, and the flipbook. Both require `GOOGLE_MAPS_API_KEY`; without it, a placeholder is shown instead. Note the Static Maps API must be enabled (and, if your key has an API restrictions allowlist configured in Google Cloud Console, added to it) separately from the Geocoding API.
- Branding (colors/background/font) and the One Pager/BOV PDF templates are PDF-only this round — PowerPoint and the flipbook always render the full Offering Memorandum structure with the default look, regardless of a document's branding or document type.
- "Generate with AI" buttons and the logo color suggestion require `ANTHROPIC_API_KEY`; without it, clicking shows a clear setup error rather than failing silently. AI output is instructed to be concise and punchy, lead with the most important point, and never use em dashes.
