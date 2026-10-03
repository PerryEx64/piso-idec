import { useState } from 'react'
import { aportesDe, cantidadEnMetros, cuartosLibres, estaCompleta, type Aporte } from '../lib/cuartos'
import type { Celda } from '../types'
import { Boton } from './Boton'
import { Tarjeta } from './Tarjeta'

interface DetalleCeldaProps {
  coordenada: string
  celda: Celda
  trabajando: boolean
  onQuitar: (aporte: Aporte) => void
  onCerrar: () => void
}

/** Quién aportó en una celda. Un aporte ya registrado no se cambia: primero se quita y luego se asigna de nuevo. */
export function DetalleCelda({ coordenada, celda, trabajando, onQuitar, onCerrar }: DetalleCeldaProps) {
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const completa = estaCompleta(celda)

  const quitar = (aporte: Aporte) => {
    if (confirmando !== aporte.clave) return setConfirmando(aporte.clave)
    setConfirmando(null)
    onQuitar(aporte)
  }

  return (
    <Tarjeta className="max-w-3xl">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            {coordenada} {completa ? 'está completa' : `tiene ${cantidadEnMetros(cuartosLibres(celda))} de metro libre`}
          </h2>
          <p className="mt-1 font-bold text-tinta-suave">
            {completa
              ? 'Para asignarla a otra persona o cambiar un nombre, primero quita el aporte.'
              : 'Aún hay espacio: puedes seguir agregando aportes a esta casilla.'}
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {aportesDe(celda).map((aporte) => (
            <li key={aporte.clave} className="flex items-center justify-between gap-3 rounded-xl bg-crema px-3 py-2 font-bold">
              <span className="min-w-0 truncate">
                {aporte.nombre} <span className="text-tinta-suave">{cantidadEnMetros(aporte.cuartos)}</span>
              </span>
              <Boton variante="peligro" disabled={trabajando} onClick={() => quitar(aporte)} onBlur={() => setConfirmando(null)}>
                {confirmando === aporte.clave ? '¿Seguro? Quitar' : 'Quitar'}
              </Boton>
            </li>
          ))}
        </ul>

        <div>
          <Boton disabled={trabajando} onClick={onCerrar}>
            Cerrar
          </Boton>
        </div>
      </div>
    </Tarjeta>
  )
}
