import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import RubiksCube3D, { MiniRubiksCube } from '../components/RubiksCube3D'
import InteractiveCube from '../components/InteractiveCube'
import HowItWorks from '../components/HowItWorks'
import { useFunMode } from '../context/FunModeContext'

// Splash screen durations
const SPLASH_DURATION = 3200 // ms before transitioning to main content

function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, SPLASH_DURATION)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]"
      style={{ background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0a 70%)' }}
    >
      {/* Rubik's grid background dots */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="grid grid-cols-12 gap-4 p-8 h-full w-full">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                background: ['#FF5800','#0045AD','#FFD500','#009E60','#C41E3A','#fff'][i % 6],
                aspectRatio: '1',
                animationDelay: `${(i * 0.05) % 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative z-10 text-center px-6"
      >
        {/* Name */}
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-display font-black text-5xl md:text-7xl tracking-wider mb-2"
          style={{
            background: 'linear-gradient(135deg, #FF5800, #FFD500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ANSHUL
        </motion.h1>
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display font-black text-5xl md:text-7xl tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #FFD500, #009E60)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SHARMA
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-4 text-white/60 text-lg font-light tracking-widest font-body"
        >
          Senior Software Engineer · Rubik's Cube Enthusiast
        </motion.p>

        {/* Loading cube dots row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 flex justify-center gap-2"
        >
          {['#FF5800','#FFD500','#009E60','#0045AD','#C41E3A'].map((c, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: c }}
              animate={{ y: [0, -8, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 1.5 + i * 0.1, repeat: Infinity, repeatDelay: 0.5 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── Fun Mode: original splash + cube nav ───────────────────────────────────

function FunModeHome() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {splashDone && (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center min-h-screen px-4 pb-16"
            style={{ background: 'radial-gradient(ellipse at top, #1a0500 0%, #0a0a0a 60%)' }}
          >
            {/* Header */}
            <motion.header
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-5xl pt-10 pb-4 flex flex-col items-center"
            >
              <h1
                className="font-display font-black text-4xl md:text-6xl tracking-wider text-center"
                style={{
                  background: 'linear-gradient(135deg, #FF5800, #FFD500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ANSHUL SHARMA
              </h1>
              <p className="mt-2 text-white/50 text-sm tracking-widest font-body uppercase">
                Senior Software Engineer · Rubik's Cube Enthusiast
              </p>
            </motion.header>

            {/* 3D Cube + Photo row */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 mt-6">
              {/* 3D Cube */}
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="w-full md:w-1/2 relative"
              >
                <RubiksCube3D height="360px" />
              </motion.div>

              {/* Profile photo + bio */}
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex flex-col items-center md:items-start gap-4 text-center md:text-left"
              >
                <div
                  className="w-40 h-40 rounded-full border-4 overflow-hidden flex items-center justify-center text-5xl font-bold text-white/30"
                  style={{
                    borderColor: '#FF5800',
                    boxShadow: '0 0 30px rgba(255,88,0,0.4)',
                    background: 'linear-gradient(135deg, #1a0500, #0a0a0a)',
                  }}
                >
                  AS
                </div>

                <div>
                  <p className="text-white/70 text-base leading-relaxed max-w-sm font-body">
                    Passionate software developer who loves solving complex problems —
                    both in code and on the Rubik's cube. Building scalable systems with
                    Vue, JavaScript, .NET, and AWS, mentoring aspiring engineers, and
                    turning coffee into clean code.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    {['JavaScript', 'Vue', '.NET', 'AWS', "Rubik's Cube 🧩"].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full border border-white/20 text-white/70 font-body"
                        style={{ background: 'rgba(255,88,0,0.1)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 mb-2 text-white/40 text-sm tracking-widest font-display uppercase"
            >
              ― Drag to rotate · Click a face to explore ―
            </motion.p>

            {/* Interactive Navigation Cube */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="w-full max-w-xl"
            >
              <InteractiveCube />
            </motion.div>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-12 text-white/20 text-xs font-body text-center"
            >
              <p>© 2026 Anshul Sharma · Built with ☕ + React + Three.js</p>
            </motion.footer>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Professional Mode: clean landing page ──────────────────────────────────

function ProfessionalHome() {
  const navigate = useNavigate()
  const { toggleFunMode } = useFunMode()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-display text-[#FF5800] text-xs tracking-[0.4em] uppercase mb-5">
            Senior Software Engineer
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-gray-900 mb-5 leading-tight">
            Mock Interviews for{' '}
            <span style={{ color: '#FF5800' }}>Real-World</span> Preparation
          </h1>
          <p className="text-gray-500 text-lg font-body max-w-2xl mx-auto leading-relaxed mb-10">
            Personalized mock interviews for Vue, JavaScript, .NET, and AWS.
            Get honest feedback and guidance to crack your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/projects')} className="btn-outline">
              View Portfolio
            </button>
            <button onClick={() => navigate('/interview')} className="btn-primary">
              Book Mock Interview →
            </button>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <div className="border-t border-gray-200">
        <HowItWorks />
      </div>

      {/* Brief about */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-gray-200">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-700 text-lg font-body leading-relaxed">
            I'm <span className="font-semibold" style={{ color: '#FF5800' }}>Anshul Sharma</span> — a Senior Software Engineer at Morningstar
            with 5+ years in full-stack development (Vue, .NET, AWS).
            I conduct mock interviews to help developers land their dream roles.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/about')} className="btn-outline text-sm">
              More About Me
            </button>
            <button onClick={() => navigate('/contact')} className="btn-primary text-sm">
              Get in Touch
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-400 font-body">
          <span>© 2026 Anshul Sharma</span>
          <button
            onClick={toggleFunMode}
            title="Switch to Cube Mode"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MiniRubiksCube size={34} />
          </button>
        </div>
      </footer>
    </div>
  )
}

// ─── Root: switch based on mode ──────────────────────────────────────────────

export default function Home() {
  const { isFunMode } = useFunMode()
  return isFunMode ? <FunModeHome /> : <ProfessionalHome />
}
