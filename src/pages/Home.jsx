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

const RUBIK_PALETTE = ['#FF5800', '#0045AD', '#009E60', '#C41E3A', '#FFD500', '#0D7377']

const TECH_CHIPS = [
  'Vue', 'JavaScript', 'React', '.NET', 'SQL', 'AWS', 'System Design',
]

const VALUE_ITEMS = [
  { icon: '🎤', title: '1:1 live mock interview', desc: 'Real-time session with a working senior engineer.' },
  { icon: '📄', title: 'Resume review', desc: 'Targeted feedback to make your resume recruiter-ready.' },
  { icon: '🎯', title: 'Role-specific questions', desc: 'Frontend, backend, full-stack, or system design — your call.' },
  { icon: '💬', title: 'Honest feedback', desc: 'No sugar-coating. You hear exactly where you stand.' },
  { icon: '🗺️', title: 'Improvement roadmap', desc: 'A clear plan of what to fix before your real interview.' },
  { icon: '📚', title: 'Interview resources', desc: 'Curated Q&A library and study material to keep practicing.' },
]

// TODO: replace with real testimonials once collected.
const TESTIMONIALS = [
  { quote: 'Helped me crack frontend interviews after 3 failed attempts.', author: 'Sheldon C. — Frontend Developer' },
  { quote: 'The honest feedback is what made the difference.', author: 'Howard W. — Full Stack Engineer' },
  { quote: 'Got a clear roadmap and landed my first .NET role.', author: 'Rajesh K. — Backend Developer' },
]

const FAQS = [
  { q: 'Is this free?', a: 'Yes — everything is free right now. I personally review each application and run mock interviews at no cost while building this platform.' },
  { q: 'Who is this for?', a: 'Frontend, backend, full-stack, and system design candidates preparing for tech interviews.' },
  { q: 'What technologies do you cover?', a: 'Vue, JavaScript, React, .NET, SQL, AWS, and System Design.' },
  { q: 'How long is the interview?', a: 'Typically 45–60 minutes including live coding/discussion and structured feedback.' },
  { q: 'Do you provide feedback afterward?', a: "Yes — you'll get a written summary covering strengths, gaps, and a clear improvement roadmap." },
]

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
          <p className="font-display text-[#FF5800] text-xs tracking-[0.4em] uppercase mb-2">
            Mock Interview Coach
          </p>
          <p className="font-body text-gray-700 text-sm md:text-base mb-1">
            For Frontend, Backend &amp; Full Stack Developers
          </p>
          <p className="font-body text-gray-500 text-xs md:text-sm mb-7">
            Practice Before Your Real Interview
          </p>

          <h1 className="font-display font-bold text-4xl md:text-6xl text-gray-900 mb-5 leading-tight">
            Mock Interviews for{' '}
            <span style={{ color: '#FF5800' }}>Software Engineers</span>
          </h1>
          <p className="text-gray-500 text-lg font-body max-w-2xl mx-auto leading-relaxed mb-10">
            Practice real technical interviews with personalized feedback for frontend, backend,
            full-stack, and system design roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/interview')} className="btn-primary">
              Apply Now →
            </button>
          </div>

          <p className="mt-6 text-sm font-body italic text-gray-500">
            I personally review each application and take limited sessions every week.
          </p>
          <p className="mt-2 text-xs font-body text-gray-400">
            Built by a Morningstar engineer with 5+ years of experience in Vue, .NET, and AWS.
          </p>
        </motion.div>
      </section>

      {/* Technologies strip */}
      <section className="border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <p className="text-[#FF5800] font-display text-sm tracking-widest uppercase mb-2">
            Technologies I Coach
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-6">
            Languages, Frameworks &amp; Domains
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {TECH_CHIPS.map((t, i) => {
              const c = RUBIK_PALETTE[i % RUBIK_PALETTE.length]
              return (
                <span
                  key={t}
                  className="px-3 py-1.5 text-sm rounded-full font-body font-medium text-gray-700"
                  style={{ background: `${c}1a`, border: `1px solid ${c}55` }}
                >
                  {t}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <div className="border-t border-gray-200">
        <HowItWorks />
      </div>

      {/* What You'll Get */}
      <section id="what-you-get" className="border-t border-gray-200 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-[#FF5800] font-display text-sm tracking-widest uppercase mb-2">
              In Every Session
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900">
              What You'll Get
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUE_ITEMS.map((v, i) => {
              const c = RUBIK_PALETTE[i % RUBIK_PALETTE.length]
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                  style={{ borderTop: `3px solid ${c}` }}
                >
                  <div className="text-2xl mb-2">{v.icon}</div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm font-body text-gray-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => navigate('/interview')} className="btn-primary">
              Apply Now →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-[#FF5800] font-display text-sm tracking-widest uppercase mb-2">
              Real Outcomes
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900">
              What Candidates Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => {
              const c = RUBIK_PALETTE[i % RUBIK_PALETTE.length]
              return (
                <motion.div
                  key={t.author}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-xl bg-white border border-gray-200"
                  style={{ borderLeft: `3px solid ${c}` }}
                >
                  <p className="text-gray-700 font-body text-sm leading-relaxed mb-4">
                    “{t.quote}”
                  </p>
                  <p className="text-xs font-body uppercase tracking-wider text-gray-400">
                    — {t.author}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-[#FF5800] font-display text-sm tracking-widest uppercase mb-2">
              Good To Know
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-gray-200 bg-white open:border-[#FF5800]/40"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 font-display font-semibold text-gray-900 text-sm md:text-base">
                  {f.q}
                  <span className="text-[#FF5800] text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm font-body text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

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
            <button onClick={() => navigate('/contact')} className="btn-outline text-sm">
              Contact Me
            </button>
            <button onClick={() => navigate('/interview')} className="btn-primary text-sm">
              Apply for Interview
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
