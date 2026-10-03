export type EstadoCelda = 'disponible' | 'apadrinada'

export interface Celda {
  estado: EstadoCelda
  nombre?: string
}

export type CeldasPorCoordenada = Record<string, Celda>
