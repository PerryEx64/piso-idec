import { PRECIO_METRO_QUETZALES } from '../config'
import { CUARTOS_POR_METRO } from './cuartos'

/** 330 → "Q330", 105600 → "Q105,600", 82.5 → "Q82.50". */
export function formatearQuetzales(monto: number) {
  const decimales = Number.isInteger(monto) ? 0 : 2
  return `Q${monto.toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`
}

/** Valor en quetzales de una cantidad de cuartos de metro. */
export const quetzalesDeCuartos = (cuartos: number) => (cuartos * PRECIO_METRO_QUETZALES) / CUARTOS_POR_METRO
