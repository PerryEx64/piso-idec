import { motion } from 'framer-motion'

export type ModoVista = 'planta' | 'perspectiva'

interface ControlesVistaProps {
  modo: ModoVista | null
  onPlanta: () => void
  onPerspectiva: () => void
  onGirar: (grados: number) => void
}

const BOTON =
  'rounded-2xl border-2 border-tinta px-4 py-2 font-display text-sm font-semibold shadow-[0_3px_0_#5b3a1e] outline-none focus-visible:ring-[3px] focus-visible:ring-turquesa'
const INACTIVO = 'bg-white text-tinta'
const ACTIVO = 'bg-miel text-white [text-shadow:0_1px_0_#a15a1c]'

interface BotonProps {
  activo?: boolean
  etiqueta?: string
  onClick: () => void
  children: React.ReactNode
}

function Boton({ activo, etiqueta, onClick, children }: BotonProps) {
  return (
    <motion.button
      type="button"
      aria-label={etiqueta}
      aria-pressed={activo}
      onClick={onClick}
      whileHover={{ y: -2, rotate: -2 }}
      whileTap={{ y: 3, boxShadow: '0 0px 0 #5b3a1e' }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className={`${BOTON} ${activo ? ACTIVO : INACTIVO}`}
    >
      {children}
    </motion.button>
  )
}

export function ControlesVista({ modo, onPlanta, onPerspectiva, onGirar }: ControlesVistaProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Boton activo={modo === 'planta'} onClick={onPlanta}>
        Planta
      </Boton>
      <Boton activo={modo === 'perspectiva'} onClick={onPerspectiva}>
        Perspectiva
      </Boton>
      <Boton etiqueta="Girar a la izquierda" onClick={() => onGirar(-45)}>
        ↺
      </Boton>
      <Boton etiqueta="Girar a la derecha" onClick={() => onGirar(45)}>
        ↻
      </Boton>
    </div>
  )
}
