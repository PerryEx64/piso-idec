import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { COLUMNAS, FILAS } from '../config'
import { LETRAS, NUMEROS, coordenada } from '../lib/coordenadas'
import type { CeldaActiva, CeldasPorCoordenada } from '../types'
import { Celda } from './Celda'
import { Paredes } from './Paredes'

interface CuadriculaProps {
  celdas: CeldasPorCoordenada
  seleccionadas?: ReadonlySet<string>
  onSeleccionar?: (coordenada: string) => void
}

const INCLINACION_BASE = 34
const RETRASO_POR_DIAGONAL = 0.035
const MARGEN_TARJETA = 70

export function Cuadricula({ celdas, seleccionadas, onSeleccionar }: CuadriculaProps) {
  const [activa, setActivaInmediato] = useState<CeldaActiva | null>(null)
  const temporizadorCierre = useRef<number>(0)
  const sinMovimiento = useReducedMotion()

  const puntero = { x: useMotionValue(0.5), y: useMotionValue(0.5) }
  const rotarX = useSpring(useTransform(puntero.y, [0, 1], [INCLINACION_BASE + 3, INCLINACION_BASE - 3]), {
    stiffness: 70,
    damping: 22,
  })
  const rotarY = useSpring(useTransform(puntero.x, [0, 1], [-6, 6]), { stiffness: 70, damping: 22 })
  const posicionBrillo = useTransform(puntero.x, [0, 1], ['0%', '100%'])

  // Cierre con retraso: si el piso se mueve bajo el cursor, la tarjeta no parpadea.
  const setActiva = (siguiente: CeldaActiva | null) => {
    window.clearTimeout(temporizadorCierre.current)
    if (siguiente) setActivaInmediato(siguiente)
    else temporizadorCierre.current = window.setTimeout(() => setActivaInmediato(null), 120)
  }

  useEffect(() => {
    const cerrar = () => setActivaInmediato(null)
    window.addEventListener('scroll', cerrar, { passive: true })
    return () => window.removeEventListener('scroll', cerrar)
  }, [])

  const alMoverPuntero = (e: PointerEvent<HTMLDivElement>) => {
    if (sinMovimiento || e.pointerType !== 'mouse') return
    const caja = e.currentTarget.getBoundingClientRect()
    puntero.x.set((e.clientX - caja.left) / caja.width)
    puntero.y.set((e.clientY - caja.top) / caja.height)
  }

  const centrarPuntero = () => {
    puntero.x.set(0.5)
    puntero.y.set(0.5)
  }

  const tarjeta = activa && celdas[activa.coordenada]?.estado === 'apadrinada' ? activa : null

  return (
    <>
      <div
        className="relative mt-6 w-full [perspective:1500px]"
        onPointerMove={alMoverPuntero}
        onPointerLeave={centrarPuntero}
      >
        <div
          aria-hidden
          className="absolute inset-x-6 -bottom-8 h-16 rounded-[50%] bg-black/70 blur-2xl"
        />
        <motion.div
          className="relative"
          style={{
            rotateX: sinMovimiento ? INCLINACION_BASE : rotarX,
            rotateY: sinMovimiento ? 0 : rotarY,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative grid [transform-style:preserve-3d] grid-cols-[1.5rem_1fr] gap-x-2 gap-y-1.5 rounded-[3px] bg-[#101216] p-2 shadow-2xl">
            <Paredes />
            <span />
            <div
              className="grid px-[3px]"
              style={{ gridTemplateColumns: `repeat(${COLUMNAS}, minmax(0, 1fr))` }}
            >
              {NUMEROS.map((numero) => (
                <span key={numero} className="text-center text-sm font-semibold text-oro-400/80">
                  {numero}
                </span>
              ))}
            </div>

            <div
              className="grid py-[3px]"
              style={{ gridTemplateRows: `repeat(${FILAS}, minmax(0, 1fr))` }}
            >
              {LETRAS.map((letra) => (
                <span key={letra} className="flex items-center justify-center text-sm font-semibold text-oro-400/80">
                  {letra}
                </span>
              ))}
            </div>

            <div className="relative rounded-[3px] bg-[#08090b] p-[3px] ring-1 ring-black/70">
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${COLUMNAS}, minmax(0, 1fr))` }}
              >
                {LETRAS.flatMap((letra, fila) =>
                  NUMEROS.map((numero, columna) => {
                    const coord = coordenada(letra, numero)
                    return (
                      <Celda
                        key={coord}
                        coordenada={coord}
                        datos={celdas[coord]}
                        seleccionada={seleccionadas?.has(coord) ?? false}
                        girar={(fila + columna) % 2 === 1}
                        retraso={(fila + columna) * RETRASO_POR_DIAGONAL}
                        onActivar={setActiva}
                        onClick={(c) => onSeleccionar?.(c)}
                      />
                    )
                  }),
                )}
              </div>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[3px]"
                style={{
                  backgroundImage:
                    'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.07) 48%, transparent 62%)',
                  backgroundSize: '260% 100%',
                  backgroundPositionX: posicionBrillo,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {tarjeta && <TarjetaNombre key={tarjeta.coordenada} activa={tarjeta} nombre={celdas[tarjeta.coordenada]?.nombre} />}
      </AnimatePresence>
    </>
  )
}

function TarjetaNombre({ activa, nombre }: { activa: CeldaActiva; nombre?: string }) {
  const { rect } = activa
  const abajo = rect.top < MARGEN_TARJETA
  const x = Math.min(Math.max(rect.left + rect.width / 2, MARGEN_TARJETA), window.innerWidth - MARGEN_TARJETA)

  return (
    <div
      className="pointer-events-none fixed z-20"
      style={{
        left: x,
        top: abajo ? rect.bottom + 8 : rect.top - 8,
        transform: `translate(-50%, ${abajo ? '0' : '-100%'})`,
      }}
    >
      <motion.div
        role="tooltip"
        initial={{ opacity: 0, scale: 0.9, y: abajo ? -4 : 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="whitespace-nowrap rounded-lg border border-oro-500/40 bg-piso-800 px-3 py-1.5 text-sm text-white shadow-xl"
      >
        <span className="mr-2 text-oro-400">{activa.coordenada}</span>
        {nombre}
      </motion.div>
    </div>
  )
}
