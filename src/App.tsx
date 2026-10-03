import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { Fondo } from './components/Fondo'
import { useRuta } from './lib/useRuta'
import { PanelAdmin } from './pages/PanelAdmin'
import { VistaComoAportar } from './pages/VistaComoAportar'
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
      <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center gap-8 px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        {ruta === 'admin' ? (
          <PanelAdmin />
        ) : ruta === 'ranking' ? (
          <VistaRanking />
        ) : ruta === 'aportar' ? (
          <VistaComoAportar />
        ) : (
          <VistaPublica />
        )}
      </main>
    </MotionConfig>
  )
}

export default App
