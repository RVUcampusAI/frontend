const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export async function apiGet(path, { token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiPost(path, body, { token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiPut(path, body, { token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body || {}),
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiPatch(path, body, { token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body || {}),
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}

export async function apiDelete(path, { token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers,
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return unwrap(data);
}
