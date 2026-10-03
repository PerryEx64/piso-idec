import { useState } from 'react'
import { Boton } from './Boton'
import { Tarjeta } from './Tarjeta'

interface LiberarCeldaProps {
  coordenada: string
  nombre: string
  liberando: boolean
  onLiberar: () => void
  onCancelar: () => void
}

/** Una casilla ocupada no se puede reasignar: primero hay que liberarla. */
export function LiberarCelda({ coordenada, nombre, liberando, onLiberar, onCancelar }: LiberarCeldaProps) {
  const [confirmando, setConfirmando] = useState(false)

  const liberar = () => {
    if (!confirmando) return setConfirmando(true)
    onLiberar()
  }

  return (
    <Tarjeta>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">{coordenada} ya está ocupada</h2>
          <p className="mt-1 font-bold text-tinta-suave">
            Está apadrinada por <span className="text-tinta">{nombre}</span>. Para asignarla a otra persona o cambiar el nombre,
            primero hay que liberarla.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Boton variante="peligro" disabled={liberando} onClick={liberar}>
            {liberando ? 'Liberando…' : confirmando ? `¿Seguro? Liberar ${coordenada}` : `Liberar ${coordenada}`}
          </Boton>
          <Boton disabled={liberando} onClick={onCancelar}>
            Cancelar
          </Boton>
        </div>
      </div>
    </Tarjeta>
  )
}
