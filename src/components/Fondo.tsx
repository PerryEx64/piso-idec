import { motion } from 'framer-motion'

interface NubeProps {
  arriba: string
  tamano: number
  duracion: number
  retraso: number
}

function Nube({ arriba, tamano, duracion, retraso }: NubeProps) {
  return (
    <motion.svg
      viewBox="0 0 120 60"
      width={tamano}
      className="absolute -left-48 fill-white/80"
      style={{ top: arriba }}
      initial={{ x: 0 }}
      animate={{ x: 'calc(100vw + 24rem)' }}
      transition={{ duration: duracion, delay: retraso, repeat: Infinity, ease: 'linear' }}
    >
      <path d="M25 52a18 18 0 0 1-2-35.900A24 24 0 0 1 68 12a20 20 0 0 1 28 14 16 16 0 0 1-2 26z" />
    </motion.svg>
  )
}

const DESTELLOS = [
  { izquierda: '8%', arriba: '30%', retraso: 0 },
  { izquierda: '90%', arriba: '22%', retraso: 1.2 },
  { izquierda: '14%', arriba: '70%', retraso: 2.1 },
  { izquierda: '84%', arriba: '64%', retraso: 0.6 },
]

/** Cielo con nubes y destellos que se mueven despacio detrás de todo. */
export function Fondo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Nube arriba="6%" tamano={180} duracion={90} retraso={-20} />
      <Nube arriba="18%" tamano={120} duracion={120} retraso={-70} />
      <Nube arriba="48%" tamano={150} duracion={105} retraso={-45} />
      {DESTELLOS.map(({ izquierda, arriba, retraso }) => (
        <motion.span
          key={izquierda}
          className="absolute text-2xl text-amber-300/80"
          style={{ left: izquierda, top: arriba }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.15, 0.7], rotate: [0, 45, 0] }}
          transition={{ duration: 3.5, delay: retraso, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}
