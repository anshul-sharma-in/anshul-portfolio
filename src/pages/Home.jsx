import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RubiksCube3D from '../components/RubiksCube3D'
import RubiksNavGrid from '../components/RubiksNavGrid'

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

export default function Home() {
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
                className="w-full md:w-1/2"
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
                {/* Profile picture placeholder */}
                <div
                  className="w-40 h-40 rounded-full border-4 overflow-hidden flex items-center justify-center text-5xl font-bold text-white/30"
                  style={{
                    borderColor: '#FF5800',
                    boxShadow: '0 0 30px rgba(255,88,0,0.4)',
                    background: 'linear-gradient(135deg, #1a0500, #0a0a0a)',
                  }}
                >
                  {/* Replace src with your actual photo */}
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
              className="mt-10 mb-4 text-white/40 text-sm tracking-widest font-display uppercase"
            >
              — Click a block to explore —
            </motion.p>

            {/* 3x3 Navigation Grid */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="w-full max-w-lg"
            >
              <RubiksNavGrid />
            </motion.div>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-12 text-white/20 text-xs font-body text-center"
            >
              © 2026 Anshul Sharma · Built with ☕ + React + Three.js
            </motion.footer>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}
