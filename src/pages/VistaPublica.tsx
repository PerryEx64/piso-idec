import { EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Cuadricula } from '../components/Cuadricula'
import { Encabezado } from '../components/Encabezado'
import { Progreso } from '../components/Progreso'
import { COLUMNAS, FILAS } from '../config'
import { useCeldas } from '../lib/useCeldas'
import { useSesion } from '../lib/useSesion'

const TOTAL_CELDAS = COLUMNAS * FILAS

export function VistaPublica() {
  const { celdas, cargando, error } = useCeldas()
  const { usuario } = useSesion()

  return (
    <>
      {usuario && (
        <div className="flex w-full justify-end">
          <EnlaceBoton href="#/admin">Volver al panel</EnlaceBoton>
        </div>
      )}
      <Encabezado titulo="Apadrina un metro" subtitulo="Cada metro del piso lleva el nombre de quien lo hizo posible." />
      {error ? (
        <p role="alert" className="rounded-2xl bg-white/80 px-4 py-3 font-bold text-tinta">
          No pudimos cargar el piso. Revisa tu conexión e inténtalo de nuevo.
        </p>
      ) : cargando ? (
        <Cargando />
      ) : (
        <>
          <Progreso apadrinadas={Object.keys(celdas).length} total={TOTAL_CELDAS} />
          <Cuadricula celdas={celdas} />
        </>
      )}
      {!usuario && (
        <a
          href="#/admin"
          className="mt-auto rounded-lg px-2 py-1 text-sm font-bold text-tinta-suave underline decoration-2 underline-offset-4 outline-none hover:text-tinta focus-visible:ring-[3px] focus-visible:ring-turquesa"
        >
          Acceso para administradores
        </a>
      )}
    </>
  )
}
