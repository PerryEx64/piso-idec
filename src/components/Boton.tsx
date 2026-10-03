import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Variante = 'blanco' | 'miel' | 'peligro'

interface BotonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variante?: Variante
  children: ReactNode
}

const BASE =
  'rounded-2xl border-2 border-tinta px-4 py-2 font-display text-sm font-semibold shadow-[0_3px_0_#5b3a1e] outline-none focus-visible:ring-[3px] focus-visible:ring-turquesa disabled:cursor-not-allowed disabled:opacity-50'
const RELIEVE_TEXTO = '[text-shadow:0_1px_0_rgba(0,0,0,0.35)]'
const VARIANTES: Record<Variante, string> = {
  blanco: 'bg-white text-tinta',
  miel: `bg-miel text-white ${RELIEVE_TEXTO}`,
  peligro: `bg-[#ef6f5e] text-white ${RELIEVE_TEXTO}`,
}

export function Boton({ variante = 'blanco', disabled, className = '', children, ...resto }: BotonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, rotate: -2 }}
      whileTap={disabled ? undefined : { y: 3, boxShadow: '0 0px 0 #5b3a1e' }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className={`${BASE} ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {children}
    </motion.button>
  )
}
