# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run from repo root)
npm run install:all

# Run both servers concurrently (backend :4000, frontend :5173)
npm run dev

# Run servers individually
npm run dev:server   # Express API on http://localhost:4000
npm run dev:client   # Vite dev server on http://localhost:5173

# Run all server tests
cd server && node --test

# Run a single server test file
cd server && node --test lib/ai.test.js

# Run all client tests
cd client && node --test src/lib/**/*.test.js

# Run a single client test file
cd client && node --test src/lib/format.test.js

# Lint client code
cd client && npm run lint

# Build client for production
cd client && npm run build
```

## Architecture

This is a monorepo with a React frontend (`client/`) and an Express backend (`server/`). There is no database — each document (called an "OM") is stored as a single JSON file in `server/data/oms/<id>.json`.

### Data model

The canonical OM shape is defined by `server/lib/store.js:emptyOm()`. Every document has a `docType` field (`'om'`, `'onePager'`, or `'bov'`) that controls which editor sections are active and which PDF template is used. The `mergeWithDefaults()` function in `store.js` backfills any missing fields from older records at read time — there are no migration scripts.

### Request authentication

There is no real auth. The client sends the user's email as the `X-User-Email` request header (`client/src/api.js`). The server trusts it via `server/lib/auth.js:getOwnerEmail()`. Documents are scoped to this email at both list and CRUD level via `getOwnedOm()` in `server/routes/oms.js`.

### API routes

All document routes live in `server/routes/oms.js` under `/api/oms`. Key endpoint groups:

- **CRUD**: `GET/POST /api/oms`, `GET/PUT/DELETE /api/oms/:id`
- **AI generation**: `POST /api/oms/:id/ai/:kind` for a single section, `POST /api/oms/:id/ai/generate-all` for all applicable sections in parallel. Available kinds are the keys of `PROMPT_BUILDERS` in `server/lib/ai.js`.
- **Export**: `POST /api/oms/:id/generate` with `{ format: 'pdf' | 'pptx' | 'web' }` — PDF and PPTX are written to `server/generated/` and returned as download URLs; `web` returns a `/share/<id>` URL.
- **Document import**: `POST /api/oms/:id/extract/upload` (PDF file) and `POST /api/oms/:id/extract/url` — uses Claude to extract property data and patch the document.
- **Public (no auth)**: `/:id/shared`, `/:id/share-info`, `/:id/nda/sign`, `/:id/static-map.png`

### PDF pipeline

`server/lib/pdf/render.js` drives Puppeteer. A single shared Chromium instance is reused across requests (`sharedBrowser`) and closed gracefully on SIGTERM/SIGINT to prevent `node --watch` from hanging. Each document section is an ES module in `server/lib/pdf/templates/` that exports an HTML string builder. Sections marked `flow: true` share printed pages; others get forced page breaks. The `onePager.js` template handles both One Pager and (when `docType` is `'bov'`) BOV cover pages.

### Section-to-docType mapping

`client/src/lib/sectionsByDocType.js` defines which section keys are active for each `docType`. The same mapping controls what the editor sidebar shows, what the completeness bar tracks, and what `generate-all` drafts with AI. When adding a new section, update `KEYS_BY_DOC_TYPE` here and `SECTION_COMPONENTS` in `client/src/pages/Editor.jsx`.

### AI prompting

All Claude prompt builders live in `server/lib/ai.js:PROMPT_BUILDERS`. Each builder receives the full OM object and returns `{ system, user }`. Custom AI instructions from the editor's per-section instruction boxes are appended to the user prompt by `appendCustomInstructions()` — they read from `om.aiInstructions[sectionKey]`, but the client also passes `liveAiInstructions` in the request body to handle the case where autosave hasn't flushed yet.

### Client autosave

`client/src/pages/Editor.jsx` debounces saves: every field change calls `scheduleSave()`, which waits ~800ms then calls `api.updateOm()`. The OM is held in both `useState` (for rendering) and `useRef` (for the save closure, to avoid stale captures).

### File uploads

Multer is configured in `server/lib/upload.js` with a MIME-type allowlist and a 250MB limit. Uploaded files are stored at `server/uploads/<omId>/<filename>`. File references in documents are plain objects with `{ filename, url, mimetype, ... }` — `url` always begins with `/uploads/<omId>/`. When duplicating a document, `store.js:rewriteFileUrls()` walks the entire JSON tree and repoints all URLs to the new ID.

### Environment

Copy `server/.env.example` to `server/.env`. `ANTHROPIC_API_KEY` is required for AI buttons; `GOOGLE_MAPS_API_KEY` is required for address geocoding and static maps. Both degrade gracefully with clear error messages when unset.
