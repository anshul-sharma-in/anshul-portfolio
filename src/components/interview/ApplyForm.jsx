import { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'

const BENEFITS = [
  { icon: '🎯', text: 'Real interview questions used by top companies' },
  { icon: '💬', text: 'Honest, specific feedback on your answers' },
  { icon: '📚', text: 'Curated Q&A resources for Vue, .NET, AWS, DSA' },
  { icon: '⏱️', text: '45–60 min session tailored to your role & stack' },
]

const HOW_IT_WORKS = [
  { step: '01', text: 'Fill out the form below' },
  { step: '02', text: 'I email you with the schedule' },
  { step: '03', text: 'We do the mock interview' },
]

const INTERVIEW_TYPES = [
  'Technical',
  'System Design',
  'Behavioral',
  'Mixed',
]

export default function ApplyForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    role: '',
    tech_stack: '',
    interview_type: '',
    message: '',
  })
  const [preferredTimeRange, setPreferredTimeRange] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const trimmedName = form.name.trim()

      // Upload resume if provided
      let resumeUrl = null
      if (resumeFile) {
        // Client-side guard: 5 MB cap, allowed extensions only
        const MAX_BYTES = 5 * 1024 * 1024
        const ext = (resumeFile.name.split('.').pop() || '').toLowerCase()
        if (!['pdf', 'doc', 'docx'].includes(ext)) {
          throw new Error('Resume must be a PDF, DOC, or DOCX file.')
        }
        if (resumeFile.size > MAX_BYTES) {
          throw new Error('Resume must be 5 MB or smaller.')
        }
        const safeName = (trimmedName || 'applicant')
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase() || 'applicant'
        const fileName = `${Date.now()}-${safeName}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('resume')
          .upload(fileName, resumeFile, { upsert: false, contentType: resumeFile.type })
        if (uploadError) {
          throw new Error(`Resume upload failed: ${uploadError.message}`)
        }
        // Bucket is private; store the path. Admin UI signs URLs on demand.
        resumeUrl = `resume/${fileName}`
      }

      const { error } = await supabase.from('applications').insert([
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          experience: form.experience,
          role: form.role,
          tech_stack: form.tech_stack.trim(),
          interview_type: form.interview_type || null,
          message: form.message.trim(),
          preferred_time: preferredTimeRange || null,
          resume_url: resumeUrl,
        },
      ])
      if (error) throw error

      const adminPayload = {
        applicant_name: form.name,
        applicant_email: form.email,
        applicant_phone: form.phone || 'Not provided',
        applicant_experience: form.experience || 'Not specified',
        applicant_role: form.role || 'Not specified',
        applicant_tech_stack: form.tech_stack || 'Not specified',
        applicant_interview_type: form.interview_type || 'Not specified',
        applicant_message: form.message || 'No message',
        applicant_resume_url: resumeUrl,
        preferred_time: preferredTimeRange || null,
      }

      // Notify admin (best-effort)
      supabase.functions.invoke('notify-admin-new-application', { body: adminPayload }).catch(() => {})

      // Confirm receipt to applicant (best-effort)
      supabase.functions.invoke('notify-applicant-applied', {
        body: {
          to_email: form.email.trim().toLowerCase(),
          applicant_name: form.name,
          applicant_role: form.role || 'Not specified',
          applicant_interview_type: form.interview_type || null,
        },
      }).catch(() => {})

      setStatus('success')
    } catch (err) {
      setErrorMessage(err?.message || 'Something went wrong. Please try again.')
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
        <p className="text-gray-500 dark:text-white/60 text-sm mt-2 font-body">
          Your mock interview request has been submitted successfully. We'll share your interview schedule via email soon.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
      {/* Left: Benefits + How It Works */}
      <div className="space-y-8">
        <div>
          <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-1">
            What you get
          </h3>
          <p className="text-gray-500 dark:text-white/50 text-sm font-body mb-5">
            A real mock interview tailored to your role and stack.
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b.icon} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{b.icon}</span>
                <span className="text-gray-600 dark:text-white/70 text-sm font-body leading-relaxed">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 pt-6">
          <h4 className="font-display font-semibold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            How it works
          </h4>
          <ol className="space-y-3">
            {HOW_IT_WORKS.map((s) => (
              <li key={s.step} className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display text-white flex-shrink-0"
                  style={{ background: '#FF5800' }}
                >
                  {s.step}
                </span>
                <span className="text-gray-600 dark:text-white/70 text-sm font-body">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Right: Form */}
      <div>
        <form onSubmit={handleSubmit} className="glass-card space-y-5">
          <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Apply for Mock Interview</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Full Name *</label>
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Email *</label>
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Phone</label>
              <input
                name="phone"
                type="tel"
                maxLength={15}
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Years of Experience</label>
              <select
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Role *</label>
              <select
                name="role"
                required
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              >
                <option value="">Select role</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Fullstack</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">
                Preferred Time{' '}
                <span className="text-gray-400 dark:text-white/30 font-normal">(optional)</span>
              </label>
              <select
                value={preferredTimeRange}
                onChange={(e) => setPreferredTimeRange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              >
                <option value="">Flexible</option>
                <option value="Morning (9am–12pm)">Morning (9am–12pm)</option>
                <option value="Afternoon (12pm–5pm)">Afternoon (12pm–5pm)</option>
                <option value="Evening (5pm–9pm)">Evening (5pm–9pm)</option>
                <option value="Weekend">Weekend</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Tech Stack</label>
              <input
                name="tech_stack"
                maxLength={200}
                placeholder="e.g. React, Node.js, TypeScript, AWS"
                value={form.tech_stack}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Interview Type</label>
              <select
                name="interview_type"
                value={form.interview_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
              >
                <option value="">Select type</option>
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">Additional Notes</label>
            <textarea
              name="message"
              rows={3}
              maxLength={1000}
              placeholder="What areas do you want to focus on? Any specific topics?"
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-500 dark:text-white/60 text-sm mb-1 font-body">
              Resume{' '}
              <span className="text-gray-400 dark:text-white/30 font-normal">(optional, PDF)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0] || null)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#FF5800] file:text-white"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-sm font-body">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
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
    </div>
  )
}
