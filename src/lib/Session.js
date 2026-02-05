const TOKEN_KEYS = ["token", "access_token", "authToken"];
const EXPIRES_KEY = "expiresAt";
const USER_KEY = "authUser";

let redirecting = false;

export const getToken = () => {
  if (typeof window === "undefined") return "";
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return "";
};

const parseExpiresAtMs = (raw) => {
  if (!raw) return null;

  // epoch ms
  const n = Number(raw);
  if (!Number.isNaN(n) && n > 0) return n;

  // ISO
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : t;
};

const getJwtExpMs = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadB64 + "=".repeat((4 - (payloadB64.length % 4)) % 4);

    const json = atob(padded);
    const payload = JSON.parse(json);

    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const isSessionExpired = () => {
  if (typeof window === "undefined") return false;

  const raw = localStorage.getItem(EXPIRES_KEY);
  const expMs = parseExpiresAtMs(raw);
  if (expMs && Date.now() >= expMs) return true;

  const token = getToken();
  if (token) {
    const jwtExp = getJwtExpMs(token);
    if (jwtExp) return Date.now() >= jwtExp;
  }

  return false;
};

export const isSessionInvalid = () => {
  if (typeof window === "undefined") return false;

  const token = getToken();
  if (!token) return true;          
  if (isSessionExpired()) return true;

  return false;
};

export const clearSession = () => {
  try {
    for (const k of TOKEN_KEYS) localStorage.removeItem(k);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
};

export const clearSessionAndRedirectOnce = (reason = "session") => {
  if (typeof window === "undefined") return;
  if (redirecting) return;

  const path = window.location.pathname;
  if (path === "/" || path.startsWith("/auth")) {
    clearSession();
    return;
  }

  redirecting = true;
  clearSession();
  window.location.replace(`/?reason=${encodeURIComponent(reason)}`);
};

export const handleAuthFailure = (reason = "session") => {
  clearSessionAndRedirectOnce(reason);
};
