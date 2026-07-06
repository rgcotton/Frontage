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

