# OM Builder

A guided Offering Memorandum (OM) builder for commercial real estate brokers. Fill in a section-by-section form — with AI-assisted drafting for the hardest-to-write parts — and export a pixel-perfect OM as a **PDF**, a **PowerPoint deck**, or a mobile-friendly **shareable flipbook link**.

## What it does

The app walks a broker through 10 sections:

1. Cover Page
2. Property Overview
3. Executive Summary
4. Market Overview
5. Financials (T12, Rent Roll, Pro Forma)
6. Sales Comps
7. Rent Comps
8. Location & Amenities
9. Offering Procedures
10. About the Team

Each section supports dynamic repeating rows (comps, line items, rent roll, cash flow years, team members) and file uploads (photos, videos, documents). Work autosaves as you type, a sidebar progress bar and per-section checkmarks show how complete the OM is, and "Generate with AI" buttons (Executive Summary narrative, Investment Highlights, Market narrative, Sales Comp pricing analysis, Property description) draft copy from the data you've already entered — you can edit anything the AI writes.

Asking Price, NOI, and Cap Rate are entered once on **Executive Summary** and automatically flow into Financials and every export. The brokerage logo is uploaded once on the **Cover Page** and automatically appears on the Team page and Back Cover.

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

1. Click **+ New Offering Memorandum** on the home page.
2. Work through the 10 sections in the sidebar — each one autosaves a moment after you stop typing. The progress bar and green checkmarks show what's left.
3. Use the **Validate & Format Address** button on the Cover Page to geocode and format the property address (requires `GOOGLE_MAPS_API_KEY`).
4. Use the **✨ Generate with AI** buttons on Executive Summary, Market Overview, Sales Comps, and Property Overview to draft narrative copy from the data you've entered, then edit as needed.
5. In the right-hand panel, choose an **Output Format** and click **Generate**:
   - **PDF** — a full designed document (cover, table of contents, all sections, location map, back cover), rendered via headless Chromium.
   - **PowerPoint** — the same section structure as editable slides.
   - **Web Link** — a shareable URL (`/share/<id>`) that renders a mobile-responsive, page-turning flipbook — useful for sending to clients without exporting a file.

### Supported upload types

Images (JPG, PNG, WEBP, GIF), video (MP4, MOV, WEBM), and documents (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX), up to 250MB per file. The PDF and flipbook outputs render JPEG, PNG, WEBP, and GIF; PowerPoint embedding is limited to JPEG/PNG (a PowerPoint file-format constraint). Videos are stored and listed but not embedded into any export.

## Data storage

There's no database to install. Each OM is stored as a single JSON file in `server/data/oms/<id>.json`, and uploaded files live under `server/uploads/<id>/`. Generated exports are written to `server/generated/`. All three directories are git-ignored except for `.gitkeep` placeholders, so a fresh clone starts empty. Older OM records missing newer fields are backfilled with defaults automatically when read — no migration step needed.

## Notes / limitations

- This is a local, single-user tool with no authentication — anyone with the share link (or API access) can view an OM. Don't expose the server directly to the internet without adding auth.
- The PDF's table of contents shows real page numbers, computed from the actual chunked page layout before rendering. The PowerPoint table of contents lists section names only — PowerPoint slides have no page-number concept, so this is an intentional difference between the two formats.
- The Location & Amenities map (PDF, PowerPoint, and the flipbook) requires `GOOGLE_MAPS_API_KEY`; without it, a placeholder is shown instead.
- "Generate with AI" buttons require `ANTHROPIC_API_KEY`; without it, clicking shows a clear setup error rather than failing silently.
