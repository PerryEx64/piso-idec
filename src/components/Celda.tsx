import { motion } from 'framer-motion'
import { memo, useMemo, useState } from 'react'
import { aportesDe, cantidadEnMetros, cuartosLibres, estaCompleta, tieneAportes } from '../lib/cuartos'
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

function describir(coordenada: string, datos?: CeldaData) {
  if (!tieneAportes(datos)) return `${coordenada}, libre`
  const quienes = aportesDe(datos)
    .map((a) => a.nombre)
    .join(', ')
  if (estaCompleta(datos)) return `${coordenada}, apadrinada por ${quienes}`
  return `${coordenada}, apadrinada en parte por ${quienes}; libre ${cantidadEnMetros(cuartosLibres(datos))} de metro`
}

export const Celda = memo(function Celda({ coordenada, datos, seleccionada, girar, retraso, onActivar, onClick }: CeldaProps) {
  const conAportes = tieneAportes(datos)
  // Las celdas que ya venían apadrinadas al cargar no se animan; solo las que cambian después.
  const [teniaAportes, setTeniaAportes] = useState(conAportes)
  const recienApadrinada = conAportes && !teniaAportes
  if (teniaAportes !== conAportes) setTeniaAportes(conAportes)

  const fondo = useMemo(() => estiloArena(coordenada), [coordenada])
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
        aria-label={describir(coordenada, datos)}
        aria-pressed={seleccionada}
        onClick={(e) => {
          activar(e.currentTarget)
          onClick(coordenada)
        }}
        onMouseEnter={(e) => activar(e.currentTarget)}
        onMouseLeave={() => onActivar(null)}
        onFocus={(e) => activar(e.currentTarget)}
        onBlur={() => onActivar(null)}
        whileHover={{ scale: 1.25, y: -3, zIndex: 5, rotate: conAportes ? [0, -3, 3, 0] : 0 }}
        whileTap={{ scale: 0.92, y: 1 }}
        animate={{ y: seleccionada ? -4 : 0, scale: seleccionada ? 1.15 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={fondo}
        className={`relative block aspect-square w-full overflow-hidden rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-turquesa sm:rounded-[6px] ${
          estaCompleta(datos) ? 'baldosa-madera' : 'baldosa-arena'
        } ${seleccionada ? 'ring-2 ring-turquesa sm:ring-[3px]' : ''}`}
      >
        {conAportes && datos && <Madera coordenada={coordenada} datos={datos} girar={girar} animar={recienApadrinada} />}
        {seleccionada && <span aria-hidden className="absolute inset-0 bg-turquesa/30" />}
      </motion.button>
      <DestellosAlApadrinar animar={recienApadrinada} />
    </motion.div>
  )
})

interface MaderaProps {
  coordenada: string
  datos: CeldaData
  girar: boolean
  animar: boolean
}

/** Madera continua si un solo nombre tiene el metro completo; si no, un cuarto de madera por aporte. */
function Madera({ coordenada, datos, girar, animar: animarAlMontar }: MaderaProps) {
  const [animar] = useState(animarAlMontar)
  const unSoloDueno = estaCompleta(datos) && datos.cuartos.every((c) => c === datos.cuartos[0])
  const entero = useMemo(() => estiloMadera(coordenada), [coordenada])
  const porCuarto = useMemo(() => datos.cuartos.map((_, i) => estiloMadera(`${coordenada}${i}`)), [coordenada, datos.cuartos])

  return (
    <motion.span
      aria-hidden
      className="absolute inset-0 grid grid-cols-2 grid-rows-2"
      style={unSoloDueno ? { ...entero, rotate: girar ? 90 : 0 } : undefined}
      initial={animar ? { clipPath: 'inset(0 100% 0 0)', scale: 1.15 } : false}
      animate={{ clipPath: 'inset(0 0% 0 0)', scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {!unSoloDueno &&
        datos.cuartos.map((dueno, i) => (
          <span
            key={i}
            style={dueno ? porCuarto[i] : undefined}
            className={dueno ? 'shadow-[inset_0_0_0_1px_#7a4017]' : undefined}
          />
        ))}
    </motion.span>
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
