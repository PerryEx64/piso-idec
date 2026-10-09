import { PRECIO_METRO_QUETZALES } from '../config'
import type { CeldasPorCoordenada } from '../types'
import { CUARTOS_POR_METRO, normalizar } from './cuartos'
import { formatearQuetzales } from './quetzales'

/** Nombre con el que se registran en el piso los cuartos pagados con el fondo común. */
export const FONDO_COMUN_NOMBRE = 'Fondo común'

export const NOTA_APORTE_DIRECTO = 'Aporte directo al fondo'

export interface Movimiento {
  id: string
  nombre: string
  /** Positivo cuando alguien deja un excedente; negativo cuando el fondo paga cuartos de metro. */
  centavos: number
  tipo: 'excedente' | 'uso'
  /** 'casillas' = sobrante de lo que la persona apadrinó; 'directo' = dinero que dejó solo para el fondo. */
  origen: 'casillas' | 'directo'
  nota: string
  fecha: Date | null
}

/** Los montos del fondo se guardan en centavos para no arrastrar errores de decimales. */
export const centavosDeCuartos = (cuartos: number) => Math.round((cuartos * PRECIO_METRO_QUETZALES * 100) / CUARTOS_POR_METRO)

export const formatearCentavos = (centavos: number) => formatearQuetzales(centavos / 100)

export const saldoDelFondo = (movimientos: Movimiento[]) => movimientos.reduce((suma, m) => suma + m.centavos, 0)

export interface Aportante {
  clave: string
  nombre: string
  centavos: number
}

/** Cuánto ha dejado cada persona en el fondo, de mayor a menor. */
export function aportantesDelFondo(movimientos: Movimiento[]): Aportante[] {
  const porPersona = new Map<string, Aportante>()
  for (const { nombre, centavos, tipo } of movimientos) {
    if (tipo !== 'excedente') continue
    const clave = normalizar(nombre)
    const actual = porPersona.get(clave)
    if (actual) actual.centavos += centavos
    else porPersona.set(clave, { clave, nombre, centavos })
  }
  return [...porPersona.values()].sort((a, b) => b.centavos - a.centavos || a.nombre.localeCompare(b.nombre, 'es'))
}

export type Monto = { estado: 'vacio' } | { estado: 'invalido' } | { estado: 'ok'; centavos: number }

const MAXIMO_CENTAVOS = 100_000_000

/** Lee un monto escrito a mano: "100", "82.50", "82,50", "1,000" y "Q1,000.50" son válidos. */
export function leerMonto(texto: string): Monto {
  const limpio = texto.trim().replace(/^Q\s*/i, '')
  if (!limpio) return { estado: 'vacio' }

  let normal: string
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(limpio)) normal = limpio.replace(/,/g, '')
  else if (/^\d+(\.\d{1,2})?$/.test(limpio)) normal = limpio
  else if (/^\d+,\d{1,2}$/.test(limpio)) normal = limpio.replace(',', '.')
  else return { estado: 'invalido' }

  const centavos = Math.round(Number(normal) * 100)
  return centavos > 0 && centavos <= MAXIMO_CENTAVOS ? { estado: 'ok', centavos } : { estado: 'invalido' }
}

/** Dinero que una persona entregó (aparte de lo que sobre, que va al fondo). */
export interface Pago {
  id: string
  nombre: string
  centavos: number
  nota: string
  fecha: Date | null
}

export interface CuentaPersona {
  /** Cuartos de metro que tiene en todo el piso. */
  cuartos: number
  costoCentavos: number
  /** Dinero que se le ha registrado como recibido. */
  pagadoCentavos: number
  /** Sobrante suyo que ya está en el fondo por sus casillas. */
  sobranteCentavos: number
}

/** Resume cuánto tiene una persona en el piso, cuánto ha entregado y cuánto sobrante suyo ya está en el fondo. */
export function cuentaDe(clave: string, celdas: CeldasPorCoordenada, pagos: Pago[], movimientos: Movimiento[] = []): CuentaPersona {
  let cuartos = 0
  for (const celda of Object.values(celdas)) {
    for (const dueno of celda.cuartos) if (dueno && normalizar(dueno) === clave) cuartos += 1
  }
  return {
    cuartos,
    costoCentavos: centavosDeCuartos(cuartos),
    pagadoCentavos: pagos.filter((p) => normalizar(p.nombre) === clave).reduce((suma, p) => suma + p.centavos, 0),
    sobranteCentavos: movimientos
      .filter((m) => m.tipo === 'excedente' && m.origen === 'casillas' && normalizar(m.nombre) === clave)
      .reduce((suma, m) => suma + m.centavos, 0),
  }
}

export type EstadoPago = 'pagado' | 'parcial' | 'sin_pago'

/** Si la persona ya entregó lo que cuestan sus metros, solo una parte, o nada. */
export function estadoDePago({ costoCentavos, pagadoCentavos }: CuentaPersona): { estado: EstadoPago; faltaCentavos: number } {
  if (pagadoCentavos >= costoCentavos) return { estado: 'pagado', faltaCentavos: 0 }
  return { estado: pagadoCentavos > 0 ? 'parcial' : 'sin_pago', faltaCentavos: costoCentavos - pagadoCentavos }
}
