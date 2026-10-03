import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { CeldasPorCoordenada } from '../types'
import { db } from './firebase'
import { esCoordenadaValida } from './coordenadas'

interface EstadoCeldas {
  celdas: CeldasPorCoordenada
  cargando: boolean
  error: Error | null
}

/** Escucha la colección `celdas` en tiempo real. Una celda sin documento está disponible. */
export function useCeldas(): EstadoCeldas {
  const [estado, setEstado] = useState<EstadoCeldas>({ celdas: {}, cargando: true, error: null })

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'celdas'),
        (instantanea) => {
          const celdas: CeldasPorCoordenada = {}
          instantanea.forEach((documento) => {
            const { estado: estadoCelda, nombre } = documento.data()
            if (esCoordenadaValida(documento.id) && estadoCelda === 'apadrinada' && typeof nombre === 'string') {
              celdas[documento.id] = { estado: 'apadrinada', nombre }
            }
          })
          setEstado({ celdas, cargando: false, error: null })
        },
        (error) => setEstado({ celdas: {}, cargando: false, error }),
      ),
    [],
  )

  return estado
}
