import { motion } from 'framer-motion'
import { useState } from 'react'
import { estiloConcreto, estiloMadera } from '../lib/texturas'
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

const SOMBRA_CONCRETO = 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 2px rgba(0,0,0,0.5)'
const SOMBRA_MADERA = 'inset 0 1px 0 rgba(255,235,200,0.35), inset 0 -2px 3px rgba(0,0,0,0.45)'

export function Celda({ coordenada, datos, seleccionada, girar, retraso, onActivar, onClick }: CeldaProps) {
  const apadrinada = datos?.estado === 'apadrinada'
  // Las celdas que ya venían apadrinadas al cargar no se animan; solo las que cambian después.
  const [estabaApadrinada, setEstabaApadrinada] = useState(apadrinada)
  const recienApadrinada = apadrinada && !estabaApadrinada
  if (estabaApadrinada !== apadrinada) setEstabaApadrinada(apadrinada)

  const activar = (el: HTMLElement) => onActivar({ coordenada, rect: el.getBoundingClientRect() })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: retraso, type: 'spring', stiffness: 220, damping: 22 }}
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
        whileHover={{ scale: 1.05, zIndex: 5 }}
        whileTap={{ scale: 0.97 }}
        animate={{ y: seleccionada ? -3 : 0 }}
        style={{ ...estiloConcreto(coordenada), boxShadow: SOMBRA_CONCRETO }}
        className={`relative aspect-square w-full overflow-hidden rounded-[2px] text-[0.65rem] font-medium outline-none focus-visible:ring-2 focus-visible:ring-oro-300 sm:text-xs ${
          seleccionada ? 'ring-2 ring-oro-300' : ''
        } ${apadrinada ? 'text-[#fbe9cc]' : 'text-white/35 hover:text-white/75'}`}
      >
        {apadrinada && <Madera coordenada={coordenada} girar={girar} animar={recienApadrinada} />}
        {seleccionada && <span aria-hidden className="absolute inset-0 bg-oro-400/25" />}
        <span
          className={`relative ${apadrinada ? '[text-shadow:0_1px_2px_rgba(20,9,2,0.9)]' : '[text-shadow:0_1px_0_rgba(0,0,0,0.5)]'}`}
        >
          {coordenada}
        </span>
      </motion.button>
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
      style={{ ...estiloMadera(coordenada), boxShadow: SOMBRA_MADERA, rotate: girar ? 90 : 0 }}
      initial={animar ? { clipPath: 'inset(0 100% 0 0)', scale: 1.12 } : false}
      animate={{ clipPath: 'inset(0 0% 0 0)', scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}
