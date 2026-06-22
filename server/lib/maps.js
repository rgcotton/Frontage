const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const STATICMAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';

function getApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || null;
}

export function buildAddressString(cover) {
  return [cover.addressLine1, cover.city, cover.state, cover.zip].filter(Boolean).join(', ');
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

export async function fetchStaticMapBuffer(cover) {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const center = cover.lat != null && cover.lng != null ? `${cover.lat},${cover.lng}` : buildAddressString(cover);
  if (!center) return null;

  const params = new URLSearchParams({
    center,
    zoom: '14',
    size: '640x400',
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

export async function fetchStaticMapDataUri(cover) {
  const buf = await fetchStaticMapBuffer(cover);
  if (!buf) return null;
  return `data:image/png;base64,${buf.toString('base64')}`;
}
