const KEY = 'campusai_token';
const ROLE_KEY = 'campusai_role';

export function setAuth({ token, role }) {
  const t = token != null ? String(token).trim() : '';
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
  if (role) localStorage.setItem(ROLE_KEY, String(role).trim());
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getToken() {
  return localStorage.getItem(KEY) || '';
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || '';
}

export function isAuthed() {
  return getToken().length > 0;
}

