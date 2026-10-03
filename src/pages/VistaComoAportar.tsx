import type { ReactNode } from 'react'
import { EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Encabezado } from '../components/Encabezado'
import { Tarjeta } from '../components/Tarjeta'
import { PRECIO_METRO_QUETZALES, TOTAL_METROS } from '../config'
import { CUARTOS_POR_METRO, cantidadEnMetros, totalCuartos } from '../lib/cuartos'
import { formatearQuetzales, quetzalesDeCuartos } from '../lib/quetzales'
import { useCeldas } from '../lib/useCeldas'
import { useSesion } from '../lib/useSesion'

const TOTAL_CUARTOS = TOTAL_METROS * CUARTOS_POR_METRO
const personas = (cantidad: number) => `${cantidad.toLocaleString('en-US')} ${cantidad === 1 ? 'persona' : 'personas'}`

interface Modalidad {
  nombre: string
  cuartos: number
  /** Texto de la columna "Para llegar a la meta" cuando no es una cuenta exacta. */
  nota?: string
  /** Para "5 o 10 metros": el monto es un rango. */
  montoAlterno?: number
}

const MODALIDADES: Modalidad[] = [
  { nombre: '1 metro por persona', cuartos: 4 },
  { nombre: '2 metros por persona', cuartos: 8 },
  { nombre: '4 metros por persona', cuartos: 16 },
  { nombre: '5 o 10 metros', cuartos: 20, montoAlterno: 40, nota: 'Quien pueda y quiera' },
  { nombre: 'Medio metro', cuartos: 2, nota: 'Para quien no puede dar un metro' },
  { nombre: 'Un cuarto de metro', cuartos: 1, nota: 'Para quien no puede dar medio metro' },
]

/** Cuántas personas harían falta para cubrir los cuartos indicados, si cada una aportara esta modalidad. */
const personasNecesarias = (cuartosFaltantes: number, cuartosPorPersona: number) => Math.ceil(cuartosFaltantes / cuartosPorPersona)

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Tarjeta className="max-w-3xl">
      <h2 className="font-display text-2xl font-bold">{titulo}</h2>
      <div className="mt-3 flex flex-col gap-4 font-bold text-tinta-suave">{children}</div>
    </Tarjeta>
  )
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-crema px-4 py-3 text-center">
      <div className="font-display text-2xl font-bold text-tinta">{valor}</div>
      <div className="text-sm">{etiqueta}</div>
    </div>
  )
}

const CLASE_TABLA = 'w-full border-collapse text-left text-sm'
const CLASE_TH = 'bg-miel px-3 py-2 font-display font-semibold text-white [text-shadow:0_1px_0_#a15a1c]'
const CLASE_TD = 'border-t-2 border-tinta/15 px-3 py-2 align-top'

function TablaEnMarco({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border-2 border-tinta bg-white">{children}</div>
}

export function VistaComoAportar() {
  const { celdas, cargando, error } = useCeldas()
  const { esAdmin } = useSesion()
  const aportados = totalCuartos(celdas)
  const faltantes = TOTAL_CUARTOS - aportados

  return (
    <>
      <Encabezado titulo="¿Cómo puedo aportar?" subtitulo="Hay una forma para que todos participen, sin importar cuánto puedan dar." />
      <div className="-mb-4 flex w-full max-w-3xl justify-start print:hidden">
        <EnlaceBoton href="#/">← Regresar</EnlaceBoton>
      </div>

      <div className="flex w-full flex-col items-center gap-8 print:hidden">
        <Seccion titulo="El piso en números">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Dato valor={`${TOTAL_METROS} m²`} etiqueta="de piso por cubrir" />
            <Dato valor={formatearQuetzales(PRECIO_METRO_QUETZALES)} etiqueta="cada metro cuadrado" />
            <Dato valor={formatearQuetzales(TOTAL_METROS * PRECIO_METRO_QUETZALES)} etiqueta="meta total" />
          </div>
          <p>
            Todos los montos están en quetzales guatemaltecos (GTQ). Cada metro que aportas lleva tu nombre en el piso de la iglesia.
          </p>
        </Seccion>

        <Seccion titulo="Formas de aportar">
          <p>
            No hace falta dar un metro completo: puedes aportar uno, varios, medio o solo un cuarto. Lo importante es que cada quien
            participe según sus posibilidades.
          </p>
          <TablaEnMarco>
            <table className={CLASE_TABLA}>
              <caption className="sr-only">Formas de aportar y personas necesarias para llegar a {TOTAL_METROS} metros</caption>
              <thead>
                <tr>
                  <th scope="col" className={CLASE_TH}>Modalidad</th>
                  <th scope="col" className={CLASE_TH}>Aporte</th>
                  <th scope="col" className={CLASE_TH}>Para llegar a {TOTAL_METROS} metros</th>
                </tr>
              </thead>
              <tbody>
                {MODALIDADES.map(({ nombre, cuartos, nota, montoAlterno }) => (
                  <tr key={nombre}>
                    <th scope="row" className={`${CLASE_TD} font-display text-tinta`}>{nombre}</th>
                    <td className={CLASE_TD}>
                      {formatearQuetzales(quetzalesDeCuartos(cuartos))}
                      {montoAlterno && ` o ${formatearQuetzales(quetzalesDeCuartos(montoAlterno))}`}
                    </td>
                    <td className={CLASE_TD}>{nota ?? personas(personasNecesarias(TOTAL_CUARTOS, cuartos))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnMarco>
          <p>
            No se espera que lleguen {TOTAL_METROS} personas con un metro cada una, ni que todos puedan aportar lo mismo. Por eso el
            metro se puede dividir: todos los aportes suman, y varias personas pueden compartir un mismo metro.
          </p>
        </Seccion>

        <Seccion titulo={`Proyección para llegar a ${TOTAL_METROS} metros`}>
          {cargando ? (
            <Cargando texto="Calculando el avance…" />
          ) : (
            <>
              {error && (
                <p role="alert" className="rounded-xl bg-[#fff1d6] px-3 py-2 text-sm text-[#8a5a00]">
                  No pudimos leer el avance actual; mostramos la proyección de la meta completa.
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Dato
                  valor={`${cantidadEnMetros(aportados)} de ${TOTAL_METROS}`}
                  etiqueta={`metros aportados (${formatearQuetzales(quetzalesDeCuartos(aportados))})`}
                />
                <Dato
                  valor={cantidadEnMetros(faltantes)}
                  etiqueta={`metros por completar (${formatearQuetzales(quetzalesDeCuartos(faltantes))})`}
                />
              </div>
              {faltantes > 0 ? (
                <>
                  <p>Para completar lo que falta, haría falta cualquiera de estas combinaciones de personas:</p>
                  <TablaEnMarco>
                    <table className={CLASE_TABLA}>
                      <caption className="sr-only">Personas necesarias para completar los metros que faltan</caption>
                      <thead>
                        <tr>
                          <th scope="col" className={CLASE_TH}>Si cada persona aporta</th>
                          <th scope="col" className={CLASE_TH}>Monto</th>
                          <th scope="col" className={CLASE_TH}>Personas necesarias</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODALIDADES.filter((m) => m.montoAlterno === undefined).map(({ nombre, cuartos }) => (
                          <tr key={nombre}>
                            <th scope="row" className={`${CLASE_TD} font-display text-tinta`}>{nombre.replace(' por persona', '')}</th>
                            <td className={CLASE_TD}>{formatearQuetzales(quetzalesDeCuartos(cuartos))}</td>
                            <td className={CLASE_TD}>{personas(personasNecesarias(faltantes, cuartos))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TablaEnMarco>
                  <p className="text-sm">
                    Son cuentas aproximadas: en la práctica cada quien aportará una cantidad distinta y los aportes se combinan. Se
                    actualizan solas con cada aporte registrado.
                  </p>
                </>
              ) : (
                <p className="text-tinta">¡Meta cumplida! Gracias a todos los que hicieron posible el piso.</p>
              )}
            </>
          )}
        </Seccion>
      </div>

      {esAdmin && <Cartilla />}
    </>
  )
}

const FILAS_CARTILLA = 14
const OPCIONES_CARTILLA = [
  { etiqueta: '1 metro', cuartos: 4 },
  { etiqueta: '2 metros', cuartos: 8 },
  { etiqueta: '4 metros', cuartos: 16 },
  { etiqueta: '½ metro', cuartos: 2 },
  { etiqueta: '¼ de metro', cuartos: 1 },
]

/** Cuadro de registro para anotarse y comprometerse, pensado para imprimirse. Solo lo ven los administradores. */
function Cartilla() {
  return (
    <Tarjeta className="max-w-3xl print:max-w-none print:border-0 print:bg-white print:p-0 print:shadow-none">
      <div className="mb-3 hidden print:block">
        <h1 className="font-display text-2xl font-bold">Apadrina un metro · Cartilla de registro</h1>
        <p>Cada metro cuadrado cuesta {formatearQuetzales(PRECIO_METRO_QUETZALES)} (quetzales guatemaltecos).</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="font-display text-2xl font-bold">Cartilla de registro</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-2xl border-2 border-tinta bg-white px-4 py-2 font-display text-sm font-semibold shadow-[0_3px_0_#5b3a1e] outline-none focus-visible:ring-[3px] focus-visible:ring-turquesa"
        >
          Imprimir cartilla
        </button>
      </div>
      <p className="mt-3 font-bold text-tinta-suave print:mt-0">
        Anótate y marca con una ✓ la cantidad con la que te comprometes. Tu nombre aparece en el piso cuando se recibe el aporte, no
        antes; un compromiso verbal no marca ninguna casilla.
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-tinta bg-white print:rounded-none">
        <table className={`${CLASE_TABLA} min-w-[40rem]`}>
          <caption className="sr-only">Cartilla para anotarse y comprometerse con un aporte</caption>
          <thead>
            <tr>
              <th scope="col" className={`${CLASE_TH} print:bg-white print:text-tinta print:[text-shadow:none]`}>Nombre</th>
              {OPCIONES_CARTILLA.map(({ etiqueta, cuartos }) => (
                <th
                  key={etiqueta}
                  scope="col"
                  className={`${CLASE_TH} text-center print:bg-white print:text-tinta print:[text-shadow:none]`}
                >
                  {etiqueta}
                  <span className="block text-xs font-bold opacity-90">{formatearQuetzales(quetzalesDeCuartos(cuartos))}</span>
                </th>
              ))}
              <th scope="col" className={`${CLASE_TH} text-center print:bg-white print:text-tinta print:[text-shadow:none]`}>
                ¿Ya aportó?
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: FILAS_CARTILLA }, (_, i) => (
              <tr key={i}>
                <td className={`${CLASE_TD} h-10 min-w-48`} />
                {OPCIONES_CARTILLA.map(({ etiqueta }) => (
                  <td key={etiqueta} className={`${CLASE_TD} border-l-2 border-tinta/15`} />
                ))}
                <td className={`${CLASE_TD} border-l-2 border-tinta/15 text-center text-xs`}>Sí ☐ No ☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  )
}
