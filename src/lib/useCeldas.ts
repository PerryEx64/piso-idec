import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { CeldasPorCoordenada } from '../types'
import { db } from './firebase'
import { esCoordenadaValida } from './coordenadas'
import { CUARTOS_POR_METRO } from './cuartos'

interface EstadoCeldas {
  celdas: CeldasPorCoordenada
  cargando: boolean
  error: Error | null
}

/** Lee los cuartos de un documento. Acepta el formato anterior ({ estado, nombre }) como un metro completo. */
function leerCuartos({ cuartos, estado, nombre }: DocumentData): string[] | null {
  if (Array.isArray(cuartos) && cuartos.length === CUARTOS_POR_METRO && cuartos.every((c) => typeof c === 'string')) {
    return cuartos.some(Boolean) ? cuartos : null
  }
  if (estado === 'apadrinada' && typeof nombre === 'string' && nombre) return [nombre, nombre, nombre, nombre]
  return null
}

/** Escucha la colección `celdas` en tiempo real. Una celda sin documento está libre. */
export function useCeldas(): EstadoCeldas {
  const [estado, setEstado] = useState<EstadoCeldas>({ celdas: {}, cargando: true, error: null })

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'celdas'),
        (instantanea) => {
          const celdas: CeldasPorCoordenada = {}
          instantanea.forEach((documento) => {
            const cuartos = esCoordenadaValida(documento.id) ? leerCuartos(documento.data()) : null
            if (cuartos) celdas[documento.id] = { cuartos }
          })
          setEstado({ celdas, cargando: false, error: null })
        },
        (error) => setEstado({ celdas: {}, cargando: false, error }),
      ),
    [],
  )

  return estado
}
