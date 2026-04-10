import { useState } from 'react'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function ApplyForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    message: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Server error')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card text-center py-12 max-w-lg mx-auto"
      >
        <div className="text-5xl mb-4">🎯</div>
        <p className="font-display font-bold text-[#FFD500] text-xl">Application Submitted!</p>
        <p className="text-white/60 text-sm mt-2 font-body">
          I'll review your application and reach out to your email within 2–3 days.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="glass-card space-y-5">
        <h3 className="font-display font-bold text-lg text-white mb-2">Apply for Mock Interview</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1 font-body">Full Name *</label>
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1 font-body">Email *</label>
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1 font-body">Phone</label>
            <input
              name="phone"
              type="tel"
              maxLength={15}
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1 font-body">Years of Experience</label>
            <select
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
            >
              <option value="">Select</option>
              <option value="fresher">Fresher</option>
              <option value="0-1">0–1 year</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1 font-body">Message / Tech Focus Areas</label>
          <textarea
            name="message"
            rows={4}
            maxLength={1000}
            placeholder="Tell me your goals, which tech you want to practice (Java, React, DSA...), etc."
            value={form.message}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm resize-none"
          />
        </div>

        {status === 'error' && (
          <p className="text-red-400 text-sm font-body">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary w-full"
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Application →'}
        </button>
      </form>
    </div>
  )
}
