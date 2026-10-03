import { FirebaseError } from 'firebase/app'

const MENSAJES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Inicia sesión.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'No hay conexión. Revisa tu internet.',
  'auth/operation-not-allowed': 'Este método de acceso no está habilitado en Firebase.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo que usa otro método de acceso.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).',
  'permission-denied': 'Tu cuenta no tiene permiso para hacer este cambio.',
  unavailable: 'No hay conexión con el servidor. Inténtalo de nuevo.',
}

const CANCELACIONES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

export const esPermisoDenegado = (error: unknown) => error instanceof FirebaseError && error.code === 'permission-denied'

/** El usuario cerró la ventana de Google a propósito: no es un error que mostrar. */
export const esCancelacion = (error: unknown) => error instanceof FirebaseError && CANCELACIONES.includes(error.code)

export function mensajeDeError(error: unknown) {
  if (error instanceof FirebaseError && MENSAJES[error.code]) return MENSAJES[error.code]
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
