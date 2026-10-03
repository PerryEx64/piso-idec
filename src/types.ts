/** Una celda es un metro cuadrado, dividido en cuatro cuartos. */
export interface Celda {
  /** Quién aportó cada cuarto de metro; '' = libre. */
  cuartos: string[]
}

export type CeldasPorCoordenada = Record<string, Celda>

export interface CeldaActiva {
  coordenada: string
  rect: DOMRect
}
