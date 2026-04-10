import PageTransition from '../components/PageTransition'
import { useState } from 'react'
import { motion } from 'framer-motion'

const SOCIALS = [
  { label: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com/in/anshulsharma', color: '#0A66C2', desc: 'Connect with me professionally' },
  { label: 'GitHub', icon: '💻', url: 'https://github.com/anshulsharma', color: '#fff', desc: 'Check my code & projects' },
  { label: 'Email', icon: '✉️', url: 'mailto:anshul@yourdomain.com', color: '#FF5800', desc: 'anshul@yourdomain.com' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    // TODO: Wire to Lambda API endpoint
    // For now, show a "coming soon" message
    setSent(true)
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="section-title">Contact Me</h2>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left — Social links */}
          <div>
            <p className="text-white/60 leading-relaxed font-body mb-6">
              Have a project idea, collaboration proposal, or just want to say hi?
              I'd love to hear from you. Reach out via any channel below.
            </p>

            <div className="space-y-3">
              {SOCIALS.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 glass-card p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 no-underline group"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="font-display font-bold text-sm" style={{ color: s.color }}>{s.label}</div>
                    <div className="text-white/40 text-xs font-body">{s.desc}</div>
                  </div>
                  <span className="ml-auto text-white/20 group-hover:text-white/60 transition-colors">→</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right — Contact form */}
          <div>
            {sent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card text-center py-12"
              >
                <div className="text-5xl mb-4">🎉</div>
                <p className="font-display font-bold text-[#FFD500] text-lg">Message received!</p>
                <p className="text-white/50 text-sm mt-2 font-body">I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-white/60 text-sm mb-1 font-body">{f.label}</label>
                    <input
                      type={f.type}
                      required
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-white/60 text-sm mb-1 font-body">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell me what's on your mind..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm resize-none"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="btn-primary w-full">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
