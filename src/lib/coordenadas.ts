import { COLUMNAS, FILAS } from '../config'

export const LETRAS = Array.from({ length: FILAS }, (_, i) => String.fromCharCode(65 + i))
export const NUMEROS = Array.from({ length: COLUMNAS }, (_, i) => i + 1)

export const coordenada = (letra: string, numero: number) => `${letra}${numero}`

const COORDENADAS_VALIDAS = new Set(LETRAS.flatMap((letra) => NUMEROS.map((numero) => coordenada(letra, numero))))

export const esCoordenadaValida = (valor: string) => COORDENADAS_VALIDAS.has(valor)

const partes = (valor: string) => ({ letra: valor[0], numero: Number(valor.slice(1)) })

export function ordenarCoordenadas(coordenadas: Iterable<string>) {
  return [...coordenadas].sort((a, b) => {
    const [x, y] = [partes(a), partes(b)]
    return x.letra.localeCompare(y.letra) || x.numero - y.numero
  })
}

/** ["C9", "C10"] → "C9 y C10"; ["A1", "A2", "A3"] → "A1, A2 y A3". */
export function unirCoordenadas(coordenadas: string[]) {
  if (coordenadas.length <= 1) return coordenadas.join('')
  return `${coordenadas.slice(0, -1).join(', ')} y ${coordenadas[coordenadas.length - 1]}`
}
