const RAW_BASE = (import.meta.env.VITE_API_URL || '').trim();
/** Dev: empty base + Vite proxy → same-origin `/api`, so Authorization is always sent. Prod: set VITE_API_URL. */
const API_BASE =
  RAW_BASE ||
  (import.meta.env.DEV ? '' : 'http://localhost:5000');

function buildUrl(path) {
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return p;
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  return `${base}${p}`;
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function unwrap(data) {
  if (data && data.success === true && Object.prototype.hasOwnProperty.call(data, 'data')) {
    return { ...data.data, _message: data.message, success: true };
  }
  if (data && data.success === false) {
    const err = new Error(data.message || 'Request failed');
    err.payload = data;
    throw err;
  }
  return data;
}

function authHeader(token) {
  const t = token != null ? String(token).trim() : '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiGet(path, { token } = {}) {
  const res = await fetch(buildUrl(path), {
    headers: { ...authHeader(token) },
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiPost(path, body, { token } = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeader(token) };
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiPut(path, body, { token } = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeader(token) };
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body || {}),
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiPatch(path, body, { token } = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeader(token) };
  const res = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body || {}),
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiDelete(path, { token } = {}) {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}
