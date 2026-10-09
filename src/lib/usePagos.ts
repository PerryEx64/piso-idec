import type { DocumentData } from 'firebase/firestore'
import type { Pago } from './excedentes'
import { useHistorial } from './useHistorial'

function leerPago(id: string, datos: DocumentData): Pago {
  return {
    id,
    nombre: String(datos.nombre ?? ''),
    centavos: Number(datos.centavos ?? 0),
    nota: String(datos.nota ?? ''),
    fecha: datos.fecha?.toDate?.() ?? null,
  }
}

/** Dinero recibido de cada persona, del más reciente al más antiguo. Solo lo pueden leer los administradores. */
export function usePagos() {
  const { items, cargando, error, reintentar } = useHistorial('pagos', leerPago)
  return { pagos: items, cargando, error, reintentar }
}
