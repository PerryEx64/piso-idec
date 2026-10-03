import { deleteDoc, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import type { CeldasPorCoordenada } from '../types'
import { agregarAporte, quitarAporte } from './cuartos'
import { db } from './firebase'

const referencia = (coordenada: string) => doc(db, 'celdas', coordenada)

/** Agrega `cuartos` de metro a nombre de `nombre` en cada celda, usando los primeros cuartos libres. */
export async function apadrinarCeldas(celdas: CeldasPorCoordenada, coordenadas: string[], nombre: string, cuartos: number) {
  const lote = writeBatch(db)
  for (const coordenada of coordenadas) {
    const siguientes = agregarAporte(celdas[coordenada], nombre, cuartos)
    if (!siguientes) throw new Error(`No hay espacio suficiente en ${coordenada}`)
    lote.set(referencia(coordenada), { cuartos: siguientes, fecha: serverTimestamp() })
  }
  await lote.commit()
}

/** Libera los cuartos de esa persona en la celda; si queda vacía, se borra el documento. */
export async function quitarAporteDeCelda(celdas: CeldasPorCoordenada, coordenada: string, nombre: string) {
  const siguientes = quitarAporte(celdas[coordenada], nombre)
  if (siguientes.some(Boolean)) await setDoc(referencia(coordenada), { cuartos: siguientes, fecha: serverTimestamp() })
  else await deleteDoc(referencia(coordenada))
}
