import { motion } from 'framer-motion'
import { useContext, useState } from 'react'
import { GiroInversoContexto } from '../lib/vista'
import { estiloArena, estiloMadera } from '../lib/texturas'
import type { Celda as CeldaData, CeldaActiva } from '../types'

interface CeldaProps {
  coordenada: string
  datos?: CeldaData
  seleccionada: boolean
  girar: boolean
  retraso: number
  onActivar: (activa: CeldaActiva | null) => void
  onClick: (coordenada: string) => void
}

const SOMBRA_ARENA = 'inset 0 2px 0 rgba(255,255,255,0.8), inset 0 0 0 2px rgba(168,138,92,0.75), 0 3px 0 #a37e45, 0 5px 6px rgba(80,50,15,0.3)'
const SOMBRA_MADERA = 'inset 0 2px 0 rgba(255,255,255,0.45), inset 0 0 0 2px #7a4017, 0 3px 0 #7a4017, 0 5px 7px rgba(90,45,10,0.35)'
const CONTORNO_TEXTO = '0 1px 0 #6e3a17, 1px 0 0 #6e3a17, -1px 0 0 #6e3a17, 0 -1px 0 #6e3a17, 1px 1px 0 #6e3a17, -1px 1px 0 #6e3a17'

export function Celda({ coordenada, datos, seleccionada, girar, retraso, onActivar, onClick }: CeldaProps) {
  const apadrinada = datos?.estado === 'apadrinada'
  // Las celdas que ya venían apadrinadas al cargar no se animan; solo las que cambian después.
  const [estabaApadrinada, setEstabaApadrinada] = useState(apadrinada)
  const recienApadrinada = apadrinada && !estabaApadrinada
  if (estabaApadrinada !== apadrinada) setEstabaApadrinada(apadrinada)

  const giroInverso = useContext(GiroInversoContexto)
  const activar = (el: HTMLElement) => onActivar({ coordenada, rect: el.getBoundingClientRect() })

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 14, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: retraso, type: 'spring', stiffness: 260, damping: 14 }}
    >
      <motion.button
        type="button"
        aria-label={apadrinada ? `${coordenada}, apadrinada por ${datos?.nombre}` : `${coordenada}, disponible`}
        aria-pressed={seleccionada}
        onClick={(e) => {
          activar(e.currentTarget)
          onClick(coordenada)
        }}
        onMouseEnter={(e) => activar(e.currentTarget)}
        onMouseLeave={() => onActivar(null)}
        onFocus={(e) => activar(e.currentTarget)}
        onBlur={() => onActivar(null)}
        whileHover={{ scale: 1.12, y: -3, zIndex: 5, rotate: apadrinada ? [0, -3, 3, 0] : 0 }}
        whileTap={{ scale: 0.92, y: 1 }}
        animate={{ y: seleccionada ? -5 : 0, scale: seleccionada ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{ ...estiloArena(coordenada), boxShadow: apadrinada ? SOMBRA_MADERA : SOMBRA_ARENA }}
        className={`relative aspect-square w-full overflow-hidden rounded-[7px] font-display text-[0.72rem] font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-turquesa sm:text-sm ${
          seleccionada ? 'ring-[3px] ring-turquesa' : ''
        } ${apadrinada ? 'text-white' : 'text-[#ad9468] hover:text-tinta'}`}
      >
        {apadrinada && <Madera coordenada={coordenada} girar={girar} animar={recienApadrinada} />}
        {seleccionada && <span aria-hidden className="absolute inset-0 bg-turquesa/25" />}
        <motion.span
          style={{ rotate: giroInverso, textShadow: apadrinada ? CONTORNO_TEXTO : undefined }}
          className="relative block"
        >
          {coordenada}
        </motion.span>
      </motion.button>
      <DestellosAlApadrinar animar={recienApadrinada} />
    </motion.div>
  )
}

interface MaderaProps {
  coordenada: string
  girar: boolean
  animar: boolean
}

function Madera({ coordenada, girar, animar: animarAlMontar }: MaderaProps) {
  const [animar] = useState(animarAlMontar)

  return (
    <motion.span
      aria-hidden
      className="absolute inset-0"
      style={{ ...estiloMadera(coordenada), rotate: girar ? 90 : 0 }}
      initial={animar ? { clipPath: 'inset(0 100% 0 0)', scale: 1.15 } : false}
      animate={{ clipPath: 'inset(0 0% 0 0)', scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

const DESTELLOS = [
  { x: -22, y: -20 },
  { x: 24, y: -18 },
  { x: -18, y: 22 },
  { x: 22, y: 20 },
]

function DestellosAlApadrinar({ animar: animarAlMontar }: { animar: boolean }) {
  const [animar] = useState(animarAlMontar)
  if (!animar) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {DESTELLOS.map(({ x, y }, i) => (
        <motion.span
          key={i}
          className="absolute text-base text-amber-300 [text-shadow:0_1px_0_#a15a1c]"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.4], x, y, rotate: 90 }}
          transition={{ duration: 0.9, delay: 0.35 + i * 0.05, ease: 'easeOut' }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}
