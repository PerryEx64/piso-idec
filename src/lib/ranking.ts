import type { CeldasPorCoordenada } from '../types'
import { normalizar } from './cuartos'
import { ordenarCoordenadas } from './coordenadas'

export interface Apadrinador {
  clave: string
  nombre: string
  cuartos: number
  /** Posición con empates: quienes tienen lo mismo comparten lugar. */
  posicion: number
}

const NOMBRES_ANONIMOS = new Set(['anonimo', 'anonima'])

/** Suma los cuartos de metro por persona. Los anónimos no se agrupan: no son una sola persona. */
export function calcularRanking(celdas: CeldasPorCoordenada): Apadrinador[] {
  const porPersona = new Map<string, { nombre: string; cuartos: number }>()

  for (const coordenada of ordenarCoordenadas(Object.keys(celdas))) {
    for (const cuarto of celdas[coordenada].cuartos) {
      const nombre = cuarto.replace(/\s+/g, ' ').trim()
      if (!nombre) continue
      const clave = normalizar(nombre)
      if (NOMBRES_ANONIMOS.has(clave)) continue
      const actual = porPersona.get(clave)
      if (actual) actual.cuartos += 1
      else porPersona.set(clave, { nombre, cuartos: 1 })
    }
  }

  const ordenados = [...porPersona.entries()]
    .map(([clave, { nombre, cuartos }]) => ({ clave, nombre, cuartos }))
    .sort((a, b) => b.cuartos - a.cuartos || a.nombre.localeCompare(b.nombre, 'es'))

  return ordenados.map((persona) => ({
    ...persona,
    posicion: ordenados.findIndex((otra) => otra.cuartos === persona.cuartos) + 1,
  }))
}
