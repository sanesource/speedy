const STORAGE_KEY = "speedrace-session";

export function saveSession(data) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(STORAGE_KEY);
}
