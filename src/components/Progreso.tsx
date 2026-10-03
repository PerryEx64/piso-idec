import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { CUARTOS_POR_METRO, cantidadEnMetros } from '../lib/cuartos'

interface ProgresoProps {
  /** Cuartos de metro ya aportados. */
  cuartos: number
  totalMetros: number
}

const RAYAS =
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.28) 0 10px, transparent 10px 20px), linear-gradient(to bottom, #f6b46c, #e07b39)'

export function Progreso({ cuartos, totalMetros }: ProgresoProps) {
  const sinMovimiento = useReducedMotion()
  const porcentaje = (cuartos / (totalMetros * CUARTOS_POR_METRO)) * 100
  const contador = useMotionValue(0)
  const aportado = useTransform(contador, (v) => cantidadEnMetros(Math.round(v)))

  useEffect(() => {
    const controles = animate(contador, cuartos, { duration: sinMovimiento ? 0 : 1.4, ease: 'easeOut' })
    return () => controles.stop()
  }, [cuartos, contador, sinMovimiento])

  return (
    <div className="w-full max-w-3xl">
      <p className="mb-3 text-center font-display text-xl font-semibold text-tinta">
        <motion.span className="mx-0.5 inline-block rounded-xl bg-miel px-2.5 py-0.5 text-white [text-shadow:0_1px_0_#a15a1c]">
          {aportado}
        </motion.span>{' '}
        de {totalMetros} metros apadrinados
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalMetros}
        aria-valuenow={cuartos / CUARTOS_POR_METRO}
        className="relative h-7 overflow-hidden rounded-full border-[3px] border-tinta bg-white p-[3px] shadow-[0_3px_0_#5b3a1e]"
      >
        <motion.div
          className="relative h-full rounded-full border-2 border-[#a15a1c]"
          style={{ backgroundImage: RAYAS, backgroundSize: '28px 28px, 100% 100%' }}
          initial={{ width: '0%' }}
          animate={{ width: `${porcentaje}%`, backgroundPositionX: sinMovimiento ? 0 : ['0px', '28px'] }}
          transition={{
            width: { type: 'spring', stiffness: 60, damping: 14 },
            backgroundPositionX: { duration: 1, repeat: Infinity, ease: 'linear' },
          }}
        />
      </div>
    </div>
  )
}
