import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import ApplyForm from '../components/interview/ApplyForm'
import ResourcesSection from '../components/interview/ResourcesSection'
import QALibrary from '../components/interview/QALibrary'
import CandidateManager from '../components/interview/CandidateManager'
import QAManager from '../components/interview/QAManager'
import { supabase } from '../lib/supabaseClient'

const SECTIONS = [
  { id: 'apply', label: '📋 Apply', public: true },
  { id: 'resources', label: '📚 Resources', public: true },
  { id: 'qa', label: '❓ Q&A Library', public: false, adminOnly: true },
  { id: 'candidates', label: '👥 Candidates', public: false, adminOnly: true },
  { id: 'qamanager', label: '⚙️ Q&A Manager', public: false, adminOnly: true },
]

function AdminLoginModal({ onLogin, onClose }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (otpError) {
      setError(otpError.message)
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })
    if (verifyError || !data.session) {
      setError(verifyError?.message || 'Invalid or expired code.')
    } else {
      onLogin({ email: data.user.email })
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        className="glass-card w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid rgba(255,88,0,0.4)' }}
      >
        <h3 className="font-display font-bold text-xl text-white mb-2">Admin Login</h3>
        <p className="text-white/40 text-sm font-body mb-6">
          {step === 'email' ? 'Enter your email to receive a one-time code.' : `Code sent to ${email}`}
        </p>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1 font-body">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-body">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send Code →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1 font-body">8-digit code from email</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                required
                autoFocus
                placeholder="00000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-center tracking-widest text-lg focus:outline-none focus:border-[#FF5800] transition-colors font-body"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-body">{error}</p>}
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify & Login →'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              className="w-full text-white/40 text-sm font-body hover:text-white/60 transition-colors"
            >
              ← Resend / change email
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Interview() {
  const [admin, setAdmin] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [activeSection, setActiveSection] = useState('apply')

  // Restore existing session on mount (e.g. page refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAdmin({ email: data.session.user.email })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAdmin(null); setActiveSection('apply') }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (adminData) => {
    setAdmin(adminData)
    setShowLogin(false)
    setActiveSection('candidates')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
    setActiveSection('apply')
  }

  const visibleSections = SECTIONS.filter((s) => s.public || admin)

  return (
    <PageTransition>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at top, #0a0500 0%, #0a0a0a 60%)',
          borderBottom: '1px solid rgba(255,88,0,0.15)',
        }}
      >
        {/* Background rubik dots */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
          <div className="grid grid-cols-10 gap-3 p-8 h-full">
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm aspect-square"
                style={{ background: ['#FF5800','#0045AD','#FFD500','#009E60','#C41E3A','#fff'][i % 6] }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-[#FF5800] text-sm tracking-[0.4em] uppercase mb-3"
          >
            — Crack Your Dream Job —
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="font-body font-light text-white/60 text-2xl md:text-3xl tracking-[0.3em] uppercase mb-1"
          >
            Interview
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring' }}
            className="font-stylish font-black text-5xl md:text-7xl text-white"
            style={{ textShadow: '0 0 60px rgba(255,88,0,0.4)' }}
          >
            Anshul Sharma
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-white/50 text-base font-body max-w-2xl mx-auto leading-relaxed"
          >
            Personalized mock interviews to help you crack Vue, JavaScript, .NET, AWS, and more.
            Apply for a session, download free study material, or explore the Q&A library.
          </motion.p>

          {/* Rubik color strip */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex justify-center gap-1.5"
          >
            {['#FF5800','#FFD500','#009E60','#0045AD','#C41E3A','#ffffff'].map((c) => (
              <div key={c} className="w-8 h-2 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </motion.div>

          {/* Admin toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex justify-center"
          >
            {admin ? (
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs font-body">Admin: {admin.email}</span>
                <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 font-body underline">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-white/20 hover:text-white/50 text-xs font-body transition-colors"
              >
                Admin Login
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="sticky top-0 z-40 border-b border-white/10" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto hide-scrollbar">
          {visibleSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="flex-shrink-0 px-5 py-4 text-sm font-body font-semibold transition-all duration-200 border-b-2"
              style={{
                borderColor: activeSection === s.id ? '#FF5800' : 'transparent',
                color: activeSection === s.id ? '#FF5800' : 'rgba(255,255,255,0.45)',
              }}
            >
              {s.label}
              {s.adminOnly && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-[#FF5800]/20 text-[#FF5800]">Admin</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Section content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'apply' && <ApplyForm />}
            {activeSection === 'resources' && <ResourcesSection />}
            {activeSection === 'qa' && admin && <QALibrary token={admin.token} />}
            {activeSection === 'candidates' && admin && <CandidateManager />}
            {activeSection === 'qamanager' && admin && <QAManager token={admin.token} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLogin && <AdminLoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      </AnimatePresence>
    </PageTransition>
  )
}
