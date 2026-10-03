import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export const CLASE_CAMPO =
  'w-full rounded-2xl border-2 border-tinta bg-white px-4 py-2.5 font-bold text-tinta outline-none placeholder:font-semibold placeholder:text-tinta-suave/60 focus-visible:ring-[3px] focus-visible:ring-turquesa'

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className={`w-full rounded-3xl border-2 border-tinta bg-white/90 p-5 shadow-[0_4px_0_#5b3a1e] ${className}`}
    >
      {children}
    </motion.div>
  )
}
