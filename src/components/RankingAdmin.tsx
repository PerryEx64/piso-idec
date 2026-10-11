import { usePagos } from '../lib/usePagos'
import type { CeldasPorCoordenada } from '../types'
import { Boton } from './Boton'
import { Cargando } from './Cargando'
import { Ranking } from './Ranking'

/** Ranking con el estado de pago de cada persona. Solo se muestra a administradores: los pagos no son públicos. */
export function RankingAdmin({ celdas }: { celdas: CeldasPorCoordenada }) {
  const { pagos, cargando, error, reintentar } = usePagos()

  if (cargando) return <Cargando texto="Cargando los pagos…" />
  return (
    <>
      {error && (
        <div role="alert" className="flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl bg-[#ffe1db] px-3 py-2 text-sm font-bold text-[#b3341f]">
          No pudimos leer los pagos, así que no se muestra quién ya pagó. Revisa que las reglas de Firestore estén publicadas.
          <Boton onClick={reintentar}>Reintentar</Boton>
        </div>
      )}
      <Ranking celdas={celdas} pagos={error ? undefined : pagos} esAdmin />
    </>
  )
}
