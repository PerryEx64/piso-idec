import { AnimatePresence, motion } from 'framer-motion'
import type { FormEvent } from 'react'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

interface PanelAsignacionProps {
  seleccionadas: string[]
  nombre: string
  guardando: boolean
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null
  onNombre: (nombre: string) => void
  onGuardar: () => void
  onLimpiar: () => void
}

export function PanelAsignacion({ seleccionadas, nombre, guardando, mensaje, onNombre, onGuardar, onLimpiar }: PanelAsignacionProps) {
  const sinSeleccion = seleccionadas.length === 0
  const nombreValido = nombre.trim().length > 0

  const guardar = (evento: FormEvent) => {
    evento.preventDefault()
    if (nombreValido && !sinSeleccion) onGuardar()
  }

  return (
    <Tarjeta>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            {sinSeleccion
              ? 'Toca las casillas libres que quieres asignar'
              : `${seleccionadas.length} seleccionada${seleccionadas.length > 1 ? 's' : ''}`}
          </h2>
          <ul className="mt-2 flex min-h-8 flex-wrap gap-1.5" aria-label="Casillas seleccionadas">
            <AnimatePresence>
              {seleccionadas.map((coordenada) => (
                <motion.li
                  key={coordenada}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="rounded-lg bg-turquesa px-2 py-0.5 font-display text-sm font-semibold text-white"
                >
                  {coordenada}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Nombre de quien apadrina
          <input
            value={nombre}
            maxLength={80}
            onChange={(e) => onNombre(e.target.value)}
            placeholder="Ej. Familia Pérez"
            className={CLASE_CAMPO}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <Boton type="submit" variante="miel" disabled={guardando || sinSeleccion || !nombreValido}>
            {guardando ? 'Guardando…' : 'Apadrinar'}
          </Boton>
          <Boton disabled={guardando || sinSeleccion} onClick={onLimpiar}>
            Quitar selección
          </Boton>
        </div>

        <div aria-live="polite">
          {mensaje && (
            <p
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                mensaje.tipo === 'ok' ? 'bg-[#dff5e6] text-[#1d6b3a]' : 'bg-[#ffe1db] text-[#b3341f]'
              }`}
            >
              {mensaje.texto}
            </p>
          )}
        </div>
      </form>
    </Tarjeta>
  )
}
