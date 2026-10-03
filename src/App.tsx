import { MotionConfig } from 'framer-motion'
import { Cuadricula } from './components/Cuadricula'
import { Progreso } from './components/Progreso'
import { COLUMNAS, FILAS } from './config'
import { celdasEjemplo } from './data/celdasEjemplo'

const TOTAL_CELDAS = COLUMNAS * FILAS

function App() {
  const apadrinadas = Object.values(celdasEjemplo).filter((c) => c.estado === 'apadrinada').length

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Apadrina un metro</h1>
          <p className="mt-2 text-white/60">Cada metro del piso lleva el nombre de quien lo hizo posible.</p>
        </header>
        <Progreso apadrinadas={apadrinadas} total={TOTAL_CELDAS} />
        <Cuadricula celdas={celdasEjemplo} />
      </main>
    </MotionConfig>
  )
}

export default App
