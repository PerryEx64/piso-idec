import { AnimatePresence, motion } from 'framer-motion'
import type { Celda as CeldaData } from '../types'

interface CeldaProps {
  coordenada: string
  datos?: CeldaData
  seleccionada: boolean
  activa: boolean
  tarjetaAbajo: boolean
  onActivar: (coordenada: string | null) => void
  onClick: (coordenada: string) => void
}

export function Celda({
  coordenada,
  datos,
  seleccionada,
  activa,
  tarjetaAbajo,
  onActivar,
  onClick,
}: CeldaProps) {
  const apadrinada = datos?.estado === 'apadrinada'

  return (
    <div
      className="relative"
      onMouseEnter={() => onActivar(coordenada)}
      onMouseLeave={() => onActivar(null)}
    >
      <motion.button
        type="button"
        aria-label={apadrinada ? `${coordenada}, apadrinada por ${datos?.nombre}` : `${coordenada}, disponible`}
        aria-pressed={seleccionada}
        onClick={() => onClick(coordenada)}
        onFocus={() => onActivar(coordenada)}
        onBlur={() => onActivar(null)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        animate={{ y: seleccionada ? -3 : 0 }}
        className={`relative aspect-square w-full overflow-hidden rounded-md border text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oro-300 sm:rounded-lg sm:text-sm ${
          seleccionada
            ? 'border-oro-300 bg-oro-400/20 shadow-lg shadow-oro-400/30 ring-2 ring-oro-300'
            : apadrinada
              ? 'border-oro-500/60 text-piso-950'
              : 'border-piso-600/60 bg-piso-900 text-white/40 hover:border-oro-400/70 hover:text-white/80'
        }`}
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 origin-bottom bg-linear-to-br from-oro-300 to-oro-500"
          initial={false}
          animate={{ scaleY: apadrinada ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
        <span className="relative">{coordenada}</span>
      </motion.button>

      <AnimatePresence>
        {activa && apadrinada && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: tarjetaAbajo ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-oro-500/40 bg-piso-800 px-3 py-1.5 text-sm text-white shadow-xl ${
              tarjetaAbajo ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}
          >
            {datos?.nombre}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
