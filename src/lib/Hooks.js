"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "./ApiClient";
import { fetcherAuth } from "./SwrFetchers";
import { isSessionInvalid, handleAuthFailure } from "./Session";

// =========================
// Utils
// =========================
const normalizeArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.result)) return payload.result;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
};

const defaultSWR = {
  revalidateOnFocus: false,
  keepPreviousData: true,
  shouldRetryOnError: (err) => {
    const status = err?.response?.status;
    return !(status === 401 || status === 403);
  },
};

// =========================
// Guard global de sesión (redirect)
// =========================
function useAuthRedirectGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSessionInvalid()) {
      handleAuthFailure("session");
    }
  }, []);
}

function useSWRAuth(key, fetcher, options) {
  useAuthRedirectGuard();

  const swr = useSWR(key, fetcher, options);

  useEffect(() => {
    const status = swr?.error?.response?.status;
    if (status === 401 || status === 403) {
      handleAuthFailure("session");
    }
  }, [swr?.error]);

  return swr;
}

export function useCiudades() {
  const key = API_BASE_URL ? `${API_BASE_URL}/city/allowed` : null;

  const { data, error, isLoading } = useSWRAuth(key, fetcherAuth, defaultSWR);

  return {
    ciudades: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useServiceStates() {
  const key = API_BASE_URL ? `${API_BASE_URL}/schedule/servicesStates` : null;

  const { data, error, isLoading } = useSWRAuth(key, fetcherAuth, defaultSWR);

  return {
    serviceStates: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useContractTypes() {
  const key = API_BASE_URL ? `${API_BASE_URL}/employee/contractTypes` : null;

  const { data, error, isLoading } = useSWRAuth(key, fetcherAuth, defaultSWR);

  return {
    contractTypes: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useTimeOptions({ startHour = 0, endHour = 24, stepMinutes = 30 } = {}) {
  return useMemo(() => {
    const opts = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
        const date = new Date();
        date.setHours(h, m);
        const label = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        opts.push({ value, label });
      }
    }
    return opts;
  }, [startHour, endHour, stepMinutes]);
}

export function useLoadingOverlay(defaultText = "Cargando…") {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);

  const show = (msg) => {
    setText(msg || defaultText);
    setOpen(true);
  };
  const hide = () => setOpen(false);

  const nextFrames = (n = 2) =>
    new Promise((resolve) => {
      const step = (i) => (i <= 0 ? resolve() : requestAnimationFrame(() => step(i - 1)));
      requestAnimationFrame(() => step(n - 1));
    });

  const withLoading = async (fn, msg) => {
    show(msg);
    await nextFrames(2);
    try {
      return await fn();
    } finally {
      hide();
    }
  };

  const OverlayPortal = open
    ? createPortal(
        <div className="loading-overlay" role="alert" aria-live="polite">
          <div className="loading-overlay__backdrop" />
          <div className="loading-overlay__box">
            <span className="loading-spinner" aria-hidden="true" />
            <span>{text}</span>
          </div>
        </div>,
        document.body
      )
    : null;

  return { isLoading: open, show, hide, withLoading, OverlayPortal };
}

export const useEmployees = () => {
  const key = API_BASE_URL ? `${API_BASE_URL}/employee` : null;

  const swr = useSWRAuth(key, fetcherAuth, defaultSWR);
  const employees = normalizeArrayPayload(swr.data);

  return {
    employees,
    isLoading: swr.isLoading,
    isError: !!swr.error,
    error: swr.error,
    mutate: swr.mutate,
  };
};

export const useEmployeeMonthServices = (employeeDoc, year, month) => {
  const doc = String(employeeDoc || "").trim();
  const y = String(year ?? "").trim();
  const m = String(month ?? "").trim();

  const key =
    doc && y && m
      ? `${API_BASE_URL}/schedule/servicesEmployee/${encodeURIComponent(doc)}?year=${encodeURIComponent(
          y
        )}&month=${encodeURIComponent(m)}`
      : null;

  const swr = useSWRAuth(key, fetcherAuth, defaultSWR);
  const services = normalizeArrayPayload(swr.data);

  return {
    services,
    isLoading: swr.isLoading,
    isError: !!swr.error,
    error: swr.error,
    mutate: swr.mutate,
    key,
    raw: swr.data,
  };
};
