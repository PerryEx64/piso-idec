import { useState, type FormEvent } from 'react'
import {
  FONDO_COMUN_NOMBRE,
  aportantesDelFondo,
  centavosDeCuartos,
  formatearCentavos,
  leerMonto,
  saldoDelFondo,
  type Movimiento,
} from '../lib/excedentes'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

interface FondoComunProps {
  movimientos: Movimiento[]
  /** Lo que costaría pagar con el fondo las casillas seleccionadas con el aporte elegido; 0 si no hay selección. */
  costoSeleccionCentavos: number
  /** Si no se pudo leer el historial del fondo. */
  error?: boolean
  onReintentar?: () => void
  trabajando: boolean
  onUsar: () => void
  onAgregar: (nombre: string, centavos: number) => void
  onEliminar: (id: string) => void
}

const CUARTO_CENTAVOS = centavosDeCuartos(1)

const formatearFecha = (fecha: Date | null) =>
  fecha ? fecha.toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ahora'

/** Dinero sobrante de los aportes, registrado a nombre de quien lo dejó, para completar más cuartos de metro. */
export function FondoComun({
  movimientos,
  costoSeleccionCentavos,
  error,
  onReintentar,
  trabajando,
  onUsar,
  onAgregar,
  onEliminar,
}: FondoComunProps) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [eliminando, setEliminando] = useState<string | null>(null)

  const saldo = saldoDelFondo(movimientos)
  const aportantes = aportantesDelFondo(movimientos)
  const cuartosQueAlcanza = Math.max(0, Math.floor(saldo / CUARTO_CENTAVOS))
  const montoLeido = leerMonto(monto)
  const puedeAgregar = nombre.trim().length > 0 && montoLeido.estado === 'ok'
  const puedeUsar = costoSeleccionCentavos > 0 && saldo >= costoSeleccionCentavos

  const agregar = (evento: FormEvent) => {
    evento.preventDefault()
    if (!puedeAgregar || montoLeido.estado !== 'ok') return
    onAgregar(nombre.trim(), montoLeido.centavos)
    setNombre('')
    setMonto('')
  }

  const eliminar = (id: string) => {
    if (eliminando !== id) return setEliminando(id)
    setEliminando(null)
    onEliminar(id)
  }

  return (
    <Tarjeta className="max-w-3xl">
      <div className="flex flex-col gap-5">
        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#ffe1db] px-3 py-2 text-sm font-bold text-[#b3341f]">
            No pudimos leer el fondo común. Revisa tu conexión y que las reglas de Firestore estén publicadas.
            {onReintentar && <Boton onClick={onReintentar}>Reintentar</Boton>}
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Fondo común de excedentes</h2>
            <p className="font-bold text-tinta-suave">
              {cuartosQueAlcanza > 0
                ? `Alcanza para ${cuartosQueAlcanza} cuarto${cuartosQueAlcanza > 1 ? 's' : ''} de metro (${formatearCentavos(CUARTO_CENTAVOS)} cada uno).`
                : `Faltan ${formatearCentavos(CUARTO_CENTAVOS - saldo)} para completar un cuarto de metro.`}
            </p>
          </div>
          <div className="rounded-2xl bg-crema px-4 py-2 text-center font-display text-3xl font-bold">{formatearCentavos(saldo)}</div>
        </div>

        <div>
          <Boton variante="miel" disabled={trabajando || !puedeUsar || error} onClick={onUsar}>
            Pagar las casillas seleccionadas con el fondo
          </Boton>
          <p className="mt-2 text-sm font-semibold text-tinta-suave">
            {costoSeleccionCentavos === 0
              ? `Selecciona casillas arriba: quedarán a nombre de «${FONDO_COMUN_NOMBRE}».`
              : puedeUsar
                ? `Costo: ${formatearCentavos(costoSeleccionCentavos)}. Quedarán a nombre de «${FONDO_COMUN_NOMBRE}».`
                : `Costo: ${formatearCentavos(costoSeleccionCentavos)}; el fondo todavía no alcanza.`}
          </p>
        </div>

        <section aria-label="Quién ha dejado dinero en el fondo">
          <h3 className="font-display text-lg font-bold">Quién ha dejado dinero en el fondo</h3>
          {aportantes.length === 0 ? (
            <p className="mt-1 font-semibold text-tinta-suave">Todavía nadie. Los sobrantes aparecerán aquí a nombre de cada persona.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {aportantes.map((a) => (
                <li key={a.clave} className="flex items-center justify-between gap-3 rounded-xl bg-crema px-3 py-1.5 font-bold">
                  <span className="min-w-0 truncate">{a.nombre}</span>
                  <span className="shrink-0 font-display">{formatearCentavos(a.centavos)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={agregar} className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-bold">Agregar dinero directamente al fondo</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={nombre}
              maxLength={80}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de quien lo deja"
              aria-label="Nombre de quien deja dinero en el fondo"
              className={CLASE_CAMPO}
            />
            <input
              value={monto}
              inputMode="decimal"
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Monto en Q"
              aria-label="Monto en quetzales"
              className={`${CLASE_CAMPO} sm:max-w-40`}
            />
          </div>
          {montoLeido.estado === 'invalido' && <p className="text-sm font-bold text-[#b3341f]">No entiendo ese monto. Ejemplo: 10 o 17.50.</p>}
          <div>
            <Boton type="submit" disabled={trabajando || !puedeAgregar}>
              Agregar al fondo
            </Boton>
          </div>
        </form>

        {movimientos.length > 0 && (
          <details className="rounded-2xl border-2 border-tinta/20 px-4 py-3">
            <summary className="cursor-pointer font-display font-semibold">Historial ({movimientos.length})</summary>
            <ul className="mt-3 flex flex-col gap-2">
              {movimientos.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
                  <span className="min-w-0">
                    <span className="text-tinta-suave">{formatearFecha(m.fecha)} · </span>
                    {m.nombre}
                    {m.nota && <span className="block text-xs font-semibold text-tinta-suave">{m.nota}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={m.centavos < 0 ? 'text-[#b3341f]' : 'text-[#1d6b3a]'}>
                      {m.centavos > 0 ? '+' : '−'}
                      {formatearCentavos(Math.abs(m.centavos))}
                    </span>
                    <Boton variante="peligro" disabled={trabajando} onClick={() => eliminar(m.id)} onBlur={() => setEliminando(null)}>
                      {eliminando === m.id ? '¿Seguro?' : 'Borrar'}
                    </Boton>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-semibold text-tinta-suave">
              Borrar un renglón solo corrige el saldo del fondo; no cambia las casillas del piso.
            </p>
          </details>
        )}
      </div>
    </Tarjeta>
  )
}
