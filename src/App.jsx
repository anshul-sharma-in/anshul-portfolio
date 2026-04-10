import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Resume from './pages/Resume'
import Skills from './pages/Skills'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import Interview from './pages/Interview'
import HomeLogoButton from './components/HomeLogoButton'
import './index.css'

function AnimatedRoutes() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/interview" element={<Interview />} />
        </Routes>
      </AnimatePresence>
      {!isHome && <HomeLogoButton />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
