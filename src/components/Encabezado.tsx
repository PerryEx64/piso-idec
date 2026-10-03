import { motion } from 'framer-motion'

interface EncabezadoProps {
  titulo: string
  subtitulo: string
}

export function Encabezado({ titulo, subtitulo }: EncabezadoProps) {
  return (
    <motion.header
      className="text-center"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
    >
      <h1 className="font-display text-4xl font-bold tracking-tight text-tinta [text-shadow:0_3px_0_rgba(255,255,255,0.8)] sm:text-5xl">
        {titulo}
      </h1>
      <p className="mt-2 text-lg font-bold text-tinta-suave">{subtitulo}</p>
    </motion.header>
  )
}
