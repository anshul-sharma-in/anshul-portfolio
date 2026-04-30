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
import Navbar from './components/Navbar'
import BrandLogo from './components/BrandLogo'
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
  const { isFunMode, toggleFunMode } = useFunMode()

  return (
    <>
      <ScrollToTop />
      {!isFunMode && <Navbar />}
      {isFunMode && (
        <motion.button
          onClick={toggleFunMode}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Switch to Professional Mode"
          className="fixed top-6 left-6 z-50 px-2 py-1 rounded-md"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
        >
          <BrandLogo size={32} />
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
            <Route path="/admin" element={<Interview adminMode />} />
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
