import { signOut, type User } from 'firebase/auth'
import { useState } from 'react'
import { Boton, EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Cuadricula } from '../components/Cuadricula'
import { ActivarAcceso } from '../components/ActivarAcceso'
import { Encabezado } from '../components/Encabezado'
import { LiberarCelda } from '../components/LiberarCelda'
import { LoginAdmin } from '../components/LoginAdmin'
import { PanelAsignacion } from '../components/PanelAsignacion'
import { Progreso } from '../components/Progreso'
import { COLUMNAS, FILAS } from '../config'
import { apadrinarCeldas, liberarCeldas } from '../lib/celdasAdmin'
import { ordenarCoordenadas, unirCoordenadas } from '../lib/coordenadas'
import { auth } from '../lib/firebase'
import { esPermisoDenegado, mensajeDeError } from '../lib/mensajesError'
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

const estaOcupada = (celdas: CeldasPorCoordenada, coordenada: string) => celdas[coordenada]?.estado === 'apadrinada'

function EditorPiso({ usuario }: { usuario: User }) {
  const { celdas, cargando, error } = useCeldas()
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [ocupadaElegida, setOcupadaElegida] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  // Solo se asignan casillas libres; si alguien ocupa una seleccionada mientras tanto, se descarta sola.
  const lista = ordenarCoordenadas([...seleccionadas].filter((c) => !estaOcupada(celdas, c)))
  const ocupada = ocupadaElegida && estaOcupada(celdas, ocupadaElegida) ? ocupadaElegida : null

  const alTocarCelda = (coordenada: string) => {
    setMensaje(null)
    if (estaOcupada(celdas, coordenada)) return setOcupadaElegida(coordenada)

    setOcupadaElegida(null)
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
      () => apadrinarCeldas(lista, quien),
      () => {
        setMensaje({ tipo: 'ok', texto: `Listo: ${unirCoordenadas(lista)} apadrinadas por ${quien}.` })
        setSeleccionadas(new Set())
        setNombre('')
      },
      'No se pudo guardar. Es posible que alguna casilla ya esté ocupada; revisa el piso e inténtalo de nuevo.',
    )
  }

  const liberar = () => {
    if (!ocupada) return
    const anterior = celdas[ocupada].nombre ?? ''
    void ejecutar(
      () => liberarCeldas([ocupada]),
      () => {
        // La casilla queda lista para asignarla de nuevo, con el nombre anterior a mano por si solo hay que corregirlo.
        setMensaje({ tipo: 'ok', texto: `${ocupada} quedó libre y seleccionada para asignarla.` })
        setSeleccionadas(new Set([...seleccionadas, ocupada]))
        setOcupadaElegida(null)
        if (!nombre.trim()) setNombre(anterior)
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
          <Progreso apadrinadas={Object.keys(celdas).length} total={TOTAL_CELDAS} />
          <Cuadricula celdas={celdas} seleccionadas={seleccionadas} onSeleccionar={alTocarCelda} />
          {ocupada && (
            <LiberarCelda
              key={ocupada}
              coordenada={ocupada}
              nombre={celdas[ocupada].nombre ?? ''}
              liberando={trabajando}
              onLiberar={liberar}
              onCancelar={() => setOcupadaElegida(null)}
            />
          )}
          <PanelAsignacion
            seleccionadas={lista}
            nombre={nombre}
            guardando={trabajando}
            mensaje={mensaje}
            onNombre={setNombre}
            onGuardar={guardar}
            onLimpiar={() => setSeleccionadas(new Set())}
          />
        </>
      )}
    </>
  )
}
