import { collection, deleteDoc, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import type { CeldasPorCoordenada } from '../types'
import { agregarAporte, quitarAporte } from './cuartos'
import { FONDO_COMUN_NOMBRE, NOTA_APORTE_DIRECTO, centavosDeCuartos } from './excedentes'
import { db } from './firebase'

const referencia = (coordenada: string) => doc(db, 'celdas', coordenada)

const movimiento = (nombre: string, centavos: number, tipo: 'excedente' | 'uso', nota: string, origen?: 'casillas' | 'directo') => ({
  nombre,
  centavos,
  tipo,
  nota,
  ...(origen && { origen }),
  fecha: serverTimestamp(),
})

const pago = (nombre: string, centavos: number, nota: string) => ({ nombre, centavos, nota, fecha: serverTimestamp() })

/**
 * Agrega `cuartos` de metro a nombre de `nombre` en cada celda, usando los primeros cuartos libres.
 * Si se indica el dinero recibido, se registra el pago y lo que sobre pasa al fondo común a nombre de la persona,
 * todo en la misma operación.
 */
export async function apadrinarCeldas(
  celdas: CeldasPorCoordenada,
  coordenadas: string[],
  nombre: string,
  cuartos: number,
  recibidoCentavos = 0,
) {
  const lote = writeBatch(db)
  for (const coordenada of coordenadas) {
    const siguientes = agregarAporte(celdas[coordenada], nombre, cuartos)
    if (!siguientes) throw new Error(`No hay espacio suficiente en ${coordenada}`)
    lote.set(referencia(coordenada), { cuartos: siguientes, fecha: serverTimestamp() })
  }
  if (recibidoCentavos > 0) {
    const lugares = coordenadas.join(', ')
    lote.set(doc(collection(db, 'pagos')), pago(nombre, recibidoCentavos, `Recibido al apadrinar ${lugares}`))
    const sobrante = recibidoCentavos - centavosDeCuartos(cuartos * coordenadas.length)
    if (sobrante > 0) lote.set(doc(collection(db, 'excedentes')), movimiento(nombre, sobrante, 'excedente', `Sobrante de ${lugares}`, 'casillas'))
  }
  await lote.commit()
}

/**
 * Registra dinero que una persona ya entregó por casillas que se le habían asignado antes de anotar el monto.
 * Si con esto supera lo que cuestan todos sus metros, el sobrante nuevo pasa al fondo a su nombre.
 */
export async function registrarPagoDePersona(nombre: string, centavos: number, sobranteNuevoCentavos: number) {
  const lote = writeBatch(db)
  lote.set(doc(collection(db, 'pagos')), pago(nombre, centavos, 'Registrado después de apadrinar'))
  if (sobranteNuevoCentavos > 0) {
    lote.set(doc(collection(db, 'excedentes')), movimiento(nombre, sobranteNuevoCentavos, 'excedente', 'Sobrante registrado después', 'casillas'))
  }
  await lote.commit()
}

export const eliminarPago = (id: string) => deleteDoc(doc(db, 'pagos', id))

/** Paga cuartos de metro con el fondo común: llena las celdas a nombre del fondo y descuenta el saldo. */
export async function usarFondoEnCeldas(celdas: CeldasPorCoordenada, coordenadas: string[], cuartos: number) {
  const lote = writeBatch(db)
  for (const coordenada of coordenadas) {
    const siguientes = agregarAporte(celdas[coordenada], FONDO_COMUN_NOMBRE, cuartos)
    if (!siguientes) throw new Error(`No hay espacio suficiente en ${coordenada}`)
    lote.set(referencia(coordenada), { cuartos: siguientes, fecha: serverTimestamp() })
  }
  const costo = centavosDeCuartos(cuartos * coordenadas.length)
  lote.set(doc(collection(db, 'excedentes')), movimiento(FONDO_COMUN_NOMBRE, -costo, 'uso', `Pagó ${coordenadas.join(', ')}`))
  await lote.commit()
}

/** Registra dinero que alguien deja directamente al fondo, sin asignar celdas. */
export const agregarAlFondo = (nombre: string, centavos: number, nota = NOTA_APORTE_DIRECTO) =>
  setDoc(doc(collection(db, 'excedentes')), movimiento(nombre, centavos, 'excedente', nota, 'directo'))

export const eliminarMovimiento = (id: string) => deleteDoc(doc(db, 'excedentes', id))

/** Libera los cuartos de esa persona en la celda; si queda vacía, se borra el documento. */
export async function quitarAporteDeCelda(celdas: CeldasPorCoordenada, coordenada: string, nombre: string) {
  const siguientes = quitarAporte(celdas[coordenada], nombre)
  if (siguientes.some(Boolean)) await setDoc(referencia(coordenada), { cuartos: siguientes, fecha: serverTimestamp() })
  else await deleteDoc(referencia(coordenada))
}
