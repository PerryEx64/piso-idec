import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export const iniciarSesionConCorreo = (correo: string, contrasena: string) =>
  signInWithEmailAndPassword(auth, correo, contrasena)

export function iniciarSesionConGoogle() {
  const proveedor = new GoogleAuthProvider()
  proveedor.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(auth, proveedor)
}

/**
 * Convierte la cuenta en administradora. El código se valida en `firestore.rules`
 * (no existe en el cliente): si es incorrecto, Firestore responde permission-denied.
 */
export const activarAcceso = (usuario: User, codigo: string) =>
  setDoc(doc(db, 'admins', usuario.uid), { codigo, email: usuario.email ?? '', fecha: serverTimestamp() })

export const registrarConCorreo = (correo: string, contrasena: string) =>
  createUserWithEmailAndPassword(auth, correo, contrasena)
