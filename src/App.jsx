import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Skills from './pages/Skills'
import Experience from './pages/Blog'
import Contact from './pages/Contact'
import Interview from './pages/Interview'
import HomeLogoButton from './components/HomeLogoButton'
import Navbar from './components/Navbar'
import { FunModeProvider, useFunMode } from './context/FunModeContext'
import './index.css'

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { isFunMode, toggleFunMode } = useFunMode()

  return (
    <>
      <ScrollToTop />
      {!isFunMode && <Navbar />}
      {isFunMode && !isHome && <HomeLogoButton />}
      {isFunMode && (
        <motion.button
          onClick={toggleFunMode}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          title="Switch to Professional Mode"
          className="fixed top-6 right-6 z-50 w-12 h-12 rounded-lg shadow-2xl flex items-center justify-center text-2xl bg-[#1a1a1a] border border-white/20"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.08)' }}
        >
          💼
        </motion.button>
      )}
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <FunModeProvider>
        <AnimatedRoutes />
      </FunModeProvider>
    </BrowserRouter>
  )
}
