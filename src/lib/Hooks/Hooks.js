import useSWR from 'swr'

const fetcher = url => fetch(url).then(res => {
  if (!res.ok) throw new Error('Error al cargar ciudades')
  return res.json()
})

export function useCiudades() {
  // NEXT_PUBLIC_API_URL se inyecta vía .env.development o .env.production
  const apiBase = process.env.NEXT_PUBLIC_API_URL

  // Si no existe la variable, SWR no hace la petición
  const { data, error } = useSWR(
    apiBase ? `${apiBase}/client/cities` : null,
    fetcher
  )

  return {
    ciudades: data || [],            // Array de strings
    isLoading: !error && !data,       // true mientras carga
    isError: !!error                  // true si hubo error
  }
}
