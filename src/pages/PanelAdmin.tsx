import { signOut, type User } from 'firebase/auth'
import { useState } from 'react'
import { Boton, EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Cuadricula } from '../components/Cuadricula'
import { ActivarAcceso } from '../components/ActivarAcceso'
import { Encabezado } from '../components/Encabezado'
import { LoginAdmin } from '../components/LoginAdmin'
import { PanelAsignacion } from '../components/PanelAsignacion'
import { Progreso } from '../components/Progreso'
import { COLUMNAS, FILAS } from '../config'
import { apadrinarCeldas, liberarCeldas } from '../lib/celdasAdmin'
import { ordenarCoordenadas, unirCoordenadas } from '../lib/coordenadas'
import { auth } from '../lib/firebase'
import { mensajeDeError } from '../lib/mensajesError'
import { useCeldas } from '../lib/useCeldas'
import { useSesion } from '../lib/useSesion'
import type { CeldasPorCoordenada } from '../types'

const TOTAL_CELDAS = COLUMNAS * FILAS

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

/** Si todas las celdas seleccionadas ya tienen el mismo nombre, lo sugiere para editarlo. */
function nombreCompartido(seleccionadas: Set<string>, celdas: CeldasPorCoordenada) {
  const nombres = new Set([...seleccionadas].map((c) => celdas[c]?.nombre))
  const [unico] = nombres
  return nombres.size === 1 && unico ? unico : null
}

function EditorPiso({ usuario }: { usuario: User }) {
  const { celdas, cargando, error } = useCeldas()
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const alternarCelda = (coordenada: string) => {
    const siguientes = new Set(seleccionadas)
    if (!siguientes.delete(coordenada)) siguientes.add(coordenada)
    setSeleccionadas(siguientes)
    setMensaje(null)
    const sugerido = nombreCompartido(siguientes, celdas)
    if (sugerido) setNombre(sugerido)
  }

  const lista = ordenarCoordenadas(seleccionadas)
  const hayApadrinadas = lista.some((c) => celdas[c]?.estado === 'apadrinada')

  const ejecutar = async (accion: () => Promise<void>, textoOk: string) => {
    setGuardando(true)
    setMensaje(null)
    try {
      await accion()
      setMensaje({ tipo: 'ok', texto: textoOk })
      setSeleccionadas(new Set())
      setNombre('')
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(e) })
    } finally {
      setGuardando(false)
    }
  }

  const guardar = () =>
    ejecutar(() => apadrinarCeldas(lista, nombre.trim()), `Listo: ${unirCoordenadas(lista)} apadrinadas por ${nombre.trim()}.`)

  const liberar = () => ejecutar(() => liberarCeldas(lista), `Se liberaron ${unirCoordenadas(lista)}.`)

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
          <Progreso apadrinadas={Object.keys(celdas).length} total={TOTAL_CELDAS} />
          <Cuadricula celdas={celdas} seleccionadas={seleccionadas} onSeleccionar={alternarCelda} />
          <PanelAsignacion
            seleccionadas={lista}
            hayApadrinadas={hayApadrinadas}
            nombre={nombre}
            guardando={guardando}
            mensaje={mensaje}
            onNombre={setNombre}
            onGuardar={guardar}
            onLiberar={liberar}
            onLimpiar={() => setSeleccionadas(new Set())}
          />
        </>
      )}
    </>
  )
}
