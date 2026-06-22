async function request(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listOms: () => request('/api/oms'),
  createOm: () => request('/api/oms', { method: 'POST' }),
  getOm: (id) => request(`/api/oms/${id}`),
  updateOm: (id, partial) =>
    request(`/api/oms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    }),
  deleteOm: (id) => request(`/api/oms/${id}`, { method: 'DELETE' }),
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
  geocodeAddress: (id) => request(`/api/oms/${id}/geocode`, { method: 'POST' }),
};
