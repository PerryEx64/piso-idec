import { useState, type FormEvent } from 'react'
import { activarAcceso, iniciarSesionConCorreo, iniciarSesionConGoogle, registrarConCorreo } from '../lib/acceso'
import { esCancelacion, esPermisoDenegado, mensajeDeError } from '../lib/mensajesError'
import { Boton } from './Boton'
import { CLASE_CAMPO, Tarjeta } from './Tarjeta'

interface LoginAdminProps {
  onAviso: (texto: string | null) => void
}

type Modo = 'entrar' | 'registro'

function LogoGoogle() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function LoginAdmin({ onAviso }: LoginAdminProps) {
  const [modo, setModo] = useState<Modo>('entrar')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const registrando = modo === 'registro'

  const ejecutar = async (accion: () => Promise<unknown>) => {
    setEnviando(true)
    setError(null)
    onAviso(null)
    try {
      await accion()
    } catch (e) {
      if (!esCancelacion(e)) setError(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  const registrar = async () => {
    const { user } = await registrarConCorreo(correo.trim(), contrasena)
    try {
      await activarAcceso(user, codigo.trim())
    } catch (e) {
      // La cuenta ya existe, así que esta pantalla se reemplaza: el aviso viaja a la pantalla de activación.
      onAviso(
        esPermisoDenegado(e)
          ? 'Tu cuenta se creó, pero el código de acceso no es correcto. Escríbelo de nuevo para activarla.'
          : mensajeDeError(e),
      )
    }
  }

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    void ejecutar(registrando ? registrar : () => iniciarSesionConCorreo(correo.trim(), contrasena))
  }

  const cambiarModo = () => {
    setModo(registrando ? 'entrar' : 'registro')
    setError(null)
  }

  return (
    <Tarjeta className="max-w-md">
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{registrando ? 'Crear cuenta' : 'Acceso de administradores'}</h2>

        <Boton disabled={enviando} onClick={() => void ejecutar(iniciarSesionConGoogle)} className="flex items-center justify-center gap-2">
          <LogoGoogle />
          Continuar con Google
        </Boton>

        <div className="flex items-center gap-3 text-xs font-bold text-tinta-suave" aria-hidden>
          <span className="h-0.5 flex-1 rounded bg-tinta/20" />
          o con correo
          <span className="h-0.5 flex-1 rounded bg-tinta/20" />
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-bold">
            Correo
            <input
              type="email"
              required
              autoComplete="username"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={CLASE_CAMPO}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Contraseña
            <input
              type="password"
              required
              minLength={registrando ? 6 : undefined}
              autoComplete={registrando ? 'new-password' : 'current-password'}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className={CLASE_CAMPO}
            />
          </label>
          {registrando && (
            <label className="flex flex-col gap-1 text-sm font-bold">
              Código de acceso
              <input
                required
                autoComplete="off"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Pídelo a quien administra la campaña"
                className={CLASE_CAMPO}
              />
            </label>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-[#ffe1db] px-3 py-2 text-sm font-bold text-[#b3341f]">
              {error}
            </p>
          )}
          <Boton type="submit" variante="miel" disabled={enviando}>
            {enviando ? 'Un momento…' : registrando ? 'Crear cuenta' : 'Entrar'}
          </Boton>
        </form>

        <button
          type="button"
          onClick={cambiarModo}
          className="self-center rounded-lg px-2 py-1 text-sm font-bold text-tinta-suave underline decoration-2 underline-offset-4 outline-none hover:text-tinta focus-visible:ring-[3px] focus-visible:ring-turquesa"
        >
          {registrando ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crear cuenta'}
        </button>
      </div>
    </Tarjeta>
  )
}
