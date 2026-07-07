// Session identity comes from an httpOnly cookie set by POST /api/auth/login.
// The browser sends it automatically on every same-origin request — no manual
// header needed, and no client-side JS can read or forge the token.
async function request(path, options = {}) {
  const res = await fetch(path, { ...options, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listOms: () => request('/api/oms'),
  createOm: (docType = 'om') =>
    request('/api/oms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType }),
    }),
  getOm: (id) => request(`/api/oms/${id}`),
  getSharedOm: (id, token) => request(`/api/oms/${id}/shared${token ? `?token=${encodeURIComponent(token)}` : ''}`),
  getShareInfo: (id) => request(`/api/oms/${id}/share-info`),
  signNda: (id, name) =>
    request(`/api/oms/${id}/nda/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  updateOm: (id, partial) =>
    request(`/api/oms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    }),
  deleteOm: (id) => request(`/api/oms/${id}`, { method: 'DELETE' }),
  duplicateOm: (id) => request(`/api/oms/${id}/duplicate`, { method: 'POST' }),
  autofillOm: (id, sourceId) =>
    request(`/api/oms/${id}/autofill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    }),
  renameOm: (id, propertyName) =>
    request(`/api/oms/${id}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyName }),
    }),
  uploadFiles: async (id, fileList) => {
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append('files', f));
    return request(`/api/oms/${id}/upload`, { method: 'POST', body: formData });
  },
  generate: (id, format) =>
    request(`/api/oms/${id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
    }),
  generateAi: (id, kind, extra = {}) =>
    request(`/api/oms/${id}/ai/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extra),
    }),
  generateAllAi: (id, aiInstructions) =>
    request(`/api/oms/${id}/ai/generate-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiInstructions ? { liveAiInstructions: aiInstructions } : {}),
    }),
  geocodeAddress: (id) => request(`/api/oms/${id}/geocode`, { method: 'POST' }),
  recalculateDriveTimes: (id, pois) =>
    request(`/api/oms/${id}/poi/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pois }),
    }),
  searchPlaces: (omId, query, location) => {
    const params = new URLSearchParams({ q: query });
    if (location?.lat != null && location?.lng != null) {
      params.set('lat', location.lat);
      params.set('lng', location.lng);
    }
    return request(`/api/oms/${omId}/poi/places?${params.toString()}`);
  },
  getPlaceDetails: (omId, placeId) =>
    request(`/api/oms/${omId}/poi/places/${encodeURIComponent(placeId)}`),
  extractFromUpload: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/api/oms/${id}/extract/upload`, { method: 'POST', body: formData });
  },
  extractFromUrl: (id, url) =>
    request(`/api/oms/${id}/extract/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }),
  analyzeLogo: (id) => request(`/api/oms/${id}/ai/analyze-logo`, { method: 'POST' }),
  login: (email) =>
    request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  listUsers: () => request('/api/admin/users'),
  listFolders: () => request('/api/folders'),
  createFolder: (name) =>
    request('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  deleteFolder: (id) => request(`/api/folders/${id}`, { method: 'DELETE' }),
};
