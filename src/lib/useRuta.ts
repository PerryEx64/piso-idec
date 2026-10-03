import { useSyncExternalStore } from 'react'

export type Ruta = 'publica' | 'admin' | 'ranking'

const suscribir = (alCambiar: () => void) => {
  window.addEventListener('hashchange', alCambiar)
  return () => window.removeEventListener('hashchange', alCambiar)
}

const leerHash = () => window.location.hash

/** Rutas por hash (`#/admin`) para no depender de reglas de reescritura en el hosting. */
export function useRuta(): Ruta {
  const hash = useSyncExternalStore(suscribir, leerHash)
  if (hash.startsWith('#/admin')) return 'admin'
  if (hash.startsWith('#/ranking')) return 'ranking'
  return 'publica'
}
