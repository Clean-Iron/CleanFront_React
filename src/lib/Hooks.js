'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken') ||
    ''
  );
};

const fetcherAuth = async (url) => {
  const token = getToken();

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`Error al cargar datos (${res.status}) ${text}`);

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

/** =========================
 *  Hooks existentes (los tuyos)
 *  ========================= */

export function useCiudades() {
  const { data, error } = useSWR(
    API_BASE_URL ? `${API_BASE_URL}/address/cities` : null,
    fetcherAuth
  );

  return {
    ciudades: data || [],
    isLoading: !error && !data,
    isError: !!error,
  };
}

export function useServiceStates() {
  const { data, error } = useSWR(
    API_BASE_URL ? `${API_BASE_URL}/schedule/servicesStates` : null,
    fetcherAuth
  );

  return {
    serviceStates: data || [],
    isLoading: !error && !data,
    isError: !!error,
  };
}

export function useContractTypes() {
  const { data, error } = useSWR(
    API_BASE_URL ? `${API_BASE_URL}/employee/contractTypes` : null,
    fetcherAuth
  );

  return {
    contractTypes: data || [],
    isLoading: !error && !data,
    isError: !!error,
  };
}

export function useTimeOptions({ startHour = 0, endHour = 24, stepMinutes = 30 } = {}) {
  return useMemo(() => {
    const opts = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
        const date = new Date();
        date.setHours(h, m);
        const label = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        opts.push({ value, label });
      }
    }
    return opts;
  }, [startHour, endHour, stepMinutes]);
}

export function useLoadingOverlay(defaultText = 'Cargando…') {
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

/** =========================
 *  NUEVOS HOOKS para Reasignar Servicios
 *  ========================= */

const normalizeArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.result)) return payload.result;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
};

// Empleados: asume /employee devuelve array (con document, completeName, etc.)
export const useEmployees = () => {
  const key = API_BASE_URL ? `${API_BASE_URL}/employee` : null;

  const swr = useSWR(key, fetcherAuth, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const employees = normalizeArrayPayload(swr.data);

  return {
    employees,
    isLoading: swr.isLoading,
    isError: !!swr.error,
    error: swr.error,
    mutate: swr.mutate,
  };
};

// Servicios del empleado por mes: /schedule/servicesEmployee/{doc}?year=YYYY&month=M
export const useEmployeeMonthServices = (employeeDoc, year, month) => {
  const doc = String(employeeDoc || '').trim();
  const y = String(year ?? '').trim();
  const m = String(month ?? '').trim();

  const key =
    doc && y && m
      ? `${API_BASE_URL}/schedule/servicesEmployee/${encodeURIComponent(doc)}?year=${encodeURIComponent(
          y
        )}&month=${encodeURIComponent(m)}`
      : null;

  const swr = useSWR(key, fetcherAuth, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const services = normalizeArrayPayload(swr.data); // aquí ya es List<ScheduleDetailGroupedDto>

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
