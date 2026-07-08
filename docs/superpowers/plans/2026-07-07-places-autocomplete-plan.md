# Plan: Google Places Autocomplete for Drive Times / POI Section

## Summary

Add Google Places Autocomplete to the drive times / POI section so brokers can type a partial name (e.g. "airport" or "KCI") and get live suggestions, rather than typing a full raw address. On selection, autofill POI name (if blank), full formatted address, and lat/lng; then trigger the existing recalculate drive times flow.

## Global Constraints

- API key is `GOOGLE_MAPS_API_KEY`, already in `server/.env`. Never expose it to the client.
- All Google API calls go server-side (match the existing pattern in `server/lib/maps.js`).
- If `GOOGLE_MAPS_API_KEY` is missing, degrade gracefully: show a clear hint, don't block manual address entry.
- Debounce: 300ms, minimum 3 characters before first fetch.
- Empty / no-match results: show no dropdown, throw no error.
- Scope: POI/drive times fields only. Do NOT touch `CoverSection.jsx` or `PropertyInfoSection.jsx`.
- POI name autofill only if the name field is currently blank.
- On place selection, trigger `handleRecalculate()` (same as existing `onBlur` trigger).
- The `onBlur` recalculate trigger on the address field stays in place as a fallback for manual-typed addresses.
- No new packages unless absolutely necessary; use native fetch (already used in `maps.js`).
- Follow the file/naming/import conventions already in the codebase.

## Architecture

Two server routes proxied under the OM ownership auth pattern:
- `GET /api/oms/:id/poi/places?q=<query>` — Places Autocomplete → `[{ placeId, description, mainText, secondaryText }]`
- `GET /api/oms/:id/poi/places/:placeId` — Places Details → `{ name, formattedAddress, lat, lng }`

Google Places Autocomplete API endpoint: `https://maps.googleapis.com/maps/api/place/autocomplete/json`
Google Places Details API endpoint: `https://maps.googleapis.com/maps/api/place/details/json`

## Tasks

### Task 1: Add `searchPlaces` and `getPlaceDetails` to `server/lib/maps.js`

Add two new exported async functions to the bottom of `server/lib/maps.js`:

**`searchPlaces(query)`**
- Calls `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=<query>&key=<key>`
- Returns `[]` if no API key (no throw, no error)
- Returns `[]` if API responds with zero predictions or any non-OK status
- Returns array of `{ placeId, description, mainText, secondaryText }` from `prediction.place_id`, `prediction.description`, `prediction.structured_formatting.main_text`, `prediction.structured_formatting.secondary_text`
- Wraps the fetch in try/catch; on any error returns `[]`

**`getPlaceDetails(placeId)`**
- Calls `https://maps.googleapis.com/maps/api/place/details/json?place_id=<placeId>&fields=name,formatted_address,geometry&key=<key>`
- Returns `null` if no API key (no throw)
- Returns `null` on any API error or missing result
- Returns `{ name, formattedAddress, lat, lng }` from `result.name`, `result.formatted_address`, `result.geometry.location.lat`, `result.geometry.location.lng`
- Wraps the fetch in try/catch; on any error returns `null`

No tests are needed for these two functions (they are thin HTTP wrappers — same pattern as `fetchDriveTimeMinutes` which has no test either).

Files changed: `server/lib/maps.js`

### Task 2: Add two new routes to `server/routes/oms.js`

Add two GET routes under the existing `/:id` prefix, immediately before the final `export default router` line.

**`GET /:id/poi/places`**
- Auth via `getOwnedOm` (same as all other OM routes)
- Reads `q` from `req.query.q`
- If `q` is missing or fewer than 3 characters, returns `res.json([])`
- Calls `searchPlaces(q)` (imported from `../lib/maps.js` — add to existing import)
- Returns `res.json(results)`
- On error: `res.status(err.status || 500).json({ error: err.message })`

**`GET /:id/poi/places/:placeId`**
- Auth via `getOwnedOm`
- Calls `getPlaceDetails(req.params.placeId)`
- If result is null: `res.status(404).json({ error: 'Place not found' })`
- Returns `res.json(result)` on success
- On error: `res.status(err.status || 500).json({ error: err.message })`

Files changed: `server/routes/oms.js`

### Task 3: Add `searchPlaces` and `getPlaceDetails` to `client/src/api.js`

Add two new methods to the exported `api` object in `client/src/api.js`, using the existing `request` helper:

```js
searchPlaces: (omId, query) =>
  request(`/api/oms/${omId}/poi/places?q=${encodeURIComponent(query)}`),
getPlaceDetails: (omId, placeId) =>
  request(`/api/oms/${omId}/poi/places/${encodeURIComponent(placeId)}`),
```

Files changed: `client/src/api.js`

### Task 4: Create `client/src/components/inputs/PlacesAutocomplete.jsx`

New component. Full spec:

**Props:**
- `value` (string) — the current address string; controls the input
- `onChange(addressString)` — called on every keystroke (same interface as `<input onChange>`)
- `onPlaceSelect({ name, formattedAddress, lat, lng })` — called when user picks a suggestion
- `omId` (string) — needed for the API calls
- `placeholder` (string, optional)

**Behavior:**
1. Renders a `<div>` wrapper (position:relative) containing a plain `<input type="text">` styled like the other inputs in the form (no custom CSS class needed — just `type="text"` which the global styles already cover).
2. On every `onChange` keystroke:
   - Calls `props.onChange(e.target.value)` immediately (so the parent's address value stays in sync)
   - If `value.length >= 3`, schedules a debounced fetch (300ms); clears any pending timer first
   - If `value.length < 3`, clears suggestions and any pending timer
3. Debounced fetch: calls `api.searchPlaces(omId, value)`. On success sets `suggestions` state. On 503 status specifically, sets `keyMissing` state to true and never retries. On any other error, clears suggestions silently.
4. Dropdown: when `suggestions.length > 0`, renders an absolutely-positioned `<ul>` below the input. Each `<li>` shows `mainText` in bold and `secondaryText` in muted style. Keyboard: ArrowUp/ArrowDown move `activeIndex`, Enter selects, Escape closes. Mouse click selects.
5. On selection:
   - Sets the input value to `suggestion.description` immediately (calls `props.onChange(suggestion.description)`)
   - Calls `api.getPlaceDetails(omId, placeId)`. On success calls `props.onPlaceSelect(result)`. On failure (null or error) does nothing beyond having already set the address text.
   - Clears the suggestions dropdown
6. Click-outside: attach a `mousedown` listener on `document` in a `useEffect`; if click is outside the wrapper ref, clear suggestions.
7. If `keyMissing` is true: render a `<p className="field-hint">` below the input with text: `Autocomplete unavailable — add GOOGLE_MAPS_API_KEY to server/.env`. Render this once and persistently (not per-query).
8. Error detection for key missing: check if the API response has HTTP status 503. The existing `request` helper throws with the server's error message on non-2xx. To detect 503 specifically, catch the error and check if `err.message` includes `GOOGLE_MAPS_API_KEY`.

**State:** `suggestions` (array), `activeIndex` (number, -1 default), `keyMissing` (bool).

**Inline styles for the dropdown** (no new CSS file):
- `ul`: `position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid var(--border); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.1); list-style:none; margin:4px 0 0; padding:4px 0; z-index:100; max-height:240px; overflow-y:auto;`
- `li`: `padding:8px 12px; cursor:pointer; font-size:13px;` with background `var(--hover-bg)` when active, `#fff` otherwise
- mainText span: `font-weight:600; color:var(--text);`
- secondaryText span: `color:var(--muted); font-size:12px; margin-left:6px;`

Files changed: `client/src/components/inputs/PlacesAutocomplete.jsx` (new file)

### Task 5: Update `DriveTimesSection.jsx` to use `PlacesAutocomplete`

In `client/src/components/sections/DriveTimesSection.jsx`:

1. Import `PlacesAutocomplete` from `'../inputs/PlacesAutocomplete.jsx'`
2. Replace the plain address `<input>` (currently has `value={p.address}`, `onChange`, and `onBlur={handleRecalculate}`) with `<PlacesAutocomplete>`:

```jsx
<PlacesAutocomplete
  omId={omId}
  value={p.address}
  onChange={(val) => update(p.id, 'address', val)}
  onPlaceSelect={(place) => {
    const next = pois.map((poi) =>
      poi.id === p.id
        ? {
            ...poi,
            address: place.formattedAddress,
            name: poi.name?.trim() ? poi.name : place.name,
          }
        : poi
    );
    onChange(next);
    handleRecalculate();
  }}
  placeholder="e.g. 123 Commerce Dr, Springfield, MO"
/>
```

3. Keep the `onBlur={handleRecalculate}` behavior: add `onBlur={handleRecalculate}` as a prop on `PlacesAutocomplete`, which passes it through to the inner `<input>`.

   **Update `PlacesAutocomplete` props** to also accept and forward `onBlur` to the `<input>`. Add `onBlur` to the destructured props and spread it onto the `<input>`.

Files changed: `client/src/components/sections/DriveTimesSection.jsx`, and a minor update to `PlacesAutocomplete.jsx` to accept/forward `onBlur`.
