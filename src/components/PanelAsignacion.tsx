import { AnimatePresence, motion } from 'framer-motion'
import type { FormEvent } from 'react'
import { cantidadEnMetros, etiquetaMetros } from '../lib/cuartos'
import { unirCoordenadas } from '../lib/coordenadas'
import { formatearCentavos, leerMonto } from '../lib/excedentes'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

export interface CeldaSeleccionada {
  coordenada: string
  /** Cuartos de metro libres en la celda. */
  libres: number
}

interface PanelAsignacionProps {
  seleccionadas: CeldaSeleccionada[]
  nombre: string
  /** Cuartos de metro que se asignan en cada casilla: 4 = metro completo, 2 = medio, 1 = cuarto. */
  cuartos: number
  /** Dinero recibido, tal como lo escribió quien administra (opcional). */
  monto: string
  /** Lo que cuestan las casillas seleccionadas con el aporte elegido. */
  costoCentavos: number
  guardando: boolean
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null
  onNombre: (nombre: string) => void
  onCuartos: (cuartos: number) => void
  onMonto: (monto: string) => void
  onGuardar: () => void
  onLimpiar: () => void
}

const APORTES = [
  { cuartos: 4, etiqueta: '1 metro' },
  { cuartos: 2, etiqueta: '½ metro' },
  { cuartos: 1, etiqueta: '¼ de metro' },
]

export function PanelAsignacion({
  seleccionadas,
  nombre,
  cuartos,
  monto,
  costoCentavos,
  guardando,
  mensaje,
  onNombre,
  onCuartos,
  onMonto,
  onGuardar,
  onLimpiar,
}: PanelAsignacionProps) {
  const sinSeleccion = seleccionadas.length === 0
  const nombreValido = nombre.trim().length > 0
  const recibido = leerMonto(monto)
  const faltaCentavos = recibido.estado === 'ok' ? costoCentavos - recibido.centavos : 0
  const sobraCentavos = recibido.estado === 'ok' ? recibido.centavos - costoCentavos : 0
  const montoNoCubre = recibido.estado === 'invalido' || (!sinSeleccion && faltaCentavos > 0)
  const sinEspacio = seleccionadas.filter((c) => c.libres < cuartos).map((c) => c.coordenada)
  // El aporte más grande que sí cabe en todas las casillas seleccionadas.
  const espacioComun = Math.min(...seleccionadas.map((c) => c.libres))
  const opcionQueCabe = APORTES.find((aporte) => aporte.cuartos <= espacioComun)

  const guardar = (evento: FormEvent) => {
    evento.preventDefault()
    if (nombreValido && !sinSeleccion && sinEspacio.length === 0 && !montoNoCubre) onGuardar()
  }

  return (
    <Tarjeta className="max-w-3xl">
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            {sinSeleccion
              ? 'Toca las casillas que quieres asignar'
              : `${seleccionadas.length} seleccionada${seleccionadas.length > 1 ? 's' : ''}`}
          </h2>
          <ul className="mt-2 flex min-h-8 flex-wrap gap-1.5" aria-label="Casillas seleccionadas">
            <AnimatePresence>
              {seleccionadas.map(({ coordenada, libres }) => (
                <motion.li
                  key={coordenada}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="rounded-lg bg-turquesa px-2 py-0.5 font-display text-sm font-semibold text-white"
                >
                  {coordenada}
                  {libres < 4 && <span className="ml-1 text-xs opacity-90">(libre {cantidadEnMetros(libres)})</span>}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-bold">Aporte en cada casilla</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {APORTES.map((aporte) => (
              <Boton
                key={aporte.cuartos}
                variante={cuartos === aporte.cuartos ? 'miel' : 'blanco'}
                aria-pressed={cuartos === aporte.cuartos}
                onClick={() => onCuartos(aporte.cuartos)}
              >
                {aporte.etiqueta}
              </Boton>
            ))}
          </div>
        </fieldset>

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

        <div className="flex flex-col gap-1 text-sm font-bold">
          <label className="flex flex-col gap-1">
            Dinero recibido en quetzales (opcional)
            <input
              value={monto}
              inputMode="decimal"
              onChange={(e) => onMonto(e.target.value)}
              placeholder={sinSeleccion ? 'Ej. 100' : `Cuesta ${formatearCentavos(costoCentavos)}`}
              className={CLASE_CAMPO}
            />
          </label>
          <MontoResumen
            estado={recibido.estado}
            recibido={recibido.estado === 'ok' ? recibido.centavos : 0}
            costo={costoCentavos}
            sobra={sobraCentavos}
            falta={faltaCentavos}
            hayCasillas={!sinSeleccion}
            nombre={nombre.trim()}
          />
        </div>

        {sinEspacio.length > 0 && (
          <div role="alert" className="flex flex-col gap-2 rounded-xl bg-[#fff1d6] px-3 py-2 text-sm font-bold text-[#8a5a00]">
            <p>
              {etiquetaMetros(cuartos)} no cabe en {unirCoordenadas(sinEspacio)}: ya tiene aportes y le queda menos espacio libre.
            </p>
            {opcionQueCabe && (
              <div>
                <Boton onClick={() => onCuartos(opcionQueCabe.cuartos)}>Usar {opcionQueCabe.etiqueta}</Boton>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Boton type="submit" variante="miel" disabled={guardando || sinSeleccion || !nombreValido || sinEspacio.length > 0 || montoNoCubre}>
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

interface MontoResumenProps {
  estado: 'vacio' | 'invalido' | 'ok'
  recibido: number
  costo: number
  sobra: number
  falta: number
  hayCasillas: boolean
  nombre: string
}

/** Explica qué pasará con el dinero escrito: si cubre, si falta o si sobra para el fondo común. */
function MontoResumen({ estado, recibido, costo, sobra, falta, hayCasillas, nombre }: MontoResumenProps) {
  if (estado === 'invalido') return <p className="text-[#b3341f]">No entiendo ese monto. Escribe solo números, por ejemplo 100 o 82.50.</p>
  if (estado === 'vacio') {
    return <p className="font-semibold text-tinta-suave">Si recibiste dinero, escríbelo: lo que sobre pasa al fondo común a nombre de esta persona.</p>
  }
  if (!hayCasillas) return <p className="font-semibold text-tinta-suave">Recibido: {formatearCentavos(recibido)}. Selecciona las casillas para ver el sobrante.</p>
  if (falta > 0) return <p className="text-[#b3341f]">Con {formatearCentavos(recibido)} no alcanza: cuesta {formatearCentavos(costo)} (faltan {formatearCentavos(falta)}).</p>
  if (sobra === 0) return <p className="text-[#1d6b3a]">Cubre justo {formatearCentavos(costo)}.</p>
  return (
    <p className="text-[#1d6b3a]">
      Cuesta {formatearCentavos(costo)}. Sobran {formatearCentavos(sobra)}, que pasan al fondo común a nombre de {nombre || 'esta persona'}.
    </p>
  )
}
