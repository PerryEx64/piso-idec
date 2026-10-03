import type { CeldasPorCoordenada } from '../types'
import { ordenarCoordenadas } from './coordenadas'

export interface Apadrinador {
  clave: string
  nombre: string
  metros: number
  /** Posición con empates: quienes tienen los mismos metros comparten lugar. */
  posicion: number
}

const NOMBRES_ANONIMOS = new Set(['anonimo', 'anonima'])

/** Misma persona aunque cambien mayúsculas, acentos o espacios: "María  López" = "maria lopez". */
const normalizar = (nombre: string) =>
  nombre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

/** Cuenta los metros por persona. Los anónimos no se agrupan: no son una sola persona. */
export function calcularRanking(celdas: CeldasPorCoordenada): Apadrinador[] {
  const porPersona = new Map<string, { nombre: string; metros: number }>()

  for (const coordenada of ordenarCoordenadas(Object.keys(celdas))) {
    const nombre = celdas[coordenada].nombre?.replace(/\s+/g, ' ').trim()
    if (!nombre) continue
    const clave = normalizar(nombre)
    if (NOMBRES_ANONIMOS.has(clave)) continue
    const actual = porPersona.get(clave)
    if (actual) actual.metros += 1
    else porPersona.set(clave, { nombre, metros: 1 })
  }

  const ordenados = [...porPersona.entries()]
    .map(([clave, { nombre, metros }]) => ({ clave, nombre, metros }))
    .sort((a, b) => b.metros - a.metros || a.nombre.localeCompare(b.nombre, 'es'))

  return ordenados.map((persona) => ({
    ...persona,
    posicion: ordenados.findIndex((otra) => otra.metros === persona.metros) + 1,
  }))
}
