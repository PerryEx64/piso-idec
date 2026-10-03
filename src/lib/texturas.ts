const hash = (texto: string) => {
  let h = 2166136261
  for (const caracter of texto) h = Math.imul(h ^ caracter.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967295
}

const svgComoFondo = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

const ruido = (semilla: number) =>
  svgComoFondo(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="${semilla}"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.55  0 0 0 0 0.58  0.8 0 0 0 -0.3"/></filter><rect width="100" height="100" filter="url(#f)"/></svg>`,
  )

const vetaMadera = (semilla: number) =>
  svgComoFondo(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.55" numOctaves="4" seed="${semilla}"/><feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.07  0 0 0 0 0.02  2.4 0 0 0 -0.9"/></filter><rect width="100" height="100" filter="url(#f)"/></svg>`,
  )

const SEMILLAS = 12
const semillaDe = (coordenada: string, sal: string) => 1 + Math.floor(hash(coordenada + sal) * SEMILLAS)

/** Concreto de contrapiso: lo que todavía no tiene piso. */
export function estiloConcreto(coordenada: string) {
  const claridad = 17 + hash(coordenada) * 4
  return {
    backgroundColor: `hsl(220 6% ${claridad}%)`,
    backgroundImage: [
      ruido(semillaDe(coordenada, 'c')),
      `radial-gradient(ellipse at ${Math.round(hash(`${coordenada}x`) * 100)}% ${Math.round(hash(`${coordenada}y`) * 100)}%, rgba(255,255,255,0.07), transparent 65%)`,
    ].join(', '),
    backgroundSize: '100% 100%',
  }
}

/** Parquet de tres tablas, con veta y variación de tono por baldosa. */
export function estiloMadera(coordenada: string) {
  const matiz = 24 + hash(`${coordenada}m`) * 8
  const tabla = (sal: string) => {
    const luz = 33 + hash(coordenada + sal) * 12
    return `hsl(${matiz} 52% ${luz}%)`
  }
  const [a, b, c] = [tabla('a'), tabla('b'), tabla('c')]
  const junta = 'rgba(20,9,2,0.7)'
  const brillo = 'rgba(255,225,180,0.12)'

  return {
    backgroundImage: [
      'linear-gradient(135deg, rgba(255,235,200,0.22), transparent 45%)',
      `linear-gradient(to bottom, transparent calc(33.33% - 1px), ${junta} calc(33.33% - 1px), ${junta} 33.33%, ${brillo} 33.33%, transparent calc(33.33% + 1px), transparent calc(66.66% - 1px), ${junta} calc(66.66% - 1px), ${junta} 66.66%, ${brillo} 66.66%, transparent calc(66.66% + 1px))`,
      vetaMadera(semillaDe(coordenada, 'v')),
      `linear-gradient(to bottom, ${a} 0 33.33%, ${b} 33.33% 66.66%, ${c} 66.66% 100%)`,
    ].join(', '),
    backgroundSize: '100% 100%',
  }
}

const ruidoSuave = svgComoFondo(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  0.6 0 0 0 -0.18"/></filter><rect width="200" height="200" filter="url(#f)"/></svg>`,
)

export const estiloYeso = {
  backgroundImage: ruidoSuave,
  backgroundSize: '200px 200px',
}
