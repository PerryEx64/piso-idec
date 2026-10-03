import { COLUMNAS, FILAS } from '../config'

export const LETRAS = Array.from({ length: COLUMNAS }, (_, i) => String.fromCharCode(65 + i))
export const NUMEROS = Array.from({ length: FILAS }, (_, i) => i + 1)

export const coordenada = (letra: string, numero: number) => `${letra}${numero}`
