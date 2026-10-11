import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { etiquetaMetros, normalizar } from '../lib/cuartos'
import { cuentaDe, estadoDePago, formatearCentavos, type EstadoPago, type Pago } from '../lib/excedentes'
import { calcularRanking, type Apadrinador } from '../lib/ranking'
import type { CeldasPorCoordenada } from '../types'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

const CANTIDAD_INICIAL = 10

const COLORES_PODIO: Record<number, string> = {
  1: 'bg-[#f7c948]',
  2: 'bg-[#d5dbe3]',
  3: 'bg-[#e0975f]',
}

type Filtro = 'todos' | 'pagaron' | 'faltan'

interface PagoDePersona {
  estado: EstadoPago
  faltaCentavos: number
  /** Dinero que se le ha registrado como recibido. */
  pagadoCentavos: number
}

const ETIQUETAS_PAGO: Record<EstadoPago, { texto: string; clases: string }> = {
  pagado: { texto: 'Pagó', clases: 'bg-[#dff5e6] text-[#1d6b3a]' },
  parcial: { texto: 'Pago parcial', clases: 'bg-[#fff1d6] text-[#8a5a00]' },
  sin_pago: { texto: 'Sin pago registrado', clases: 'bg-[#ffe1db] text-[#b3341f]' },
}

interface RankingProps {
  celdas: CeldasPorCoordenada
  /** Solo para administradores: con esto el ranking muestra quién ya pagó y quién no. */
  pagos?: Pago[]
  /** Solo para administradores: habilita el buscador por nombre. */
  esAdmin?: boolean
}

export function Ranking({ celdas, pagos, esAdmin = false }: RankingProps) {
  const ranking = useMemo(() => calcularRanking(celdas), [celdas])
  const [verTodos, setVerTodos] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')

  const pagoPorPersona = useMemo(() => {
    if (!pagos) return null
    return new Map<string, PagoDePersona>(
      ranking.map((a) => {
        const cuentaPersona = cuentaDe(a.clave, celdas, pagos)
        return [a.clave, { ...estadoDePago(cuentaPersona), pagadoCentavos: cuentaPersona.pagadoCentavos }]
      }),
    )
  }, [ranking, celdas, pagos])

  // Todo el dinero registrado como recibido (incluye lo de quienes no salen en el ranking, como los anónimos).
  const recolectadoCentavos = pagos?.reduce((suma, p) => suma + p.centavos, 0) ?? 0
  // Lo que todavía falta cobrar a las personas del ranking que no han cubierto sus metros.
  const porCobrarCentavos = pagoPorPersona ? [...pagoPorPersona.values()].reduce((suma, p) => suma + p.faltaCentavos, 0) : 0

  const cuenta = (estado: EstadoPago) => ranking.filter((a) => pagoPorPersona?.get(a.clave)?.estado === estado).length
  const totales = { pagaron: cuenta('pagado'), faltan: ranking.length - cuenta('pagado') }
  // Todas las palabras escritas deben aparecer en el nombre; mayúsculas y acentos no importan.
  const terminos = esAdmin ? normalizar(busqueda).split(' ').filter(Boolean) : []
  const buscando = terminos.length > 0
  const filtrados = ranking.filter((a) => {
    if (pagoPorPersona && filtro !== 'todos' && (pagoPorPersona.get(a.clave)?.estado === 'pagado') !== (filtro === 'pagaron')) return false
    return terminos.every((termino) => a.clave.includes(termino))
  })
  const visibles = verTodos || buscando ? filtrados : filtrados.slice(0, CANTIDAD_INICIAL)
  const maximo = ranking[0]?.cuartos ?? 1

  return (
    <Tarjeta className="max-w-xl">
      <h2 className="font-display text-2xl font-bold">Quienes más han apadrinado</h2>

      {esAdmin && ranking.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm font-bold text-tinta-suave">
            Solo los administradores ven {pagoPorPersona ? 'la búsqueda, los pagos y el dinero recolectado' : 'la búsqueda'}.
          </p>
          {pagoPorPersona && (
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-crema px-3 py-2 text-center">
                <dt className="text-xs font-bold text-tinta-suave">Dinero recolectado</dt>
                <dd className="font-display text-xl font-bold text-[#1d6b3a]">{formatearCentavos(recolectadoCentavos)}</dd>
              </div>
              <div className="rounded-2xl bg-crema px-3 py-2 text-center">
                <dt className="text-xs font-bold text-tinta-suave">Por cobrar</dt>
                <dd className="font-display text-xl font-bold text-[#8a5a00]">{formatearCentavos(porCobrarCentavos)}</dd>
              </div>
            </dl>
          )}
          <div className="relative">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre…"
              aria-label="Buscar a una persona en el ranking"
              autoComplete="off"
              className={`${CLASE_CAMPO} pr-12`}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                aria-label="Borrar búsqueda"
                className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-full font-display text-lg font-bold text-tinta-suave outline-none hover:text-tinta focus-visible:ring-[3px] focus-visible:ring-turquesa"
              >
                ×
              </button>
            )}
          </div>
          {buscando && (
            <p role="status" className="text-sm font-bold text-tinta-suave">
              {filtrados.length === 0
                ? `Nadie coincide con «${busqueda.trim()}».`
                : `${filtrados.length} ${filtrados.length === 1 ? 'persona coincide' : 'personas coinciden'}.`}
            </p>
          )}
          {pagoPorPersona && (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['todos', `Todos (${ranking.length})`],
                  ['pagaron', `Ya pagaron (${totales.pagaron})`],
                  ['faltan', `Faltan (${totales.faltan})`],
                ] as const
              ).map(([valor, etiqueta]) => (
                <Boton
                  key={valor}
                  variante={filtro === valor ? 'miel' : 'blanco'}
                  aria-pressed={filtro === valor}
                  onClick={() => {
                    setFiltro(valor)
                    setVerTodos(false)
                  }}
                >
                  {etiqueta}
                </Boton>
              ))}
            </div>
          )}
        </div>
      )}

      {ranking.length === 0 ? (
        <p className="mt-3 font-bold text-tinta-suave">Todavía no hay apadrinadores. ¡Sé el primero en dejar tu nombre en el piso!</p>
      ) : filtrados.length === 0 ? (
        buscando ? null : <p className="mt-3 font-bold text-tinta-suave">Nadie en esta lista.</p>
      ) : (
        <>
          <ol className="mt-4 flex flex-col gap-3" aria-label="Ranking de apadrinadores">
            <AnimatePresence initial={false}>
              {visibles.map(({ clave, nombre, cuartos, posicion }: Apadrinador) => (
                <motion.li
                  key={clave}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-tinta font-display text-base font-bold shadow-[0_2px_0_#5b3a1e] ${
                      COLORES_PODIO[posicion] ?? 'bg-white'
                    }`}
                  >
                    {posicion}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-bold">{nombre}</span>
                      <span className="shrink-0 font-display text-sm font-semibold text-tinta-suave">
                        {etiquetaMetros(cuartos)}
                      </span>
                    </div>
                    <div className="mt-1 h-3.5 overflow-hidden rounded-full border-2 border-tinta bg-white">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-b from-[#f6b46c] to-naranja"
                        initial={{ width: 0 }}
                        animate={{ width: `${(cuartos / maximo) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
                      />
                    </div>
                    <EtiquetaDePago pago={pagoPorPersona?.get(clave)} />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {!buscando && filtrados.length > CANTIDAD_INICIAL && (
            <Boton className="mt-5" onClick={() => setVerTodos(!verTodos)}>
              {verTodos ? 'Ver menos' : `Ver todos (${filtrados.length})`}
            </Boton>
          )}
        </>
      )}
    </Tarjeta>
  )
}

function EtiquetaDePago({ pago }: { pago?: PagoDePersona }) {
  if (!pago) return null
  const { texto, clases } = ETIQUETAS_PAGO[pago.estado]
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className={`inline-block rounded-lg px-2 py-0.5 text-xs font-bold ${clases}`}>
        {texto}
        {pago.estado !== 'pagado' && ` · faltan ${formatearCentavos(pago.faltaCentavos)}`}
      </span>
      {pago.pagadoCentavos > 0 && (
        <span className="text-xs font-bold text-tinta-suave">Entregó {formatearCentavos(pago.pagadoCentavos)}</span>
      )}
    </div>
  )
}
