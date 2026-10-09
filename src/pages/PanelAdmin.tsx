import { signOut, type User } from 'firebase/auth'
import { useState } from 'react'
import { Boton, EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Cuadricula } from '../components/Cuadricula'
import { ActivarAcceso } from '../components/ActivarAcceso'
import { Encabezado } from '../components/Encabezado'
import { DetalleCelda } from '../components/DetalleCelda'
import { FondoComun } from '../components/FondoComun'
import { LoginAdmin } from '../components/LoginAdmin'
import { PanelAsignacion } from '../components/PanelAsignacion'
import { Progreso } from '../components/Progreso'
import { COLUMNAS, FILAS } from '../config'
import {
  agregarAlFondo,
  apadrinarCeldas,
  eliminarMovimiento,
  eliminarPago,
  quitarAporteDeCelda,
  registrarPagoDePersona,
  usarFondoEnCeldas,
} from '../lib/celdasAdmin'
import {
  CUARTOS_POR_METRO,
  normalizar,
  cuartosLibres,
  estaCompleta,
  etiquetaMetros,
  tieneAportes,
  totalCuartos,
  type Aporte,
} from '../lib/cuartos'
import { ordenarCoordenadas, unirCoordenadas } from '../lib/coordenadas'
import { auth } from '../lib/firebase'
import { centavosDeCuartos, cuentaDe, formatearCentavos, leerMonto } from '../lib/excedentes'
import { esPermisoDenegado, mensajeDeError } from '../lib/mensajesError'
import { useCeldas } from '../lib/useCeldas'
import { useExcedentes } from '../lib/useExcedentes'
import { usePagos } from '../lib/usePagos'
import { useSesion } from '../lib/useSesion'

const TOTAL_CELDAS = COLUMNAS * FILAS
const APORTES_POSIBLES = [4, 2, 1]

export function PanelAdmin() {
  const { usuario, esAdmin, listo } = useSesion()
  const [aviso, setAviso] = useState<string | null>(null)

  return (
    <>
      <Encabezado titulo="Panel de administración" subtitulo="Asigna cada metro a quien lo apadrina." />
      {listo && !esAdmin && (
        <div className="-mb-4 flex w-full max-w-md justify-start">
          <EnlaceBoton href="#/">← Regresar</EnlaceBoton>
        </div>
      )}
      {!listo ? (
        <Cargando texto="Verificando sesión…" />
      ) : !usuario ? (
        <LoginAdmin onAviso={setAviso} />
      ) : !esAdmin ? (
        <ActivarAcceso usuario={usuario} aviso={aviso} onAviso={setAviso} />
      ) : (
        <EditorPiso usuario={usuario} />
      )}
    </>
  )
}

function BarraSesion({ usuario }: { usuario: User }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 text-sm font-bold">
      <span className="text-tinta-suave">{usuario.email}</span>
      <div className="flex gap-3">
        <EnlaceBoton href="#/">Ver mapa público</EnlaceBoton>
        <Boton onClick={() => signOut(auth)}>Cerrar sesión</Boton>
      </div>
    </div>
  )
}

type Mensaje = { tipo: 'ok' | 'error'; texto: string } | null

function EditorPiso({ usuario }: { usuario: User }) {
  const { celdas, cargando, error } = useCeldas()
  const { movimientos, error: errorFondo, reintentar } = useExcedentes()
  const { pagos, cargando: cargandoPagos, error: errorPagos } = usePagos()
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [enfocada, setEnfocada] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [cuartos, setCuartos] = useState(CUARTOS_POR_METRO)
  const [monto, setMonto] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  // Una casilla completa no se puede asignar; si otra persona la completa mientras tanto, se descarta sola.
  const lista = ordenarCoordenadas([...seleccionadas].filter((c) => !estaCompleta(celdas[c])))
  const costoCentavos = centavosDeCuartos(lista.length * cuartos)
  const detalle = enfocada && tieneAportes(celdas[enfocada]) ? enfocada : null

  const alTocarCelda = (coordenada: string) => {
    setMensaje(null)
    const celda = celdas[coordenada]
    setEnfocada(tieneAportes(celda) ? coordenada : null)
    if (estaCompleta(celda)) return

    setSeleccionadas((actuales) => {
      const siguientes = new Set(actuales)
      if (!siguientes.delete(coordenada)) siguientes.add(coordenada)
      return siguientes
    })
  }

  const ejecutar = async (accion: () => Promise<void>, alExito: () => void, mensajeSiDenegado?: string) => {
    setTrabajando(true)
    setMensaje(null)
    try {
      await accion()
      alExito()
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeSiDenegado && esPermisoDenegado(e) ? mensajeSiDenegado : mensajeDeError(e) })
    } finally {
      setTrabajando(false)
    }
  }

  const guardar = () => {
    const quien = nombre.trim()
    const recibido = leerMonto(monto)
    const recibidoCentavos = recibido.estado === 'ok' ? recibido.centavos : 0
    const sobrante = Math.max(0, recibidoCentavos - costoCentavos)
    void ejecutar(
      () => apadrinarCeldas(celdas, lista, quien, cuartos, recibidoCentavos),
      () => {
        const alFondo = sobrante > 0 ? ` Sobraron ${formatearCentavos(sobrante)}: quedaron en el fondo común a nombre de ${quien}.` : ''
        setMensaje({ tipo: 'ok', texto: `Listo: ${etiquetaMetros(cuartos)} en ${unirCoordenadas(lista)} a nombre de ${quien}.${alFondo}` })
        setSeleccionadas(new Set())
        setNombre('')
        setMonto('')
      },
      'Firebase rechazó el cambio. Revisa que las reglas de Firestore (firestore.rules) estén publicadas y que nadie más haya ocupado esa casilla.',
    )
  }

  const pagarConElFondo = () =>
    void ejecutar(
      () => usarFondoEnCeldas(celdas, lista, cuartos),
      () => {
        setMensaje({ tipo: 'ok', texto: `El fondo común pagó ${etiquetaMetros(cuartos)} en ${unirCoordenadas(lista)} (${formatearCentavos(costoCentavos)}).` })
        setSeleccionadas(new Set())
      },
      'Firebase rechazó el cambio. Revisa que las reglas de Firestore (firestore.rules) estén publicadas.',
    )

  const sumarAlFondo = (quien: string, centavos: number) =>
    void ejecutar(
      () => agregarAlFondo(quien, centavos, 'Aporte directo al fondo'),
      () => setMensaje({ tipo: 'ok', texto: `${formatearCentavos(centavos)} de ${quien} quedaron en el fondo común.` }),
      'Firebase rechazó el cambio. Revisa que las reglas de Firestore (firestore.rules) estén publicadas.',
    )

  const registrarDinero = (aporte: Aporte, centavos: number, sobranteNuevo: number) =>
    void ejecutar(
      () => registrarPagoDePersona(aporte.nombre, centavos, sobranteNuevo),
      () => {
        const alFondo = sobranteNuevo > 0 ? ` Sobraron ${formatearCentavos(sobranteNuevo)}: quedaron en el fondo común a nombre de ${aporte.nombre}.` : ''
        setMensaje({ tipo: 'ok', texto: `Se registraron ${formatearCentavos(centavos)} recibidos de ${aporte.nombre}.${alFondo}` })
      },
      'Firebase rechazó el cambio. Revisa que las reglas de Firestore (firestore.rules) estén publicadas.',
    )

  const borrarPago = (id: string) =>
    void ejecutar(
      () => eliminarPago(id),
      () => setMensaje({ tipo: 'ok', texto: 'Se borró el pago registrado. El fondo común no cambia; si hace falta, corrígelo en su historial.' }),
    )

  const borrarMovimiento = (id: string) =>
    void ejecutar(
      () => eliminarMovimiento(id),
      () => setMensaje({ tipo: 'ok', texto: 'Se borró el renglón del historial del fondo.' }),
    )

  const quitar = (aporte: Aporte) => {
    if (!detalle) return
    void ejecutar(
      () => quitarAporteDeCelda(celdas, detalle, aporte.nombre),
      () => {
        // La casilla queda lista para asignarla de nuevo, con el aporte anterior a mano por si solo había que corregirlo.
        setMensaje({ tipo: 'ok', texto: `Se quitó el aporte de ${aporte.nombre} en ${detalle}. La casilla quedó seleccionada.` })
        setSeleccionadas(new Set([...seleccionadas, detalle]))
        if (!nombre.trim()) setNombre(aporte.nombre)
        if (APORTES_POSIBLES.includes(aporte.cuartos)) setCuartos(aporte.cuartos)
      },
    )
  }

  return (
    <>
      <BarraSesion usuario={usuario} />
      {error ? (
        <p role="alert" className="rounded-2xl bg-white/80 px-4 py-3 font-bold">
          No pudimos cargar el piso. Revisa tu conexión e inténtalo de nuevo.
        </p>
      ) : cargando ? (
        <Cargando />
      ) : (
        <>
          <Progreso cuartos={totalCuartos(celdas)} totalMetros={TOTAL_CELDAS} />
          <Cuadricula celdas={celdas} seleccionadas={seleccionadas} onSeleccionar={alTocarCelda} />
          {detalle && (
            <DetalleCelda
              key={detalle}
              coordenada={detalle}
              celda={celdas[detalle]}
              trabajando={trabajando}
              dineroDisponible={!errorPagos && !cargandoPagos}
              cuentaDe={(clave) => cuentaDe(clave, celdas, pagos, movimientos)}
              pagosDe={(clave) => pagos.filter((p) => normalizar(p.nombre) === clave)}
              onQuitar={quitar}
              onRegistrarDinero={registrarDinero}
              onEliminarPago={borrarPago}
              onCerrar={() => setEnfocada(null)}
            />
          )}
          <PanelAsignacion
            seleccionadas={lista.map((coordenada) => ({ coordenada, libres: cuartosLibres(celdas[coordenada]) }))}
            nombre={nombre}
            cuartos={cuartos}
            monto={monto}
            costoCentavos={costoCentavos}
            guardando={trabajando}
            mensaje={mensaje}
            onNombre={setNombre}
            onCuartos={setCuartos}
            onMonto={setMonto}
            onGuardar={guardar}
            onLimpiar={() => setSeleccionadas(new Set())}
          />
          <FondoComun
            movimientos={movimientos}
            costoSeleccionCentavos={costoCentavos}
            error={errorFondo !== null}
            onReintentar={reintentar}
            trabajando={trabajando}
            onUsar={pagarConElFondo}
            onAgregar={sumarAlFondo}
            onEliminar={borrarMovimiento}
          />
        </>
      )}
    </>
  )
}
