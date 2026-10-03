import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { Fondo } from './components/Fondo'
import { useRuta } from './lib/useRuta'
import { PanelAdmin } from './pages/PanelAdmin'
import { VistaPublica } from './pages/VistaPublica'
import { VistaRanking } from './pages/VistaRanking'

function App() {
  const ruta = useRuta()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ruta])

  return (
    <MotionConfig reducedMotion="user">
      <Fondo />
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-8 px-4 py-10">
        {ruta === 'admin' ? <PanelAdmin /> : ruta === 'ranking' ? <VistaRanking /> : <VistaPublica />}
      </main>
    </MotionConfig>
  )
}

export default App
