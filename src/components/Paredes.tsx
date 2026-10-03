import { motion, useTransform, type MotionValue } from 'framer-motion'
import type { CSSProperties } from 'react'

const ALTO = 50
const ALTO_MINIMO = 7
const GROSOR = 12

const COLOR_TAPA = '#fffdf5'
const CONTORNO = 'inset 0 0 0 3px rgba(60,35,15,0.65)'
const ZOCALO = 'from-[#fffaf0] to-[#f1dfba] shadow-[inset_0_0_0_2px_rgba(91,58,30,0.35)]'
const RAYAS = 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 12px, transparent 12px 24px)'

type Lado = 'norte' | 'sur' | 'oeste' | 'este'

interface Geometria {
  /** Dimensión que crece al subir el muro: height para los muros horizontales, width para los laterales. */
  medida: 'height' | 'width'
  origen: string
  levantar: string
  interior: CSSProperties
  exterior: CSSProperties
  tapa: CSSProperties
  colorInterior: string
  colorExterior: string
  sombra: string
  zocalo: string
  /** Hacia dónde mira el muro por fuera, en el plano del piso (x derecha, y abajo). */
  normal: [number, number]
}

const G = GROSOR
const MUROS: Record<Lado, Geometria> = {
  norte: {
    medida: 'height',
    origen: 'bottom',
    levantar: 'rotateX(-90deg)',
    interior: { bottom: '100%', left: -G, right: -G },
    exterior: { bottom: `calc(100% + ${G}px)`, left: -G, right: -G },
    tapa: { bottom: '100%', left: -G, right: -G, height: G },
    colorInterior: '#4fb3e8',
    colorExterior: '#2f8fc4',
    sombra: 'bg-linear-to-t',
    zocalo: 'inset-x-0 bottom-0 h-3 bg-linear-to-b',
    normal: [0, -1],
  },
  sur: {
    medida: 'height',
    origen: 'top',
    levantar: 'rotateX(90deg)',
    interior: { top: '100%', left: -G, right: -G },
    exterior: { top: `calc(100% + ${G}px)`, left: -G, right: -G },
    tapa: { top: '100%', left: -G, right: -G, height: G },
    colorInterior: '#ff9d76',
    colorExterior: '#e0734a',
    sombra: 'bg-linear-to-b',
    zocalo: 'inset-x-0 top-0 h-3 bg-linear-to-t',
    normal: [0, 1],
  },
  oeste: {
    medida: 'width',
    origen: 'right',
    levantar: 'rotateY(90deg)',
    interior: { top: 0, bottom: 0, right: '100%' },
    exterior: { top: -G, bottom: -G, right: `calc(100% + ${G}px)` },
    tapa: { top: 0, bottom: 0, right: '100%', width: G },
    colorInterior: '#ff9d76',
    colorExterior: '#e0734a',
    sombra: 'bg-linear-to-l',
    zocalo: 'inset-y-0 right-0 w-3 bg-linear-to-l',
    normal: [-1, 0],
  },
  este: {
    medida: 'width',
    origen: 'left',
    levantar: 'rotateY(-90deg)',
    interior: { top: 0, bottom: 0, left: '100%' },
    exterior: { top: -G, bottom: -G, left: `calc(100% + ${G}px)` },
    tapa: { top: 0, bottom: 0, left: '100%', width: G },
    colorInterior: '#ffb86b',
    colorExterior: '#e68a3a',
    sombra: 'bg-linear-to-r',
    zocalo: 'inset-y-0 left-0 w-3 bg-linear-to-r',
    normal: [1, 0],
  },
}

const limitar = (valor: number, min: number, max: number) => Math.min(Math.max(valor, min), max)

/** Los muros que miran hacia el espectador se bajan para no tapar el piso; en planta se ven todos. */
function useAlturaMuro(giro: MotionValue<number>, inclinacion: MotionValue<number>, [nx, ny]: [number, number]) {
  return useTransform([giro, inclinacion], ([g, t]: number[]) => {
    const rad = (g * Math.PI) / 180
    const mirandoAlEspectador = nx * Math.sin(rad) + ny * Math.cos(rad)
    const bajar = limitar((mirandoAlEspectador - 0.15) / 0.5, 0, 1) * limitar(t / 25, 0, 1)
    return ALTO - (ALTO - ALTO_MINIMO) * bajar
  })
}

interface MuroProps {
  lado: Lado
  altura: MotionValue<number>
}

function Muro({ lado, altura }: MuroProps) {
  const g = MUROS[lado]
  const cara = (posicion: CSSProperties, color: string): CSSProperties => ({
    ...posicion,
    [g.medida]: altura,
    transformOrigin: g.origen,
    transform: g.levantar,
    backgroundColor: color,
    boxShadow: CONTORNO,
  })

  return (
    <>
      <motion.div className="absolute" style={cara(g.interior, g.colorInterior)}>
        <div className="absolute inset-0" style={{ backgroundImage: RAYAS }} />
        <div className={`absolute inset-0 ${g.sombra} from-transparent to-white/30`} />
        <div className={`absolute ${g.zocalo} ${ZOCALO}`} />
      </motion.div>
      <motion.div className="absolute" style={cara(g.exterior, g.colorExterior)} />
      <motion.div
        className="absolute"
        style={{ ...g.tapa, z: altura, backgroundColor: COLOR_TAPA, boxShadow: CONTORNO }}
      />
    </>
  )
}

interface ParedesProps {
  giro: MotionValue<number>
  inclinacion: MotionValue<number>
}

/** Cuatro muros bajos con grosor, como una maqueta de planta arquitectónica. */
export function Paredes({ giro, inclinacion }: ParedesProps) {
  const norte = useAlturaMuro(giro, inclinacion, MUROS.norte.normal)
  const sur = useAlturaMuro(giro, inclinacion, MUROS.sur.normal)
  const oeste = useAlturaMuro(giro, inclinacion, MUROS.oeste.normal)
  const este = useAlturaMuro(giro, inclinacion, MUROS.este.normal)

  return (
    <div aria-hidden className="pointer-events-none contents">
      <Muro lado="norte" altura={norte} />
      <Muro lado="sur" altura={sur} />
      <Muro lado="oeste" altura={oeste} />
      <Muro lado="este" altura={este} />
    </div>
  )
}
