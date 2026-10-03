import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from './firebase'

interface Sesion {
  usuario: User | null
  esAdmin: boolean
  listo: boolean
}

interface Verificacion {
  uid: string
  esAdmin: boolean
}

/** Usuario con sesión iniciada y si figura como administrador en `admins/{uid}` (en tiempo real). */
export function useSesion(): Sesion {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined)
  const [verificacion, setVerificacion] = useState<Verificacion | null>(null)

  useEffect(() => onAuthStateChanged(auth, setUsuario), [])

  const uid = usuario?.uid
  useEffect(() => {
    if (!uid) return
    return onSnapshot(
      doc(db, 'admins', uid),
      (instantanea) => setVerificacion({ uid, esAdmin: instantanea.exists() }),
      () => setVerificacion({ uid, esAdmin: false }),
    )
  }, [uid])

  const verificado = usuario ? verificacion?.uid === usuario.uid : false
  return {
    usuario: usuario ?? null,
    esAdmin: verificado && verificacion?.esAdmin === true,
    listo: usuario === null || verificado,
  }
}
