import { MotionConfig } from 'framer-motion'
import { Fondo } from './components/Fondo'
import { useRuta } from './lib/useRuta'
import { PanelAdmin } from './pages/PanelAdmin'
import { VistaPublica } from './pages/VistaPublica'

function App() {
  const ruta = useRuta()

  return (
    <MotionConfig reducedMotion="user">
      <Fondo />
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-10">
        {ruta === 'admin' ? <PanelAdmin /> : <VistaPublica />}
      </main>
    </MotionConfig>
  )
}

export default App
