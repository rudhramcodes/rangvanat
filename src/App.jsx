import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Preloader from './components/Preloader'
import Home from './pages/Home'
import Placeholder from './components/Placeholder'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const windowLoaded = () =>
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((res) => window.addEventListener('load', res, { once: true }))

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [showPreloader, setShowPreloader] = useState(true)

  useEffect(() => {
    Promise.race([
      Promise.all([document.fonts.ready, windowLoaded()]),
      // never let the preloader lock the site — exit at worst after 4s
      new Promise((res) => setTimeout(res, 4000)),
    ]).then(() => setIsLoading(false))
  }, [])

  return (
    <>
      {showPreloader && <Preloader isLoading={isLoading} onDone={() => setShowPreloader(false)} />}
      <div className="grain-overlay" aria-hidden />
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Placeholder title="Our Story" />} />
            <Route path="/collections" element={<Placeholder title="Collections" />} />
            <Route path="/craftsmanship" element={<Placeholder title="The Craft" />} />
            <Route path="/artisans" element={<Placeholder title="Artisans" />} />
            <Route path="/contact" element={<Placeholder title="Contact" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
