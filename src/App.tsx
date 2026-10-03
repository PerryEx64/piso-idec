import { MotionConfig, motion } from 'framer-motion'
import { Cuadricula } from './components/Cuadricula'
import { Fondo } from './components/Fondo'
import { Progreso } from './components/Progreso'
import { COLUMNAS, FILAS } from './config'
import { celdasEjemplo } from './data/celdasEjemplo'

const TOTAL_CELDAS = COLUMNAS * FILAS

function App() {
  const apadrinadas = Object.values(celdasEjemplo).filter((c) => c.estado === 'apadrinada').length

  return (
    <MotionConfig reducedMotion="user">
      <Fondo />
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-10">
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-tinta [text-shadow:0_3px_0_rgba(255,255,255,0.8)] sm:text-5xl">
            Apadrina un metro
          </h1>
          <p className="mt-2 text-lg font-bold text-tinta-suave">Cada metro del piso lleva el nombre de quien lo hizo posible.</p>
        </motion.header>
        <Progreso apadrinadas={apadrinadas} total={TOTAL_CELDAS} />
        <Cuadricula celdas={celdasEjemplo} />
      </main>
    </MotionConfig>
  )
}

export default App
