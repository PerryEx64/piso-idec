const hash = (texto: string) => {
  let h = 2166136261
  for (const caracter of texto) h = Math.imul(h ^ caracter.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967295
}

const svgComoFondo = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

const MADERAS = [
  ['#f0b172', '#e29a58', '#f5bd82'],
  ['#e8a05e', '#d9894a', '#efae6e'],
  ['#dd8f4e', '#cc7a3c', '#e8a063'],
  ['#f3b87a', '#e5a062', '#ec9f5a'],
]

const vetas = (coordenada: string) => {
  const y1 = 7 + hash(`${coordenada}g1`) * 8
  const y2 = 17 + hash(`${coordenada}g2`) * 8
  return svgComoFondo(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">` +
      `<path d="M0 ${y1} Q25 ${y1 - 5} 50 ${y1} T100 ${y1}" fill="none" stroke="rgba(130,65,20,0.32)" stroke-width="1.8" stroke-linecap="round"/>` +
      `<path d="M0 ${y2} Q30 ${y2 + 4} 62 ${y2} T100 ${y2 - 2}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.6" stroke-linecap="round"/>` +
      `</svg>`,
  )
}

/** Losa clara de arena: lo que todavía no tiene piso. Estilo ilustrado, sin ruido fotográfico. */
export function estiloArena(coordenada: string) {
  const luz = 84 + hash(coordenada) * 4
  const punto = (sal: string) =>
    `radial-gradient(circle at ${Math.round(hash(coordenada + sal) * 90 + 5)}% ${Math.round(hash(coordenada + sal + 'y') * 90 + 5)}%, rgba(170,140,95,0.3) 0 1.5px, transparent 2px)`

  return {
    backgroundColor: `hsl(38 42% ${luz}%)`,
    backgroundImage: [punto('a'), punto('b'), punto('c'), 'linear-gradient(160deg, rgba(255,255,255,0.6), rgba(255,255,255,0) 55%)'].join(', '),
  }
}

/** Parquet de tres tablas con colores cálidos, vetas dibujadas y brillo superior. */
export function estiloMadera(coordenada: string) {
  const paleta = MADERAS[Math.floor(hash(`${coordenada}p`) * MADERAS.length)]
  const [a, b, c] = paleta
  const veta = vetas(coordenada)
  const tercio = '100% 33.333%'

  return {
    backgroundImage: [
      'linear-gradient(to bottom, rgba(100,50,15,0.65) 0 2px, transparent 2px)',
      'linear-gradient(to bottom, rgba(255,255,255,0.32), transparent 45%)',
      veta,
      `linear-gradient(to bottom, ${a} 0 33.333%, ${b} 33.333% 66.666%, ${c} 66.666% 100%)`,
    ].join(', '),
    backgroundSize: `${tercio}, ${tercio}, ${tercio}, 100% 100%`,
    backgroundRepeat: 'repeat-y, repeat-y, repeat-y, no-repeat',
  }
}
