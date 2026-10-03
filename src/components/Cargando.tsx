import { motion } from 'framer-motion'

export function Cargando({ texto = 'Cargando el piso…' }: { texto?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 font-display text-lg font-semibold text-tinta">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-4 w-4 rounded-md border-2 border-[#7a4017] bg-miel"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {texto}
    </div>
  )
}
