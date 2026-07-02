const STORAGE_KEY = 'frontage_user';

export function getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

const ACCESS_CODE_KEY = 'frontage_access_code';

export function getAccessCode() {
  try {
    return localStorage.getItem(ACCESS_CODE_KEY) || null;
  } catch {
    return null;
  }
}

export function saveAccessCode(code) {
  localStorage.setItem(ACCESS_CODE_KEY, code);
  return code;
}
