'use client';

import useSWR from 'swr'
import { useMemo } from 'react'

const API_BASE_URL = /*process.env.NEXT_PUBLIC_API_URL ||*/ 'http://localhost:8080';

const fetcher = url => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al cargar ciudades')
  return res.json()
})

const sanitize = (s) =>
  String(s)
    .replace(/[^\p{L}\p{N}\s_-]/gu, '') // elimina símbolos raros, mantiene letras con tildes
    .replace(/\s+/g, ' ')               // colapsa espacios
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
    isLoading: !!isLoading,
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