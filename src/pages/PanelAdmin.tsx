import { signOut, type User } from 'firebase/auth'
import { useState } from 'react'
import { Boton, EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Cuadricula } from '../components/Cuadricula'
import { ActivarAcceso } from '../components/ActivarAcceso'
import { Encabezado } from '../components/Encabezado'
import { DetalleCelda } from '../components/DetalleCelda'
import { LoginAdmin } from '../components/LoginAdmin'
import { PanelAsignacion } from '../components/PanelAsignacion'
import { Progreso } from '../components/Progreso'
import { COLUMNAS, FILAS } from '../config'
import { apadrinarCeldas, quitarAporteDeCelda } from '../lib/celdasAdmin'
import {
  CUARTOS_POR_METRO,
  cuartosLibres,
  estaCompleta,
  etiquetaMetros,
  tieneAportes,
  totalCuartos,
  type Aporte,
} from '../lib/cuartos'
import { ordenarCoordenadas, unirCoordenadas } from '../lib/coordenadas'
import { auth } from '../lib/firebase'
import { esPermisoDenegado, mensajeDeError } from '../lib/mensajesError'
import { useCeldas } from '../lib/useCeldas'
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
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [enfocada, setEnfocada] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [cuartos, setCuartos] = useState(CUARTOS_POR_METRO)
  const [trabajando, setTrabajando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  // Una casilla completa no se puede asignar; si otra persona la completa mientras tanto, se descarta sola.
  const lista = ordenarCoordenadas([...seleccionadas].filter((c) => !estaCompleta(celdas[c])))
  const detalle = enfocada && tieneAportes(celdas[enfocada]) ? enfocada : null

  const alTocarCelda = (coordenada: string) => {
    setMensaje(null)
    const celda = celdas[coordenada]
    setEnfocada(tieneAportes(celda) ? coordenada : null)
    if (estaCompleta(celda)) return

    const siguientes = new Set(seleccionadas)
    if (!siguientes.delete(coordenada)) siguientes.add(coordenada)
    setSeleccionadas(siguientes)
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
    void ejecutar(
      () => apadrinarCeldas(celdas, lista, quien, cuartos),
      () => {
        setMensaje({ tipo: 'ok', texto: `Listo: ${etiquetaMetros(cuartos)} en ${unirCoordenadas(lista)} a nombre de ${quien}.` })
        setSeleccionadas(new Set())
        setNombre('')
      },
      'Firebase rechazó el cambio. Revisa que las reglas de Firestore (firestore.rules) estén publicadas y que nadie más haya ocupado esa casilla.',
    )
  }

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
              onQuitar={quitar}
              onCerrar={() => setEnfocada(null)}
            />
          )}
          <PanelAsignacion
            seleccionadas={lista.map((coordenada) => ({ coordenada, libres: cuartosLibres(celdas[coordenada]) }))}
            nombre={nombre}
            cuartos={cuartos}
            guardando={trabajando}
            mensaje={mensaje}
            onNombre={setNombre}
            onCuartos={setCuartos}
            onGuardar={guardar}
            onLimpiar={() => setSeleccionadas(new Set())}
          />
        </>
      )}
    </>
  )
}
