# OM Builder

A semi-automated Offering Memorandum (OM) builder for commercial real estate brokers. Fill in a guided, section-by-section form and export a polished OM as a PDF, a PowerPoint deck, or a shareable web link.

## What it does

The app walks a broker through 8 standard OM sections:

1. Cover Page
2. Property Overview
3. Executive Summary
4. Market Overview
5. Financials / Financial Summary
6. Sales Comps
7. Rent Comps
8. About the Team / Contact

Each section supports rich text fields, dynamic repeating rows (comps, line items, team members), and file uploads (photos, videos, PDFs, Word/Excel documents). Work autosaves as you type. When ready, pick an output format — **PDF** (default), **PowerPoint**, or a **shareable web link** — and click Generate.

## Tech stack

- **Frontend:** React 19 + Vite, React Router, plain CSS (no UI framework)
- **Backend:** Node.js + Express, file-based JSON storage (no database to set up)
- **File uploads:** Multer, stored on local disk under `server/uploads/`
- **PDF generation:** PDFKit
- **PowerPoint generation:** PptxGenJS

No external services, API keys, or database server are required — everything runs locally.

## Project structure

```
automated-om-builder/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── pages/          # Home, Editor, SharePage
│       ├── components/     # Sidebar, FileUpload, OutputPanel, section forms
│       └── styles/         # global.css design system
├── server/                 # Express backend
│   ├── routes/oms.js       # CRUD + upload + generate endpoints
│   ├── lib/store.js        # file-based JSON storage for OM records
│   ├── lib/upload.js       # multer config / file type allowlist
│   ├── lib/pdfGenerator.js # builds the PDF OM
│   ├── lib/pptxGenerator.js# builds the PowerPoint OM
│   ├── data/oms/           # one JSON file per OM (created at runtime)
│   ├── uploads/            # uploaded photos/videos/documents (created at runtime)
│   └── generated/          # generated PDF/PPTX output files (created at runtime)
└── package.json            # root scripts to run both apps together
```

## Running it locally

Requires Node.js 18+ (tested on Node 24).

```bash
# from the repo root
npm run install:all   # installs root, server, and client dependencies
npm run dev            # starts the backend (port 4000) and frontend (port 5173) together
```

Then open **http://localhost:5173** in your browser.

To run them separately instead:

```bash
npm run dev:server   # Express API on http://localhost:4000
npm run dev:client   # Vite dev server on http://localhost:5173 (proxies /api, /uploads, /generated to :4000)
```

### Using the app

1. Click **+ New Offering Memorandum** on the home page.
2. Work through the 8 sections in the sidebar — each one autosaves a moment after you stop typing.
3. Upload photos, videos, or documents directly within the relevant section (cover photo, property photos, rent roll, headshots, etc.).
4. In the right-hand panel, choose an **Output Format** (PDF, PowerPoint, or Web Link) and click **Generate**.
   - PDF/PowerPoint: a download link appears immediately.
   - Web Link: a shareable URL appears (e.g. `/share/<id>`) that renders a read-only, brokerage-styled brochure page — useful for sending to clients without exporting a file.

### Supported upload types

Images (JPG, PNG, WEBP, GIF), video (MP4, MOV, WEBM), and documents (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX), up to 250MB per file.

## Data storage

There's no database to install. Each OM is stored as a single JSON file in `server/data/oms/<id>.json`, and uploaded files live under `server/uploads/<id>/`. Generated exports are written to `server/generated/`. All three directories are git-ignored except for `.gitkeep` placeholders, so a fresh clone starts empty.

## Notes / limitations

- This is a local, single-user tool with no authentication — anyone with the share link (or API access) can view an OM. Don't expose the server directly to the internet without adding auth.
- PDF/PPTX image embedding supports JPEG and PNG; other uploaded image types (WEBP/GIF) and videos are stored and listed but not embedded into the generated documents.
