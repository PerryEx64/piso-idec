import { aportantesDelFondo, formatearCentavos, saldoDelFondo, type Movimiento } from '../lib/excedentes'
import { useExcedentes } from '../lib/useExcedentes'
import { Boton } from './Boton'
import { Cargando } from './Cargando'
import { Tarjeta } from './Tarjeta'

const CLASE_TH = 'bg-miel px-3 py-2 font-display font-semibold text-white [text-shadow:0_1px_0_#a15a1c]'
const CLASE_TD = 'border-t-2 border-tinta/15 px-3 py-2'

/** Quién ha dejado dinero en el fondo común y cuánto. Solo para administradores. */
export function TablaFondo({ movimientos }: { movimientos: Movimiento[] }) {
  const aportantes = aportantesDelFondo(movimientos)
  const aportado = aportantes.reduce((suma, a) => suma + a.centavos, 0)
  const saldo = saldoDelFondo(movimientos)
  const usado = aportado - saldo

  return (
    <Tarjeta className="max-w-xl">
      <h2 className="font-display text-2xl font-bold">Fondo común de excedentes</h2>
      <p className="mt-1 text-sm font-bold text-tinta-suave">Quién ha dejado dinero en el fondo y cuánto. Solo los administradores ven esta tabla.</p>

      {aportantes.length === 0 ? (
        <p className="mt-3 font-bold text-tinta-suave">Todavía nadie ha dejado dinero en el fondo.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-tinta bg-white">
          <table className="w-full border-collapse text-left text-sm font-bold">
            <caption className="sr-only">Personas que han dejado dinero en el fondo común y el monto de cada una</caption>
            <thead>
              <tr>
                <th scope="col" className={CLASE_TH}>
                  Persona
                </th>
                <th scope="col" className={`${CLASE_TH} text-right`}>
                  Dejó en el fondo
                </th>
              </tr>
            </thead>
            <tbody>
              {aportantes.map((a) => (
                <tr key={a.clave}>
                  <th scope="row" className={`${CLASE_TD} font-display text-tinta`}>
                    {a.nombre}
                  </th>
                  <td className={`${CLASE_TD} text-right`}>{formatearCentavos(a.centavos)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-crema">
                <th scope="row" className={`${CLASE_TD} font-display`}>
                  Total aportado
                </th>
                <td className={`${CLASE_TD} text-right`}>{formatearCentavos(aportado)}</td>
              </tr>
              {usado > 0 && (
                <tr className="bg-crema">
                  <th scope="row" className={`${CLASE_TD} font-display`}>
                    Ya usado en casillas
                  </th>
                  <td className={`${CLASE_TD} text-right text-[#b3341f]`}>−{formatearCentavos(usado)}</td>
                </tr>
              )}
              <tr className="bg-crema">
                <th scope="row" className={`${CLASE_TD} font-display`}>
                  Saldo disponible
                </th>
                <td className={`${CLASE_TD} text-right text-[#1d6b3a]`}>{formatearCentavos(saldo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Tarjeta>
  )
}

/** Carga el historial del fondo (solo lo lee un administrador) y muestra la tabla. */
export function TablaFondoAdmin() {
  const { movimientos, cargando, error, reintentar } = useExcedentes()

  if (cargando) return <Cargando texto="Cargando el fondo común…" />
  if (error) {
    return (
      <div role="alert" className="flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl bg-[#ffe1db] px-3 py-2 text-sm font-bold text-[#b3341f]">
        No pudimos leer el fondo común. Revisa que las reglas de Firestore estén publicadas.
        <Boton onClick={reintentar}>Reintentar</Boton>
      </div>
    )
  }
  return <TablaFondo movimientos={movimientos} />
}
