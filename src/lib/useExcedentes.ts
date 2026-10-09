import type { DocumentData } from 'firebase/firestore'
import { NOTA_APORTE_DIRECTO, type Movimiento } from './excedentes'
import { useHistorial } from './useHistorial'

function leerMovimiento(id: string, datos: DocumentData): Movimiento {
  const nota = String(datos.nota ?? '')
  return {
    id,
    nombre: String(datos.nombre ?? ''),
    centavos: Number(datos.centavos ?? 0),
    tipo: datos.tipo === 'uso' ? 'uso' : 'excedente',
    // Los renglones anteriores a este campo se reconocen por su nota.
    origen: datos.origen === 'directo' || (datos.origen === undefined && nota === NOTA_APORTE_DIRECTO) ? 'directo' : 'casillas',
    nota,
    fecha: datos.fecha?.toDate?.() ?? null,
  }
}

/** Historial del fondo común, del más reciente al más antiguo. Solo lo pueden leer los administradores. */
export function useExcedentes() {
  const { items, cargando, error, reintentar } = useHistorial('excedentes', leerMovimiento)
  return { movimientos: items, cargando, error, reintentar }
}
