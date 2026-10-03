import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './firebase'

export async function apadrinarCeldas(coordenadas: string[], nombre: string) {
  const lote = writeBatch(db)
  coordenadas.forEach((coordenada) =>
    lote.set(doc(db, 'celdas', coordenada), { estado: 'apadrinada', nombre, fecha: serverTimestamp() }),
  )
  await lote.commit()
}

export async function liberarCeldas(coordenadas: string[]) {
  const lote = writeBatch(db)
  coordenadas.forEach((coordenada) => lote.delete(doc(db, 'celdas', coordenada)))
  await lote.commit()
}
