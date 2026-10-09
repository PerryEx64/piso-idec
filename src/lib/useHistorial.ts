import { collection, onSnapshot, orderBy, query, type DocumentData } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { db } from './firebase'

const REINTENTOS_AUTOMATICOS = 2
const ESPERA_REINTENTO_MS = 1500

interface EstadoHistorial<T> {
  items: T[]
  cargando: boolean
  error: Error | null
}

/** Escucha una colección ordenada por `fecha` (la más reciente primero). `leer` debe ser una función estable. */
export function useHistorial<T>(coleccion: string, leer: (id: string, datos: DocumentData) => T) {
  const [estado, setEstado] = useState<EstadoHistorial<T>>({ items: [], cargando: true, error: null })
  const [intento, setIntento] = useState(0)
  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  useEffect(() => {
    let reintento = 0
    const cancelar = onSnapshot(
      query(collection(db, coleccion), orderBy('fecha', 'desc')),
      (instantanea) => {
        const items = instantanea.docs.map((documento) => leer(documento.id, documento.data({ serverTimestamps: 'estimate' })))
        setEstado({ items, cargando: false, error: null })
      },
      (error) => {
        setEstado({ items: [], cargando: false, error })
        // Un permiso que aún no se propagó (por ejemplo, justo al activar un administrador) se resuelve reintentando.
        if (intento < REINTENTOS_AUTOMATICOS) reintento = window.setTimeout(reintentar, ESPERA_REINTENTO_MS)
      },
    )
    return () => {
      window.clearTimeout(reintento)
      cancelar()
    }
  }, [coleccion, leer, intento, reintentar])

  return { ...estado, reintentar }
}
