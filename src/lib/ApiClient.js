
import axios from "axios";
import { getToken, isSessionExpired, handleAuthFailure } from "./Session";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});

const randomReqId = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(2);
      crypto.getRandomValues(buf);
      return `req_${buf[0].toString(16)}${buf[1].toString(16)}`;
    }
  } catch {}
  return `req_${Math.random().toString(16).slice(2)}`;
};

const isAuthEndpoint = (url) => {
  const u = String(url || "");
  return u.includes("/auth/login") || u.includes("/auth/register");
};

api.interceptors.request.use((config) => {
  config.metadata = { start: Date.now() };
  config.headers = config.headers || {};
  config.headers["X-Request-Id"] =
    config.headers["X-Request-Id"] || randomReqId();

  const url = String(config.url || "");
  const auth = isAuthEndpoint(url);

  if (typeof window !== "undefined") {
    if (!auth && isSessionExpired()) {
      handleAuthFailure("session");
      return Promise.reject(new axios.CanceledError("SESSION_EXPIRED"));
    }

    const token = getToken();
    if (token && !auth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const cfg = error?.config || {};
    const url = String(cfg.url || "");
    const status = error?.response?.status;

    if (!isAuthEndpoint(url) && (status === 401 || status === 403)) {
      handleAuthFailure("session");
    }

    return Promise.reject(error);
  }
);
