import { signOut, type User } from 'firebase/auth'
import { useState, type FormEvent } from 'react'
import { activarAcceso } from '../lib/acceso'
import { auth } from '../lib/firebase'
import { esPermisoDenegado, mensajeDeError } from '../lib/mensajesError'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

interface ActivarAccesoProps {
  usuario: User
  aviso: string | null
  onAviso: (texto: string | null) => void
}

/** Cuenta con sesión iniciada pero sin permiso de administrador: pide el código de acceso. */
export function ActivarAcceso({ usuario, aviso, onAviso }: ActivarAccesoProps) {
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activar = async (evento: FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await activarAcceso(usuario, codigo.trim())
      onAviso(null)
    } catch (e) {
      setError(esPermisoDenegado(e) ? 'El código de acceso no es correcto.' : mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  const cerrarSesion = () => {
    onAviso(null)
    void signOut(auth)
  }

  return (
    <Tarjeta className="max-w-md">
      <form onSubmit={activar} className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Activa tu acceso</h2>
        <p className="font-bold">
          Entraste como <span className="text-naranja">{usuario.email}</span>. Escribe el código de acceso para poder asignar
          metros.
        </p>
        {(aviso || error) && (
          <p role="alert" className="rounded-xl bg-[#ffe1db] px-3 py-2 text-sm font-bold text-[#b3341f]">
            {error ?? aviso}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm font-bold">
          Código de acceso
          <input required autoComplete="off" value={codigo} onChange={(e) => setCodigo(e.target.value)} className={CLASE_CAMPO} />
        </label>
        <div className="flex flex-wrap gap-3">
          <Boton type="submit" variante="miel" disabled={enviando}>
            {enviando ? 'Verificando…' : 'Activar'}
          </Boton>
          <Boton onClick={cerrarSesion}>Cerrar sesión</Boton>
        </div>
      </form>
    </Tarjeta>
  )
}
