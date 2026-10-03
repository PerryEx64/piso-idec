import { Boton } from './Boton'

export type ModoVista = 'planta' | 'perspectiva'

interface ControlesVistaProps {
  modo: ModoVista | null
  onPlanta: () => void
  onPerspectiva: () => void
  onGirar: (grados: number) => void
}

export function ControlesVista({ modo, onPlanta, onPerspectiva, onGirar }: ControlesVistaProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Boton variante={modo === 'planta' ? 'miel' : 'blanco'} aria-pressed={modo === 'planta'} onClick={onPlanta}>
        Planta
      </Boton>
      <Boton
        variante={modo === 'perspectiva' ? 'miel' : 'blanco'}
        aria-pressed={modo === 'perspectiva'}
        onClick={onPerspectiva}
      >
        Perspectiva
      </Boton>
      <Boton aria-label="Girar a la izquierda" onClick={() => onGirar(-45)}>
        ↺
      </Boton>
      <Boton aria-label="Girar a la derecha" onClick={() => onGirar(45)}>
        ↻
      </Boton>
    </div>
  )
}
