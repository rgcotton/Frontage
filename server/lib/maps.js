const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const STATICMAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';
const DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

function getApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || null;
}

export function buildAddressString(cover) {
  return [cover.addressLine1, cover.city, cover.state, cover.zip].filter(Boolean).join(', ');
}

export function googleMapsSearchUrl(query) {
  if (!query || !query.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

export async function geocodeAddress(addressString) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('GOOGLE_MAPS_API_KEY is not set. Add it to server/.env and restart the server.');
    err.status = 503;
    throw err;
  }
  if (!addressString || !addressString.trim()) {
    const err = new Error('No address provided to geocode.');
    err.status = 400;
    throw err;
  }

  const url = `${GEOCODE_URL}?address=${encodeURIComponent(addressString)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.results?.length) {
    const err = new Error(`Could not geocode address: ${data.status || 'unknown error'}`);
    err.status = 422;
    throw err;
  }

  const result = data.results[0];
  const components = result.address_components || [];
  const find = (type) => components.find((c) => c.types.includes(type))?.long_name || '';
  const findShort = (type) => components.find((c) => c.types.includes(type))?.short_name || '';
  const streetNumber = find('street_number');
  const route = find('route');

  return {
    formattedAddress: result.formatted_address,
    lat: result.geometry?.location?.lat ?? null,
    lng: result.geometry?.location?.lng ?? null,
    addressLine1: [streetNumber, route].filter(Boolean).join(' '),
    city: find('locality') || find('sublocality') || find('postal_town'),
    state: findShort('administrative_area_level_1'),
    zip: find('postal_code'),
  };
}

export async function fetchStaticMapBuffer(cover, { zoom = 17, size = '640x400' } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const center = cover.lat != null && cover.lng != null ? `${cover.lat},${cover.lng}` : buildAddressString(cover);
  if (!center) return null;

  const params = new URLSearchParams({
    center,
    zoom: String(zoom),
    size,
    scale: '2',
    maptype: 'roadmap',
    markers: `color:0xC9A227|${center}`,
    key: apiKey,
  });

  try {
    const res = await fetch(`${STATICMAP_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function fetchStaticMapDataUri(cover, options) {
  const buf = await fetchStaticMapBuffer(cover, options);
  if (!buf) return null;
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// Street-level view (zoom 17): the property and surrounding streets/buildings.
export async function fetchStreetMapBuffer(cover) {
  return fetchStaticMapBuffer(cover, { zoom: 17 });
}

// Regional overview (zoom 13): broader context for demand drivers and access routes.
export async function fetchRegionalMapBuffer(cover) {
  return fetchStaticMapBuffer(cover, { zoom: 13 });
}

export async function fetchStreetMapDataUri(cover) {
  const buf = await fetchStreetMapBuffer(cover);
  if (!buf) return null;
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export async function fetchRegionalMapDataUri(cover) {
  const buf = await fetchRegionalMapBuffer(cover);
  if (!buf) return null;
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// Drive time in whole minutes from origin to destination, or null if it can't be
// determined for any reason (no key, missing address, unreachable, API error) --
// callers show a blank rather than an error, so failure here must never throw.
export async function fetchDriveTimeMinutes(originAddress, destAddress) {
  const apiKey = getApiKey();
  if (!apiKey || !originAddress?.trim() || !destAddress?.trim()) return null;

  const params = new URLSearchParams({
    origins: originAddress,
    destinations: destAddress,
    mode: 'driving',
    units: 'imperial',
    key: apiKey,
  });

  try {
    const res = await fetch(`${DISTANCE_MATRIX_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const element = data?.rows?.[0]?.elements?.[0];
    if (data.status !== 'OK' || element?.status !== 'OK' || typeof element?.duration?.value !== 'number') return null;
    return Math.round(element.duration.value / 60);
  } catch {
    return null;
  }
}

// Recalculates every POI's drive time from the given property address, in
// parallel. A POI that can't be resolved gets driveTimeMinutes: null (never an
// error), so the UI shows a blank for that one row instead of breaking the rest.
export async function recalculateDriveTimes(originAddress, pois) {
  return Promise.all(
    pois.map(async (poi) => ({
      ...poi,
      driveTimeMinutes: await fetchDriveTimeMinutes(originAddress, poi.address),
    }))
  );
}

// Search for places using Google Places Autocomplete API.
// Returns an empty array if the API key is not set, if the API responds with
// zero predictions, if the status is not OK, or if any error occurs.
// Never throws.
export async function searchPlaces(query) {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  if (!query || !query.trim()) return [];

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query.trim())}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'OK' || !data.predictions?.length) return [];

    return data.predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || '',
      secondaryText: prediction.structured_formatting?.secondary_text || '',
    }));
  } catch {
    return [];
  }
}

// Get details for a specific place using Google Places Details API.
// Returns null if the API key is not set, if the API returns an error,
// if the result is missing, or if any error occurs. Never throws.
export async function getPlaceDetails(placeId) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  if (!placeId || !placeId.trim()) return null;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId.trim())}&fields=name,formatted_address,geometry&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.result) return null;

    const result = data.result;
    return {
      name: result.name || null,
      formattedAddress: result.formatted_address || null,
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
    };
  } catch {
    return null;
  }
}
