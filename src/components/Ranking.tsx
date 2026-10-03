import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { calcularRanking } from '../lib/ranking'
import type { CeldasPorCoordenada } from '../types'
import { Boton } from './Boton'
import { Tarjeta } from './Tarjeta'

const CANTIDAD_INICIAL = 10

const COLORES_PODIO: Record<number, string> = {
  1: 'bg-[#f7c948]',
  2: 'bg-[#d5dbe3]',
  3: 'bg-[#e0975f]',
}

export function Ranking({ celdas }: { celdas: CeldasPorCoordenada }) {
  const ranking = useMemo(() => calcularRanking(celdas), [celdas])
  const [verTodos, setVerTodos] = useState(false)
  const visibles = verTodos ? ranking : ranking.slice(0, CANTIDAD_INICIAL)
  const maximo = ranking[0]?.metros ?? 1

  return (
    <Tarjeta className="max-w-xl">
      <h2 className="font-display text-2xl font-bold">Quienes más han apadrinado</h2>

      {ranking.length === 0 ? (
        <p className="mt-3 font-bold text-tinta-suave">Todavía no hay apadrinadores. ¡Sé el primero en dejar tu nombre en el piso!</p>
      ) : (
        <>
          <ol className="mt-4 flex flex-col gap-3" aria-label="Ranking de apadrinadores">
            <AnimatePresence initial={false}>
              {visibles.map(({ clave, nombre, metros, posicion }) => (
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
                        {metros} {metros === 1 ? 'metro' : 'metros'}
                      </span>
                    </div>
                    <div className="mt-1 h-3.5 overflow-hidden rounded-full border-2 border-tinta bg-white">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-b from-[#f6b46c] to-naranja"
                        initial={{ width: 0 }}
                        animate={{ width: `${(metros / maximo) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
                      />
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {ranking.length > CANTIDAD_INICIAL && (
            <Boton className="mt-5" onClick={() => setVerTodos(!verTodos)}>
              {verTodos ? 'Ver menos' : `Ver todos (${ranking.length})`}
            </Boton>
          )}
        </>
      )}
    </Tarjeta>
  )
}
