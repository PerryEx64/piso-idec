import { estiloYeso } from '../lib/texturas'

const ALTURA_PARED = 'h-20'
const ANCHO_PARED_LATERAL = 'w-20'

const yeso = (luz: string) => ({
  ...estiloYeso,
  backgroundColor: luz,
})

const COLORES_ZOCALO = 'from-[#6b4a2b] to-[#3b2714] shadow-[inset_0_1px_0_rgba(255,230,190,0.35)]'

/** Tres paredes que salen del borde del piso, para que la escena se lea como un cuarto. */
export function Paredes() {
  return (
    <div aria-hidden className="pointer-events-none contents">
      <div
        className={`absolute inset-x-0 bottom-full ${ALTURA_PARED} origin-bottom [transform:rotateX(-90deg)]`}
        style={yeso('#4a4036')}
      >
        <div className="absolute inset-0 bg-linear-to-t from-transparent via-black/10 to-black/55" />
        <div className={`absolute inset-x-0 bottom-0 h-3.5 bg-linear-to-b ${COLORES_ZOCALO}`} />
      </div>

      <div
        className={`absolute inset-y-0 right-full ${ANCHO_PARED_LATERAL} origin-right [transform:rotateY(90deg)]`}
        style={yeso('#382f27')}
      >
        <div className="absolute inset-0 bg-linear-to-l from-transparent via-black/15 to-black/60" />
        <div className={`absolute inset-y-0 right-0 w-3.5 bg-linear-to-l ${COLORES_ZOCALO}`} />
      </div>

      <div
        className={`absolute inset-y-0 left-full ${ANCHO_PARED_LATERAL} origin-left [transform:rotateY(-90deg)]`}
        style={yeso('#382f27')}
      >
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/15 to-black/60" />
        <div className={`absolute inset-y-0 left-0 w-3.5 bg-linear-to-r ${COLORES_ZOCALO}`} />
      </div>
    </div>
  )
}
