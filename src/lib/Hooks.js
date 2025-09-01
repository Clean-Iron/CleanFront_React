import useSWR from 'swr'
import { useMemo } from 'react'

const fetcher = url => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al cargar ciudades')
  return res.json()
})

export function useCiudades() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL

  // Si no existe la variable, SWR no hace la petición
  const { data, error } = useSWR(
    apiBase ? `${apiBase}/address/cities` : null,
    fetcher
  )

  return {
    ciudades: data || [],            // Array de strings
    isLoading: !error && !data,       // true mientras carga
    isError: !!error                  // true si hubo error
  }
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