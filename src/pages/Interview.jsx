import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import ApplyForm from '../components/interview/ApplyForm'
import ResourcesSection from '../components/interview/ResourcesSection'
import { useNavigate } from 'react-router-dom'
import QALibrary from '../components/interview/QALibrary'
import CandidateManager from '../components/interview/CandidateManager'
import ResultsTab from '../components/interview/ResultsTab'
import { supabase } from '../lib/supabaseClient'

const SECTIONS = [
  { id: 'apply', label: '📋 Apply', public: true },
  { id: 'resources', label: '📚 Resources', public: true },
  { id: 'qa', label: '❓ Q&A', public: false, adminOnly: true },
  { id: 'candidates', label: '👥 Candidates', public: false, adminOnly: true },
  { id: 'results', label: '📊 Results', public: false, adminOnly: true },
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
        style={{ background: 'var(--modal-overlay)' }}
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
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">Admin Login</h3>
        <p className="text-gray-400 dark:text-white/40 text-sm font-body mb-6">
          {step === 'email' ? 'Enter your email to receive a one-time code.' : `Code sent to ${email}`}
        </p>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
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
              <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body">8-digit code from email</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                required
                autoFocus
                placeholder="00000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-center tracking-widest text-lg focus:outline-none focus:border-[#FF5800] transition-colors font-body"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-body">{error}</p>}
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify & Login →'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              className="w-full text-gray-400 dark:text-white/40 text-sm font-body hover:text-gray-600 dark:hover:text-white/60 transition-colors"
            >
              ← Resend / change email
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Interview({ adminMode = false }) {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeSection, setActiveSection] = useState('apply')

  // Restore existing session on mount (e.g. page refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAdmin({ email: data.session.user.email })
      setSessionChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAdmin(null); setActiveSection('apply') }
    })
    return () => subscription.unsubscribe()
  }, [])

  // On /admin, auto-open the login modal once we know there's no session.
  useEffect(() => {
    if (adminMode && sessionChecked && !admin) setShowLogin(true)
  }, [adminMode, sessionChecked, admin])

  const handleLogin = (adminData) => {
    setAdmin(adminData)
    setShowLogin(false)
    setActiveSection('candidates')
    if (!adminMode) navigate('/admin', { replace: true })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
    setActiveSection('apply')
    if (adminMode) navigate('/interview', { replace: true })
  }

  const visibleSections = SECTIONS.filter((s) => s.public || admin)
  const showAdminStrip = adminMode || !!admin

  return (
    <PageTransition>
      {/* Navigation tabs — topmost element, sticks below main navbar */}
      <div className="sticky z-40 border-b" style={{ top: 'var(--navbar-height)', background: 'var(--tabs-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--tabs-border)' }}>
        {/* Admin strip — only visible on /admin route or when logged in */}
        {showAdminStrip && (
          <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center justify-end gap-3 text-xs font-body border-b border-gray-100 dark:border-white/5">
            {admin ? (
              <>
                <span className="text-gray-500 dark:text-white/50 truncate max-w-[180px] sm:max-w-none">
                  👤 {admin.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 underline whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-400 dark:text-white/40 hover:text-[#FF5800] transition-colors whitespace-nowrap"
              >
                Admin Login
              </button>
            )}
          </div>
        )}

        {/* Tab buttons — full width, scrollable */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {visibleSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="flex-shrink-0 px-5 py-3.5 text-sm font-body font-semibold transition-all duration-200 border-b-2"
                style={{
                  borderColor: activeSection === s.id ? '#FF5800' : 'transparent',
                  color: activeSection === s.id ? '#FF5800' : 'var(--tab-inactive-color)',
                }}
              >
                {s.label}
                {s.adminOnly && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[#FF5800]/20 text-[#FF5800]">Admin</span>
                )}
              </button>
            ))}
          </div>
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
            {activeSection === 'apply' && (
              <>
                {/* Hero banner — only shown in Apply tab */}
                <div
                  className="relative overflow-hidden rounded-2xl mb-10"
                  style={{
                    background: 'var(--interview-hero-bg)',
                    border: '1px solid rgba(255,88,0,0.15)',
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

                  <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
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
                      className="font-body font-light text-gray-500 dark:text-white/60 text-2xl md:text-3xl tracking-[0.3em] uppercase mb-1"
                    >
                      Interview
                    </motion.h1>

                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, type: 'spring' }}
                      className="font-stylish font-black text-5xl md:text-7xl text-gray-900 dark:text-white"
                      style={{ textShadow: '0 0 60px rgba(255,88,0,0.4)' }}
                    >
                      Anshul Sharma
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-5 text-gray-500 dark:text-white/50 text-base font-body max-w-2xl mx-auto leading-relaxed"
                    >
                      Personalized mock interviews to help you crack Vue, JavaScript, .NET, AWS, and more.
                      Apply for a session, download free study material, or explore the Q&amp;A library.
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
                  </div>
                </div>

                <ApplyForm />
              </>
            )}
            {activeSection === 'resources' && <ResourcesSection />}
            {activeSection === 'qa' && admin && <QALibrary />}
            {activeSection === 'candidates' && admin && <CandidateManager />}
            {activeSection === 'results' && admin && <ResultsTab />}
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
