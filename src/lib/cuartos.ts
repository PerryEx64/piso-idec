import type { Celda, CeldasPorCoordenada } from '../types'

export const CUARTOS_POR_METRO = 4
const FRACCIONES = ['', '¼', '½', '¾']

/** Misma persona aunque cambien mayúsculas, acentos o espacios: "María  López" = "maria lopez". */
export const normalizar = (nombre: string) =>
  nombre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

export const cuartosOcupados = (celda?: Celda) => (celda ? celda.cuartos.filter(Boolean).length : 0)
export const cuartosLibres = (celda?: Celda) => CUARTOS_POR_METRO - cuartosOcupados(celda)
export const tieneAportes = (celda?: Celda) => cuartosOcupados(celda) > 0
export const estaCompleta = (celda?: Celda) => cuartosOcupados(celda) === CUARTOS_POR_METRO

export const totalCuartos = (celdas: CeldasPorCoordenada) =>
  Object.values(celdas).reduce((suma, celda) => suma + cuartosOcupados(celda), 0)

export interface Aporte {
  clave: string
  nombre: string
  cuartos: number
}

/** Aportes de una celda agrupados por persona, en el orden en que aparecen. */
export function aportesDe(celda?: Celda): Aporte[] {
  const porPersona = new Map<string, Aporte>()
  for (const nombre of celda?.cuartos ?? []) {
    if (!nombre) continue
    const clave = normalizar(nombre)
    const actual = porPersona.get(clave)
    if (actual) actual.cuartos += 1
    else porPersona.set(clave, { clave, nombre, cuartos: 1 })
  }
  return [...porPersona.values()]
}

/** Llena los primeros cuartos libres con `nombre`. Devuelve null si no hay espacio suficiente. */
export function agregarAporte(celda: Celda | undefined, nombre: string, cuartos: number) {
  const siguientes = celda ? [...celda.cuartos] : Array<string>(CUARTOS_POR_METRO).fill('')
  let pendientes = cuartos
  for (let i = 0; i < siguientes.length && pendientes > 0; i++) {
    if (siguientes[i] === '') {
      siguientes[i] = nombre
      pendientes -= 1
    }
  }
  return pendientes === 0 ? siguientes : null
}

/** Libera todos los cuartos de esa persona en la celda. */
export function quitarAporte(celda: Celda, nombre: string) {
  const clave = normalizar(nombre)
  return celda.cuartos.map((cuarto) => (cuarto && normalizar(cuarto) === clave ? '' : cuarto))
}

/** 10 → "2 ½", 1 → "¼", 0 → "0". */
export function cantidadEnMetros(cuartos: number) {
  const enteros = Math.floor(cuartos / CUARTOS_POR_METRO)
  const resto = cuartos % CUARTOS_POR_METRO
  if (enteros === 0) return resto === 0 ? '0' : FRACCIONES[resto]
  return resto === 0 ? `${enteros}` : `${enteros} ${FRACCIONES[resto]}`
}

/** 4 → "1 metro", 2 → "½ metro", 1 → "¼ de metro", 10 → "2 ½ metros". */
export function etiquetaMetros(cuartos: number) {
  if (cuartos === CUARTOS_POR_METRO) return '1 metro'
  if (cuartos === 2) return '½ metro'
  if (cuartos < CUARTOS_POR_METRO) return `${cantidadEnMetros(cuartos)} de metro`
  return `${cantidadEnMetros(cuartos)} metros`
}
