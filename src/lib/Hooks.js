'use client';

import useSWR from 'swr'
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const fetcher = url => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al cargar ciudades')
  return res.json()
})

const sanitize = (s) =>
  String(s)
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

export function useCiudades() {
  const { data, error } = useSWR(
    API_BASE_URL ? `${API_BASE_URL}/address/cities` : null,
    fetcher
  )

  return {
    ciudades: data || [],
    isLoading: !error && !data,
    isError: !!error
  }
}

export function useServiceStates() {

  const { data, error } = useSWR(
    API_BASE_URL ? `${API_BASE_URL}/schedule/servicesStates` : null,
    fetcher
  );

  return {
    serviceStates: (data || []).map(sanitize),
    isLoading: !error && !data,
    isError: !!error
  };
}

/**
 * Hook que genera un array de { value, label } donde:
 * - value: "HH:mm" (para enviar al backend como LocalTime)
 * - label: "h:mm AM/PM" (o el formato local)
 */
export function useTimeOptions({ startHour = 0, endHour = 24, stepMinutes = 30 } = {}) {
  return useMemo(() => {
    const opts = []
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
        const date = new Date()
        date.setHours(h, m)
        const label = date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit'
        })
        opts.push({ value, label })
      }
    }
    return opts
  }, [startHour, endHour, stepMinutes])
}

/**
 * Hook de carga reutilizable para mostrar un overlay mientras esperas una promesa.
 * Ejemplo:
 *   const { loading, withLoading } = useLoading();
 *   await withLoading(() => asignarServicio(payload));
 *   <LoadingOverlay show={loading} text="Procesando…" />
 */
export function useLoadingOverlay(defaultText = 'Cargando…') {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);

  const show = (msg) => { setText(msg || defaultText); setOpen(true); };
  const hide = () => setOpen(false);

  const nextFrames = (n = 2) =>
    new Promise((resolve) => {
      const step = (i) => (i <= 0 ? resolve() : requestAnimationFrame(() => step(i - 1)));
      requestAnimationFrame(() => step(n - 1));
    });

  /** Envuelve una promesa y muestra/oculta el overlay automáticamente. */
  const withLoading = async (fn, msg) => {
    show(msg);
    await nextFrames(2); // asegura que se pinte antes de la llamada
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