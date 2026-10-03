import { useState } from 'react'
import { COLUMNAS } from '../config'
import { LETRAS, NUMEROS, coordenada } from '../lib/coordenadas'
import type { CeldasPorCoordenada } from '../types'
import { Celda } from './Celda'

interface CuadriculaProps {
  celdas: CeldasPorCoordenada
  seleccionadas?: ReadonlySet<string>
  onSeleccionar?: (coordenada: string) => void
}

const FILAS_CON_TARJETA_ABAJO = 2

export function Cuadricula({ celdas, seleccionadas, onSeleccionar }: CuadriculaProps) {
  const [activa, setActiva] = useState<string | null>(null)

  const alHacerClick = (coord: string) => {
    if (onSeleccionar) onSeleccionar(coord)
    else setActiva(coord)
  }

  return (
    <div
      className="grid w-full gap-1.5 sm:gap-2"
      style={{ gridTemplateColumns: `1.5rem repeat(${COLUMNAS}, minmax(0, 1fr))` }}
    >
      <span />
      {LETRAS.map((letra) => (
        <span key={letra} className="text-center text-sm font-semibold text-oro-400">
          {letra}
        </span>
      ))}

      {NUMEROS.map((numero) => (
        <FilaCeldas
          key={numero}
          numero={numero}
          celdas={celdas}
          seleccionadas={seleccionadas}
          activa={activa}
          onActivar={setActiva}
          onClick={alHacerClick}
        />
      ))}
    </div>
  )
}

interface FilaCeldasProps {
  numero: number
  celdas: CeldasPorCoordenada
  seleccionadas?: ReadonlySet<string>
  activa: string | null
  onActivar: (coordenada: string | null) => void
  onClick: (coordenada: string) => void
}

function FilaCeldas({ numero, celdas, seleccionadas, activa, onActivar, onClick }: FilaCeldasProps) {
  return (
    <>
      <span className="flex items-center justify-center text-sm font-semibold text-oro-400">{numero}</span>
      {LETRAS.map((letra) => {
        const coord = coordenada(letra, numero)
        return (
          <Celda
            key={coord}
            coordenada={coord}
            datos={celdas[coord]}
            seleccionada={seleccionadas?.has(coord) ?? false}
            activa={activa === coord}
            tarjetaAbajo={numero <= FILAS_CON_TARJETA_ABAJO}
            onActivar={onActivar}
            onClick={onClick}
          />
        )
      })}
    </>
  )
}
