import { useState, type FormEvent } from 'react'
import { aportesDe, cantidadEnMetros, cuartosLibres, estaCompleta, etiquetaMetros, type Aporte } from '../lib/cuartos'
import { FONDO_COMUN_NOMBRE, formatearCentavos, leerMonto, type CuentaPersona, type Pago } from '../lib/excedentes'
import type { Celda } from '../types'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

interface DetalleCeldaProps {
  coordenada: string
  celda: Celda
  trabajando: boolean
  /** Si no se pudieron leer los pagos, no se puede registrar dinero sin riesgo de contarlo doble. */
  dineroDisponible: boolean
  cuentaDe: (clave: string) => CuentaPersona
  pagosDe: (clave: string) => Pago[]
  onQuitar: (aporte: Aporte) => void
  onRegistrarDinero: (aporte: Aporte, centavos: number, sobranteNuevoCentavos: number) => void
  onEliminarPago: (id: string) => void
  onCerrar: () => void
}

/** Quién aportó en una celda y cuánto dinero ha entregado. Un aporte ya registrado no se cambia: se quita y se asigna de nuevo. */
export function DetalleCelda({
  coordenada,
  celda,
  trabajando,
  dineroDisponible,
  cuentaDe,
  pagosDe,
  onQuitar,
  onRegistrarDinero,
  onEliminarPago,
  onCerrar,
}: DetalleCeldaProps) {
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
              ? 'Para asignarla a otra persona o cambiar un nombre, primero quita el aporte. Aquí también puedes registrar el dinero recibido.'
              : 'Aún hay espacio: puedes seguir agregando aportes a esta casilla. Aquí también puedes registrar el dinero recibido.'}
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {aportesDe(celda).map((aporte) => (
            <li key={aporte.clave} className="flex flex-col gap-3 rounded-xl bg-crema px-3 py-2 font-bold">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">
                  {aporte.nombre} <span className="text-tinta-suave">{cantidadEnMetros(aporte.cuartos)}</span>
                </span>
                <Boton variante="peligro" disabled={trabajando} onClick={() => quitar(aporte)} onBlur={() => setConfirmando(null)}>
                  {confirmando === aporte.clave ? '¿Seguro? Quitar' : 'Quitar'}
                </Boton>
              </div>
              {aporte.nombre !== FONDO_COMUN_NOMBRE && (
                <DineroDePersona
                  aporte={aporte}
                  cuenta={cuentaDe(aporte.clave)}
                  pagos={pagosDe(aporte.clave)}
                  trabajando={trabajando}
                  disponible={dineroDisponible}
                  onRegistrar={onRegistrarDinero}
                  onEliminarPago={onEliminarPago}
                />
              )}
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

interface DineroDePersonaProps {
  aporte: Aporte
  cuenta: CuentaPersona
  pagos: Pago[]
  trabajando: boolean
  disponible: boolean
  onRegistrar: (aporte: Aporte, centavos: number, sobranteNuevoCentavos: number) => void
  onEliminarPago: (id: string) => void
}

const formatearFecha = (fecha: Date | null) =>
  fecha ? fecha.toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ahora'

function DineroDePersona({ aporte, cuenta, pagos, trabajando, disponible, onRegistrar, onEliminarPago }: DineroDePersonaProps) {
  const [texto, setTexto] = useState('')
  const [eliminando, setEliminando] = useState<string | null>(null)
  const nuevo = leerMonto(texto)

  const totalConEste = cuenta.pagadoCentavos + (nuevo.estado === 'ok' ? nuevo.centavos : 0)
  const faltaConEste = Math.max(0, cuenta.costoCentavos - totalConEste)
  // Lo que sobra por encima del costo, menos lo que ya se mandó al fondo por estas mismas casillas.
  const sobranteNuevo = Math.max(0, totalConEste - cuenta.costoCentavos - cuenta.sobranteCentavos)

  const registrar = (evento: FormEvent) => {
    evento.preventDefault()
    if (nuevo.estado !== 'ok') return
    onRegistrar(aporte, nuevo.centavos, sobranteNuevo)
    setTexto('')
  }

  const eliminar = (id: string) => {
    if (eliminando !== id) return setEliminando(id)
    setEliminando(null)
    onEliminarPago(id)
  }

  const estado =
    cuenta.pagadoCentavos === 0
      ? 'Sin dinero registrado todavía.'
      : cuenta.pagadoCentavos < cuenta.costoCentavos
        ? `Ha entregado ${formatearCentavos(cuenta.pagadoCentavos)}; faltan ${formatearCentavos(cuenta.costoCentavos - cuenta.pagadoCentavos)}.`
        : `Ha entregado ${formatearCentavos(cuenta.pagadoCentavos)}${cuenta.sobranteCentavos > 0 ? ` (${formatearCentavos(cuenta.sobranteCentavos)} de sobrante en el fondo)` : ''}.`

  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="font-semibold text-tinta-suave">
        En todo el piso tiene {etiquetaMetros(cuenta.cuartos)} ({formatearCentavos(cuenta.costoCentavos)}). {estado}
      </p>
      <details className="rounded-xl border-2 border-tinta/20 bg-white/60 px-3 py-2">
        <summary className="cursor-pointer font-display font-semibold">Registrar dinero recibido</summary>
        {!disponible ? (
          <p className="mt-2 font-semibold text-[#b3341f]">
            No pudimos leer los pagos. Revisa tu conexión y que las reglas de Firestore estén publicadas.
          </p>
        ) : (
          <form onSubmit={registrar} className="mt-3 flex flex-col gap-2">
            <input
              value={texto}
              inputMode="decimal"
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Dinero recibido ahora, en Q"
              aria-label={`Dinero recibido de ${aporte.nombre}`}
              className={CLASE_CAMPO}
            />
            {nuevo.estado === 'invalido' && <p className="text-[#b3341f]">No entiendo ese monto. Ejemplo: 100 o 82.50.</p>}
            {nuevo.estado === 'ok' &&
              (faltaConEste > 0 ? (
                <p className="text-[#8a5a00]">
                  Con esto lleva {formatearCentavos(totalConEste)} de {formatearCentavos(cuenta.costoCentavos)}: faltan {formatearCentavos(faltaConEste)}.
                </p>
              ) : sobranteNuevo > 0 ? (
                <p className="text-[#1d6b3a]">
                  Quedará cubierto y sobran {formatearCentavos(sobranteNuevo)}, que pasan al fondo común a nombre de {aporte.nombre}.
                </p>
              ) : (
                <p className="text-[#1d6b3a]">Quedará cubierto, sin sobrante nuevo.</p>
              ))}
            <div>
              <Boton type="submit" variante="miel" disabled={trabajando || nuevo.estado !== 'ok'}>
                Registrar dinero
              </Boton>
            </div>
          </form>
        )}
        {pagos.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5 border-t-2 border-tinta/10 pt-2">
            {pagos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="text-tinta-suave">{formatearFecha(p.fecha)} · </span>
                  {formatearCentavos(p.centavos)}
                  {p.nota && <span className="block text-xs font-semibold text-tinta-suave">{p.nota}</span>}
                </span>
                <Boton variante="peligro" disabled={trabajando} onClick={() => eliminar(p.id)} onBlur={() => setEliminando(null)}>
                  {eliminando === p.id ? '¿Seguro?' : 'Borrar'}
                </Boton>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  )
}
