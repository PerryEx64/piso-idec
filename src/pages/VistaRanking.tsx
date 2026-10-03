import { EnlaceBoton } from '../components/Boton'
import { Cargando } from '../components/Cargando'
import { Encabezado } from '../components/Encabezado'
import { Ranking } from '../components/Ranking'
import { useCeldas } from '../lib/useCeldas'

export function VistaRanking() {
  const { celdas, cargando, error } = useCeldas()

  return (
    <>
      <Encabezado titulo="Ranking" subtitulo="Gracias a quienes más han puesto su nombre en el piso." />
      <div className="-mb-4 flex w-full max-w-xl justify-start">
        <EnlaceBoton href="#/">← Regresar</EnlaceBoton>
      </div>
      {error ? (
        <p role="alert" className="rounded-2xl bg-white/80 px-4 py-3 font-bold text-tinta">
          No pudimos cargar el ranking. Revisa tu conexión e inténtalo de nuevo.
        </p>
      ) : cargando ? (
        <Cargando texto="Cargando el ranking…" />
      ) : (
        <Ranking celdas={celdas} />
      )}
    </>
  )
}
