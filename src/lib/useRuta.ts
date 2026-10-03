import { useSyncExternalStore } from 'react'

export type Ruta = 'publica' | 'admin'

const suscribir = (alCambiar: () => void) => {
  window.addEventListener('hashchange', alCambiar)
  return () => window.removeEventListener('hashchange', alCambiar)
}

const leerHash = () => window.location.hash

/** Rutas por hash (`#/admin`) para no depender de reglas de reescritura en el hosting. */
export function useRuta(): Ruta {
  return useSyncExternalStore(suscribir, leerHash).startsWith('#/admin') ? 'admin' : 'publica'
}
