const KEY = 'campusai_token';
const ROLE_KEY = 'campusai_role';

export function setAuth({ token, role }) {
  localStorage.setItem(KEY, token);
  if (role) localStorage.setItem(ROLE_KEY, role);
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
  return Boolean(getToken());
}

