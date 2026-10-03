import { motion } from 'framer-motion'

interface ProgresoProps {
  apadrinadas: number
  total: number
}

export function Progreso({ apadrinadas, total }: ProgresoProps) {
  const porcentaje = (apadrinadas / total) * 100

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-lg text-white/80">
        <span className="font-semibold text-oro-400">{apadrinadas}</span> de {total} metros apadrinados
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={apadrinadas}
        className="h-3 overflow-hidden rounded-full bg-piso-800"
      >
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-oro-700 via-oro-500 to-oro-300"
          initial={false}
          animate={{ width: `${porcentaje}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </div>
    </div>
  )
}
