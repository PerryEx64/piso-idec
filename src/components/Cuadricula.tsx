import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type PanInfo,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { COLUMNAS, FILAS } from '../config'
import { LETRAS, NUMEROS, coordenada } from '../lib/coordenadas'
import { GiroInversoContexto } from '../lib/vista'
import type { CeldaActiva, CeldasPorCoordenada } from '../types'
import { Celda } from './Celda'
import { ControlesVista, type ModoVista } from './ControlesVista'
import { Paredes } from './Paredes'

interface CuadriculaProps {
  celdas: CeldasPorCoordenada
  seleccionadas?: ReadonlySet<string>
  onSeleccionar?: (coordenada: string) => void
}

const INCLINACION_PERSPECTIVA = 52
const INCLINACION_MAXIMA = 70
const GIRO_PERSPECTIVA = -18
const GRADOS_POR_PIXEL_GIRO = 0.4
const GRADOS_POR_PIXEL_INCLINACION = 0.3
const RELACION_FONDO_ANCHO = 0.8
const RETRASO_POR_DIAGONAL = 0.035
const MARGEN_TARJETA = 70
const TRANSICION_VISTA = { type: 'spring', stiffness: 80, damping: 18 } as const

const limitar = (valor: number, min: number, max: number) => Math.min(Math.max(valor, min), max)
const aRadianes = (grados: number) => (grados * Math.PI) / 180

export function Cuadricula({ celdas, seleccionadas, onSeleccionar }: CuadriculaProps) {
  const [activa, setActivaInmediato] = useState<CeldaActiva | null>(null)
  const [modo, setModo] = useState<ModoVista | null>('perspectiva')
  const temporizadorCierre = useRef<number>(0)
  const arrastrando = useRef(false)
  const animaciones = useRef<AnimationPlaybackControls[]>([])
  const sinMovimiento = useReducedMotion()

  const inclinacion = useMotionValue(INCLINACION_PERSPECTIVA)
  const giro = useMotionValue(GIRO_PERSPECTIVA)
  const giroInverso = useTransform(giro, (g) => -g)
  // Encoge el piso al girarlo para que nunca se salga del ancho de la pantalla.
  const escala = useTransform(giro, (g) => {
    const rad = aRadianes(g)
    return Math.min(1, 1 / (Math.abs(Math.cos(rad)) + RELACION_FONDO_ANCHO * Math.abs(Math.sin(rad))))
  })
  const posicionBrillo = useTransform(giro, (g) => `${50 + 50 * Math.sin(aRadianes(g))}%`)

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

  const detenerAnimaciones = () => {
    animaciones.current.forEach((a) => a.stop())
    animaciones.current = []
  }

  const irA = (destino: { inclinacion?: number; giro?: number }) => {
    detenerAnimaciones()
    const opciones = sinMovimiento ? { duration: 0 } : TRANSICION_VISTA
    if (destino.inclinacion !== undefined) animaciones.current.push(animate(inclinacion, destino.inclinacion, opciones))
    if (destino.giro !== undefined) animaciones.current.push(animate(giro, destino.giro, opciones))
  }

  const vueltaCompletaMasCercana = () => Math.round(giro.get() / 360) * 360

  const verPlanta = () => {
    setModo('planta')
    irA({ inclinacion: 0, giro: vueltaCompletaMasCercana() })
  }

  const verPerspectiva = () => {
    setModo('perspectiva')
    irA({ inclinacion: INCLINACION_PERSPECTIVA, giro: vueltaCompletaMasCercana() + GIRO_PERSPECTIVA })
  }

  const girar = (grados: number) => {
    setModo(null)
    irA({ giro: giro.get() + grados })
  }

  const alEmpezarArrastre = () => {
    arrastrando.current = true
    detenerAnimaciones()
    setModo(null)
    setActivaInmediato(null)
  }

  const alArrastrar = (_: unknown, info: PanInfo) => {
    giro.set(giro.get() - info.delta.x * GRADOS_POR_PIXEL_GIRO)
    inclinacion.set(limitar(inclinacion.get() - info.delta.y * GRADOS_POR_PIXEL_INCLINACION, 0, INCLINACION_MAXIMA))
  }

  const alTerminarArrastre = () => {
    // El clic que sigue al soltar no debe contar como selección de una celda.
    window.setTimeout(() => {
      arrastrando.current = false
    }, 50)
  }

  const tarjeta = activa && celdas[activa.coordenada]?.estado === 'apadrinada' ? activa : null

  return (
    <GiroInversoContexto.Provider value={giroInverso}>
      <div className="flex w-full flex-col items-center gap-6">
        <motion.div
          className="relative w-full cursor-grab px-6 py-10 touch-pan-y select-none [perspective:2200px] active:cursor-grabbing"
          onPanStart={alEmpezarArrastre}
          onPan={alArrastrar}
          onPanEnd={alTerminarArrastre}
          onClickCapture={(e) => {
            if (arrastrando.current) e.stopPropagation()
          }}
        >
          <motion.div
            className="relative [transform-style:preserve-3d]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
          <motion.div className="relative [transform-style:preserve-3d]" style={{ rotateX: inclinacion, scale: escala }}>
            <motion.div className="relative [transform-style:preserve-3d]" style={{ rotateZ: giro }}>
              <div
                aria-hidden
                className="absolute -inset-3 rounded-md bg-[#7a4e24]/40 blur-xl"
                style={{ transform: 'translateZ(-2px)' }}
              />
              <div className="relative grid grid-cols-[1.5rem_1fr] gap-x-2 gap-y-1.5 rounded-[8px] bg-[#ffe6b3] p-2.5 shadow-[inset_0_0_0_3px_rgba(91,58,30,0.55)] [transform-style:preserve-3d]">
                <Paredes giro={giro} inclinacion={inclinacion} />
                <span />
                <div className="grid px-[5px]" style={{ gridTemplateColumns: `repeat(${COLUMNAS}, minmax(0, 1fr))` }}>
                  {NUMEROS.map((numero) => (
                    <motion.span
                      key={numero}
                      style={{ rotate: giroInverso }}
                      className="block text-center font-display text-sm font-semibold text-tinta"
                    >
                      {numero}
                    </motion.span>
                  ))}
                </div>

                <div className="grid py-[5px]" style={{ gridTemplateRows: `repeat(${FILAS}, minmax(0, 1fr))` }}>
                  {LETRAS.map((letra) => (
                    <div key={letra} className="flex items-center justify-center">
                      <motion.span style={{ rotate: giroInverso }} className="block font-display text-base font-bold text-tinta">
                        {letra}
                      </motion.span>
                    </div>
                  ))}
                </div>

                <div className="relative rounded-[10px] bg-[#b98a4e] p-[5px] ring-[3px] ring-[#6e4519]">
                  <div className="grid gap-[4px]" style={{ gridTemplateColumns: `repeat(${COLUMNAS}, minmax(0, 1fr))` }}>
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
                    className="pointer-events-none absolute inset-0 rounded-[10px]"
                    style={{
                      backgroundImage:
                        'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 48%, transparent 62%)',
                      backgroundSize: '260% 100%',
                      backgroundPositionX: posicionBrillo,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
          </motion.div>
        </motion.div>

        <ControlesVista modo={modo} onPlanta={verPlanta} onPerspectiva={verPerspectiva} onGirar={girar} />
      </div>

      <AnimatePresence>
        {tarjeta && <TarjetaNombre key={tarjeta.coordenada} activa={tarjeta} nombre={celdas[tarjeta.coordenada]?.nombre} />}
      </AnimatePresence>
    </GiroInversoContexto.Provider>
  )
}

function TarjetaNombre({ activa, nombre }: { activa: CeldaActiva; nombre?: string }) {
  const { rect } = activa
  const abajo = rect.top < MARGEN_TARJETA
  const x = limitar(rect.left + rect.width / 2, MARGEN_TARJETA, window.innerWidth - MARGEN_TARJETA)

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
        initial={{ opacity: 0, scale: 0.5, y: abajo ? -8 : 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className="flex items-center gap-2 whitespace-nowrap rounded-2xl border-2 border-tinta bg-white px-3 py-1.5 font-bold text-tinta shadow-[0_3px_0_#5b3a1e]"
      >
        <span className="rounded-lg bg-miel px-1.5 py-0.5 font-display text-xs text-white [text-shadow:0_1px_0_#a15a1c]">
          {activa.coordenada}
        </span>
        {nombre}
      </motion.div>
    </div>
  )
}
